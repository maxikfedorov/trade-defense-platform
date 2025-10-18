# data/postgres/etl/Dockerfile (context = .)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev locales && \
    sed -i 's/# ru_RU.UTF-8 UTF-8/ru_RU.UTF-8 UTF-8/' /etc/locale.gen && \
    locale-gen && \
    rm -rf /var/lib/apt/lists/*

ENV LANG=ru_RU.UTF-8 \
    LC_ALL=ru_RU.UTF-8

WORKDIR /app

RUN pip install --no-cache-dir pandas==2.2.2 openpyxl==3.1.5 \
    sqlalchemy==2.0.32 psycopg2-binary==2.9.9

# Важно: пути от корня контекста (.)
COPY data/postgres/etl/import_excel.py /app/import_excel.py
COPY data/postgres/input.xlsx /app/input.xlsx
