# src\app\routers\analysis.py
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    TariffAnalysisRequest,
    TariffAnalysisResponse,
    RAGAnalysisRequest,
    RAGAnalysisResponse,
    HealthResponse,
    ConfigResponse
)
from app.services.tariff_service import main_algorithm
from app.services.rag_service import full_pipeline
from app.core.config import settings
import logging
import traceback

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION
    }

@router.get("/config", response_model=ConfigResponse)
async def get_config():
    return {
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_configured": bool(settings.DATABASE_URL),
        "llm_configured": bool(settings.LLM_BASE_URL),
        "qdrant_configured": bool(settings.QDRANT_URL)
    }

@router.post("/analyze/tariff", response_model=TariffAnalysisResponse)
async def analyze_tariff(request: TariffAnalysisRequest):
    try:
        logger.info(f"Starting tariff analysis for: {request.tnved_code}")
        result = main_algorithm(request.tnved_code, request.product_name)
        logger.info("Tariff analysis completed successfully")
        return result
    except Exception as e:
        logger.error(f"Error in tariff analysis: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")

@router.post("/analyze/full", response_model=RAGAnalysisResponse)
async def analyze_full(request: RAGAnalysisRequest):
    try:
        logger.info(f"Starting full analysis for: {request.tnved_code}")
        result = full_pipeline(request.tnved_code, request.user_prompt)
        logger.info("Full analysis completed successfully")
        return result
    except Exception as e:
        logger.error(f"Error in full analysis: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {str(e)}")
