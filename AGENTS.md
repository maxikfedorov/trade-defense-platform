# AGENTS.md

## Cursor Cloud specific instructions

### Architecture overview

Trade Defense Platform — a tariff regulation analysis system with three services:

| Service | Port | Description |
|---|---|---|
| FastAPI backend | 8000 | Core analysis engine (Python, FastAPI) |
| React frontend | 5173 | Dashboard SPA (Vite dev server) |
| PostgreSQL 16 | 5432 | Stores tariff/import data (Docker) |
| Qdrant | 6333 | Vector DB for RAG pipeline (Docker) |

Spring Boot backend gateway (`src/backend`) is commented out in `docker-compose.yaml` and not needed for core functionality.

### Running services

1. **Start Docker daemon** (required for DB containers):
   ```
   sudo dockerd &>/tmp/dockerd.log &
   sudo chmod 666 /var/run/docker.sock
   ```
2. **Start PostgreSQL + Qdrant**:
   ```
   docker compose up -d db qdrant
   ```
3. **Seed database from JSON** (only if tables are missing — data is in `data/json/`):
   See the ETL loading pattern used during initial setup. Tables needed: `case_data`, `tnved_okpd_grouped`, `tnved_okpd_mapping`, `tws_tnved`, `import_statistics_value`, `import_statistics_weight`, `countries_list`.
4. **Start FastAPI backend**:
   ```
   DATABASE_URL="postgresql://appuser:apppass@localhost:5432/appdb" uvicorn app.main:app --reload --app-dir src --host 0.0.0.0 --port 8000
   ```
5. **Start frontend dev server**:
   ```
   cd src/frontend && npx vite --host 0.0.0.0 --port 5173
   ```

### Key gotchas

- The default `DATABASE_URL` in `src/app/core/config.py` points to `tarif_db`, but `docker-compose.yaml` creates the database as `appdb`. Always set `DATABASE_URL=postgresql://appuser:apppass@localhost:5432/appdb` when running locally.
- `requirements.txt` includes `psycopg2` (requires `libpq-dev`) and `pywin32` (Windows-only). On Linux, use `psycopg2-binary` instead and skip `pywin32`.
- The frontend hardcodes `http://localhost:8000/api/v1` as the API URL in `src/frontend/src/api/client.js`.
- Qdrant health endpoint: use `/healthz` (not `/health` which returns 404).
- The LLM server (`LLM_BASE_URL`, default `http://127.0.0.1:1234/v1`) is only needed for the RAG `/analyze/full` endpoint. Basic `/analyze/tariff` works without it.

### Lint / test / build

- **Frontend lint**: `cd src/frontend && npx eslint .` (pre-existing lint errors in `LLMContent.jsx`)
- **Frontend build**: `cd src/frontend && npm run build`
- **No automated test suite** exists in this codebase.
- **Backend verification**: `curl http://localhost:8000/api/v1/health`

### Supported HS codes for analysis

The system has data for three product categories: elevators (`842810`), perfumery (`330300`), ATMs (`847230`).
