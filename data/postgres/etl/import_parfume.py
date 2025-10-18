# import_parfume_wide.py
import os, re, pandas as pd
from sqlalchemy import create_engine, text

PGHOST=os.getenv("PGHOST","db")
PGPORT=os.getenv("PGPORT","5432")
PGDATABASE=os.getenv("PGDATABASE","appdb")
PGUSER=os.getenv("PGUSER","appuser")
PGPASSWORD=os.getenv("PGPASSWORD","apppass")
EXCEL_PATH=os.getenv("EXCEL_PATH","/app/parfume.xlsx")
TABLE_NAME=os.getenv("TABLE_NAME","public.parfume")

def clean_col(s):
    return str(s).replace('\u00A0',' ').replace('\u2007',' ').replace('\u202F',' ').strip()

def parse_decimal_with_comma(x):
    if pd.isna(x) or str(x).strip()=='':
        return None
    s = str(x).strip().replace(' ','').replace('\u00A0','').replace(',','.')
    return float(s) if re.match(r'^-?\d+(\.\d+)?$', s) else None

def main():
    df = pd.read_excel(EXCEL_PATH, dtype=str)
    df = df.dropna(how='all', axis=1).dropna(how='all', axis=0)
    df.columns = [clean_col(c) for c in df.columns]

    # Колонка страны
    country_col = None
    for c in df.columns:
        cl = c.lower()
        if 'список' in cl or 'country' in cl or 'стра' in cl:
            country_col = c
            break
    if not country_col:
        country_col = df.columns[0]

    # Нужные выходные поля
    wanted = {
        ('2022','млн'): 'value_usd_mln_2022',
        ('2023','млн'): 'value_usd_mln_2023',
        ('2024','млн'): 'value_usd_mln_2024',
        ('2022','тон'): 'value_tons_2022',
        ('2023','тон'): 'value_tons_2023',
        ('2024','тон'): 'value_tons_2024',
    }

    # Сопоставление заголовков
    colmap = {}
    for c in df.columns:
        m = re.match(r'^\s*(20\d{2})\s*,\s*(.+?)\s*$', c)
        if not m:
            continue
        year = m.group(1)
        unit_raw = clean_col(m.group(2)).lower()
        key = None
        if 'млн' in unit_raw:
            key = (year,'млн')
        elif 'тон' in unit_raw:
            key = (year,'тон')
        if key in wanted:
            colmap[c] = wanted[key]

    # Формируем выходную таблицу
    out_cols = ['country'] + list(wanted.values())
    out = pd.DataFrame(columns=out_cols)

    for _,row in df.iterrows():
        country = str(row.get(country_col,'')).strip()
        if not country or country.lower() in ('итого','total'):
            continue
        rec = {k: None for k in out_cols}
        rec['country'] = country
        for src, dst in colmap.items():
            rec[dst] = parse_decimal_with_comma(row.get(src))
        out.loc[len(out)] = rec

    print("Rows parsed:", len(out))
    if out.empty:
        print("No rows to import. Exiting.")
        return

    # Создаём таблицу и upsert по country
    conn_str = f"postgresql+psycopg2://{PGUSER}:{PGPASSWORD}@{PGHOST}:{PGPORT}/{PGDATABASE}"
    engine = create_engine(conn_str, pool_pre_ping=True)

    ddl = f"""
    CREATE TABLE IF NOT EXISTS {TABLE_NAME}(
        country TEXT PRIMARY KEY,
        value_usd_mln_2022 NUMERIC(18,3),
        value_usd_mln_2023 NUMERIC(18,3),
        value_usd_mln_2024 NUMERIC(18,3),
        value_tons_2022    NUMERIC(18,3),
        value_tons_2023    NUMERIC(18,3),
        value_tons_2024    NUMERIC(18,3)
    );
    """
    stg_schema = "public"
    stg_name = "parfume_stg"

    with engine.begin() as conn:
        conn.execute(text(ddl))
        conn.execute(text(f"DROP TABLE IF EXISTS {stg_schema}.{stg_name};"))
        fields = ", ".join([f"{c} NUMERIC(18,3)" for c in out_cols if c!='country'])
        conn.execute(text(f"""
            CREATE TABLE {stg_schema}.{stg_name}(
                country TEXT,
                {fields}
            );
        """))

        out.to_sql(name=stg_name, schema=stg_schema, con=conn, if_exists='append', index=False)

        set_clause = ", ".join([f"{c}=EXCLUDED.{c}" for c in out_cols if c!='country'])
        cols = ", ".join(out_cols)
        conn.execute(text(f"""
            INSERT INTO {TABLE_NAME} ({cols})
            SELECT {cols} FROM {stg_schema}.{stg_name}
            ON CONFLICT (country) DO UPDATE SET {set_clause};
        """))

        conn.execute(text(f"DROP TABLE IF EXISTS {stg_schema}.{stg_name};"))

if __name__ == "__main__":
    main()
