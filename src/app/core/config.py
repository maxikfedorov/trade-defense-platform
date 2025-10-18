# src\app\core\config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tariff Analysis System"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = "postgresql://appuser:apppass@localhost:5432/tarif_db"
    LLM_BASE_URL: str = "http://127.0.0.1:1234/v1"
    LLM_MODEL_NAME: str = "google/gemma-3n-e4b"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION: str = "rag_docs"
    
    class Config:
        env_file = ".env"

settings = Settings()
