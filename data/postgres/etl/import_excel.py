import os
import pandas as pd
from sqlalchemy import create_engine, text

# Параметры подключения и путей
pg_host = os.getenv("PGHOST", "db")  # имя сервиса БД из docker-compose
pg_port = os.getenv("PGPORT", "5432")
pg_db = os.getenv("PGDATABASE", "appdb")
pg_user = os.getenv("PGUSER", "appuser")
pg_pass = os.getenv("PGPASSWORD", "apppass")
excel_path = os.getenv("EXCEL_PATH", "/data/postgres/input.xlsx")
table_name = os.getenv("TABLE_NAME", "public.tariffs")  # целевая таблица

conn_str = f"postgresql+psycopg2://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}"
engine = create_engine(conn_str, pool_pre_ping=True)

def clean_col(s: str) -> str:
    # Удаляем неразрывные и узкие пробелы, тримим, приводим множественные пробелы к одному
    return (
        str(s)
        .replace('\u00A0', ' ')
        .replace('\u2007', ' ')
        .replace('\u202F', ' ')
        .strip()
    )

def norm_key(s: str) -> str:
    # Нормализуем ключ для сопоставления: нижний регистр + схлопывание пробелов
    return ' '.join(clean_col(s).lower().split())

def parse_percent(val):
    # Преобразование "5%" -> 5.0, "0%" -> 0.0; запятая как десятичный разделитель поддерживается
    if pd.isna(val):
        return None
    s = str(val).strip().replace(',', '.')
    if s.endswith('%'):
        s = s[:-1].strip()
    try:
        return float(s)
    except ValueError:
        return None

def main():
    # Читаем Excel; при необходимости можно указать sheet_name и header
    df = pd.read_excel(excel_path, dtype=str)  # openpyxl по умолчанию для .xlsx
    print("Excel columns read:", list(df.columns))  # диагностика заголовков

    # Очистим и нормализуем имена столбцов
    df.columns = [clean_col(c) for c in df.columns]

    # Мягкое сопоставление русских заголовков с целевыми именами
    targets = {
        norm_key('Код'): 'code',
        norm_key('Наименование'): 'name',
        norm_key('Тариф'): 'tariff_percent',
        norm_key('Подробности'): 'details'
    }
    rename_map = {}
    for c in df.columns:
        key = norm_key(c)
        if key in targets:
            rename_map[c] = targets[key]

    df = df.rename(columns=rename_map)

    required = ['code', 'name', 'tariff_percent', 'details']
    missing = [x for x in required if x not in df.columns]
    if missing:
        raise KeyError(
            f"Отсутствуют ожидаемые колонки после нормализации: {missing}. "
            f"Найдено: {list(df.columns)}. Проверьте строку заголовков, пробелы и объединения ячеек."
        )

    # Приведение типов/значений
    df = df[required]
    df['code'] = df['code'].astype(str).str.strip()
    df['name'] = df['name'].astype(str).str.strip()
    df['details'] = df['details'].astype(str).str.strip()
    df['tariff_percent'] = df['tariff_percent'].apply(parse_percent)

    # Создаем целевую таблицу, если не существует
    ddl = f"""
    CREATE TABLE IF NOT EXISTS {table_name}(
        code            VARCHAR(32) PRIMARY KEY,
        name            TEXT NOT NULL,
        tariff_percent  NUMERIC(6,2),
        details         TEXT
    );
    """

    stg_schema = "public"
    stg_name = "tariffs_stg"

    with engine.begin() as conn:
        # Гарантируем наличие целевой таблицы
        conn.execute(text(ddl))

        # Подготовим обычную стейдж-таблицу в public
        conn.execute(text(f"DROP TABLE IF EXISTS {stg_schema}.{stg_name};"))
        conn.execute(text(f"""
            CREATE TABLE {stg_schema}.{stg_name}(
                code VARCHAR(32),
                name TEXT,
                tariff_percent NUMERIC(6,2),
                details TEXT
            );
        """))

        # Загрузка в stage через pandas.to_sql с явной схемой
        df.to_sql(name=stg_name, schema=stg_schema, con=conn, if_exists='append', index=False)

        # Upsert в целевую таблицу
        conn.execute(text(f"""
            INSERT INTO {table_name} (code, name, tariff_percent, details)
            SELECT code, name, tariff_percent, details FROM {stg_schema}.{stg_name}
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                tariff_percent = EXCLUDED.tariff_percent,
                details = EXCLUDED.details;
        """))

        # Очистка stage
        conn.execute(text(f"DROP TABLE IF EXISTS {stg_schema}.{stg_name};"))

if __name__ == "__main__":
    main()
