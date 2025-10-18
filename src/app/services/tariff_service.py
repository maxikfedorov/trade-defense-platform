# src\app\services\tariff_service.py
import pandas as pd
import yaml
import numpy as np
from pathlib import Path
from sqlalchemy import create_engine
from app.core.config import settings

def load_config():
    config_path = Path(__file__).parent.parent.parent.parent / 'config' / 'config.yaml'
    with open(config_path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def load_data():
    engine = create_engine(settings.DATABASE_URL)
    data = {}
    df = pd.read_sql_table('case_data', engine)
    data['case_data'] = df.to_dict('records')
    df = pd.read_sql_table('tnved_okpd_grouped', engine)
    grouped = df.groupby(['tnved_code', 'tnved_name']).apply(
        lambda x: {
            'tnved_code': x['tnved_code'].iloc[0],
            'tnved_name': x['tnved_name'].iloc[0],
            'okpd_codes': [{'okpd_code': row['okpd_code'], 'okpd_name': row['okpd_name']} 
                          for _, row in x.iterrows()]
        }
    ).tolist()
    data['tnved_okpd_grouped'] = grouped
    df = pd.read_sql_table('tnved_okpd_mapping', engine)
    data['tnved_okpd_mapping'] = df.to_dict('records')
    df = pd.read_sql_table('tws_tnved', engine)
    data['tws_tnved'] = df.to_dict('records')
    df_value = pd.read_sql_table('import_statistics_value', engine)
    df_weight = pd.read_sql_table('import_statistics_weight', engine)
    import_stats = {}
    for category in df_value['category'].unique():
        import_stats[category] = {
            'value': df_value[df_value['category'] == category].drop('category', axis=1).to_dict('records'),
            'weight': df_weight[df_weight['category'] == category].drop('category', axis=1).to_dict('records')
        }
    data['import_stats'] = import_stats
    df = pd.read_sql_table('countries_list', engine)
    data['countries'] = df.to_dict('records')
    data['config'] = load_config()
    return data

def normalize_tnved_code(tnved_input):
    cleaned = str(tnved_input).replace(' ', '').replace('-', '')
    return cleaned

def get_tnved_info(tnved_code, data):
    tnved_info = {}
    for item in data['tnved_okpd_grouped']:
        if item['tnved_code'] == tnved_code or item['tnved_code'].replace(' ', '') == normalize_tnved_code(tnved_code):
            tnved_info['tnved_code'] = item['tnved_code']
            tnved_info['tnved_name'] = item['tnved_name']
            tnved_info['okpd_codes'] = item['okpd_codes']
            break
    normalized = normalize_tnved_code(tnved_code)
    for item in data['tws_tnved']:
        if str(item['Код']).startswith(normalized):
            tnved_info['tariff'] = item['Тариф']
            break
    return tnved_info

def map_tnved_to_product(tnved_input, config):
    normalized = normalize_tnved_code(tnved_input)
    if normalized in config['tnved_product_mapping']:
        return config['tnved_product_mapping'][normalized]
    for length in [6, 4]:
        prefix = normalized[:length]
        if prefix in config['tnved_product_mapping']:
            return config['tnved_product_mapping'][prefix]
    return None

def collect_product_data(tnved_input, product_name, data):
    result = {}
    config = data['config']
    tnved_code = tnved_input if ' ' in str(tnved_input) else tnved_input
    tnved_info = get_tnved_info(tnved_code, data)
    result['tnved_info'] = tnved_info
    if not product_name:
        product_key = map_tnved_to_product(tnved_input, config)
        product_name = config['product_names'].get(product_key, '') if product_key else ''
    for item in data['case_data']:
        field_name = item['Unnamed: 0']
        if product_name in item:
            result[field_name] = item[product_name]
    product_key = map_tnved_to_product(tnved_input, config)
    if product_key and product_key in data['import_stats']:
        result['import_value'] = data['import_stats'][product_key]['value']
        result['import_weight'] = data['import_stats'][product_key]['weight']
    result['countries'] = data['countries']
    result['product_name'] = product_name
    return result

def parse_production_consumption(value_str):
    years = {}
    lines = value_str.strip().split('\n')
    for line in lines:
        parts = line.split(' - ')
        year = int(parts[0])
        value = float(parts[1].replace(' млн $', ''))
        years[year] = value
    return years

def classify_countries(countries_data):
    friendly = {}
    unfriendly = {}
    for country in countries_data:
        country_name = country['Страна']
        status = country['Недружественная ']
        if status == 'Дружественная страна':
            friendly[country_name] = True
        else:
            unfriendly[country_name] = True
    return friendly, unfriendly

def calculate_metrics(import_data_value, import_data_weight, friendly_countries, unfriendly_countries):
    metrics = {}
    df_value = pd.DataFrame(import_data_value)
    df_weight = pd.DataFrame(import_data_weight)
    df_value['is_unfriendly'] = df_value['Список стран-продавцов в Россию'].apply(
        lambda x: x in unfriendly_countries if x != 'World' else False
    )
    years = [col for col in df_value.columns if 'млн $' in col]
    last_year = years[-1]
    prev_year = years[-2] if len(years) > 1 else None
    world_value = df_value[df_value['Список стран-продавцов в Россию'] == 'World'][last_year].values[0]
    unfriendly_value = df_value[df_value['is_unfriendly']][last_year].sum()
    metrics['unfriendly_share'] = unfriendly_value / world_value if world_value > 0 else 0
    if prev_year:
        unfriendly_value_prev = df_value[df_value['is_unfriendly']][prev_year].sum()
        metrics['unfriendly_growth'] = unfriendly_value - unfriendly_value_prev
    else:
        metrics['unfriendly_growth'] = 0
    top1_country = df_value[df_value['Список стран-продавцов в Россию'] != 'World'].iloc[0]
    top1_name = top1_country['Список стран-продавцов в Россию']
    year_weight = [col for col in df_weight.columns if 'тонны' in col][-1]
    top1_weight = df_weight[df_weight['Список стран-продавцов в Россию'] == top1_name][year_weight].values
    top1_weight = top1_weight[0] if len(top1_weight) > 0 else 1
    metrics['top1_avg_price'] = top1_country[last_year] / top1_weight if top1_weight > 0 else 0
    other_countries = df_value[
        (df_value['Список стран-продавцов в Россию'] != 'World') &
        (df_value['Список стран-продавцов в Россию'] != top1_name)
    ]
    other_values = []
    for _, row in other_countries.iterrows():
        country_name = row['Список стран-продавцов в Россию']
        country_weight_row = df_weight[df_weight['Список стран-продавцов в Россию'] == country_name]
        if not country_weight_row.empty:
            weight = country_weight_row[year_weight].values[0]
            if weight > 0:
                other_values.append(row[last_year] / weight)
    metrics['other_avg_price'] = np.mean(other_values) if other_values else 0
    return metrics

def analyze_tariff_measures(product_data, metrics):
    tariff_rate = product_data.get('Ставка таможенной пошлины', 0)
    wto_rate = product_data.get('Ставка таможенной пошлины в рамках обязательства России в ВТО', 0)
    production = parse_production_consumption(product_data.get('Объем производства', '2024 - 0 млн $'))
    consumption = parse_production_consumption(product_data.get('Объем потребления', '2024 - 0 млн $'))
    last_year = max(production.keys())
    prod_value = production[last_year]
    cons_value = consumption[last_year]
    unfriendly_share = metrics['unfriendly_share']
    unfriendly_growth = metrics['unfriendly_growth']
    measures = []
    reasoning = []
    if unfriendly_share >= 0.3 and unfriendly_growth >= 0:
        if prod_value >= cons_value:
            measures.append('Мера 2')
            reasoning.append('Доля НС >= 30%, производство >= потребления')
        else:
            measures.append('Мера 6')
            reasoning.append('Производство < потребления')
    else:
        if wto_rate > tariff_rate:
            if prod_value >= cons_value:
                measures.append('Мера 1')
                reasoning.append('Возможность повышения тарифа, производство >= потребления')
            else:
                measures.append('Мера 6')
                reasoning.append('Производство < потребления')
        elif wto_rate == tariff_rate:
            if prod_value < cons_value:
                if unfriendly_growth > 0 and metrics['top1_avg_price'] < metrics['other_avg_price']:
                    measures.append('Мера 3')
                    reasoning.append('Антидемпинговая мера: СКЦ топ-1 ниже других')
                else:
                    measures.append('Мера 6')
                    reasoning.append('Условия для антидемпинговых мер не выполнены')
            else:
                measures.append('Мера 6')
                reasoning.append('Тариф на максимуме, производство >= потребления')
    return measures, reasoning

def analyze_nontariff_measures(product_data):
    production = parse_production_consumption(product_data.get('Объем производства', '2024 - 0 млн $'))
    consumption = parse_production_consumption(product_data.get('Объем потребления', '2024 - 0 млн $'))
    last_year = max(production.keys())
    prod_value = production[last_year]
    cons_value = consumption[last_year]
    measures = []
    reasoning = []
    if prod_value < cons_value:
        measures.append('Мера 6')
        reasoning.append('Производство < потребления - нетарифные меры не применимы')
    else:
        has_certification = product_data.get('Присутствие в технических регламентах (сертификация)', 'нет') == 'да'
        if has_certification:
            measures.append('Мера 5')
            reasoning.append('Применима мера сертификации')
        else:
            measures.append('Мера 4')
            reasoning.append('Возможно применение мер госзакупок')
    return measures, reasoning

def main_algorithm(tnved_input, product_name=None):
    data = load_data()
    product_data = collect_product_data(tnved_input, product_name, data)
    friendly, unfriendly = classify_countries(product_data['countries'])
    metrics = calculate_metrics(
        product_data['import_value'],
        product_data['import_weight'],
        friendly,
        unfriendly
    )
    tariff_measures, tariff_reasoning = analyze_tariff_measures(product_data, metrics)
    nontariff_measures, nontariff_reasoning = analyze_nontariff_measures(product_data)
    result = {
        'metadata': {
            'tnved_code': product_data['tnved_info'].get('tnved_code'),
            'tnved_name': product_data['tnved_info'].get('tnved_name'),
            'okpd_codes': product_data['tnved_info'].get('okpd_codes', []),
            'product_name': product_data.get('product_name'),
            'current_tariff': product_data['tnved_info'].get('tariff')
        },
        'product_info': {
            'tariff_rate': product_data.get('Ставка таможенной пошлины', 0),
            'wto_rate': product_data.get('Ставка таможенной пошлины в рамках обязательства России в ВТО', 0),
            'has_certification': product_data.get('Присутствие в технических регламентах (сертификация)', 'нет')
        },
        'metrics': {
            'unfriendly_share': round(metrics['unfriendly_share'], 3),
            'unfriendly_growth': round(metrics['unfriendly_growth'], 2),
            'top1_avg_price': round(metrics['top1_avg_price'], 2),
            'other_avg_price': round(metrics['other_avg_price'], 2)
        },
        'tariff_measures': {
            'measures': tariff_measures,
            'reasoning': tariff_reasoning
        },
        'nontariff_measures': {
            'measures': nontariff_measures,
            'reasoning': nontariff_reasoning
        }
    }
    return result
