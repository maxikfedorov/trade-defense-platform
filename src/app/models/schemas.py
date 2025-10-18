# src\app\models\schemas.py
from pydantic import BaseModel
from typing import List, Dict, Optional, Any, Union


class TariffAnalysisRequest(BaseModel):
    tnved_code: str
    product_name: Optional[str] = None


class RAGAnalysisRequest(BaseModel):
    tnved_code: str
    user_prompt: Optional[str] = None


class OKPDCode(BaseModel):
    okpd_code: str
    okpd_name: str


class TNVEDInfo(BaseModel):
    tnved_code: Optional[str] = None
    tnved_name: Optional[str] = None
    okpd_codes: List[OKPDCode] = []
    tariff: Optional[Union[float, str]] = None


class ProductInfo(BaseModel):
    tariff_rate: float
    wto_rate: float
    has_certification: str


class Metrics(BaseModel):
    unfriendly_share: float
    unfriendly_growth: float
    top1_avg_price: float
    other_avg_price: float


class Measures(BaseModel):
    measures: List[str]
    reasoning: List[str]


class Metadata(BaseModel):
    tnved_code: Optional[str] = None
    tnved_name: Optional[str] = None
    okpd_codes: List[OKPDCode] = []
    product_name: Optional[str] = None
    current_tariff: Optional[Union[float, str]] = None


# НОВЫЕ МОДЕЛИ ДЛЯ ДАШБОРДА
class ImportDynamicsItem(BaseModel):
    year: int
    value_mln_usd: float
    weight_tons: float


class ProductionConsumptionItem(BaseModel):
    year: int
    value_mln_usd: float


class ImportGeographyItem(BaseModel):
    country: str
    value: float
    share_percent: float
    is_unfriendly: bool


class Top5PriceItem(BaseModel):
    country: str
    avg_price_usd_per_ton: float
    total_value_mln_usd: float
    total_weight_tons: float


class DashboardData(BaseModel):
    import_dynamics: List[ImportDynamicsItem]
    production_dynamics: List[ProductionConsumptionItem]
    consumption_dynamics: List[ProductionConsumptionItem]
    import_geography: List[ImportGeographyItem]
    top5_contract_prices: List[Top5PriceItem]


# ОБНОВЛЕННАЯ СХЕМА ОТВЕТА
class TariffAnalysisResponse(BaseModel):
    metadata: Metadata
    product_info: ProductInfo
    metrics: Metrics
    tariff_measures: Measures
    nontariff_measures: Measures
    dashboard_data: DashboardData  # ДОБАВЛЕНО!


class SourceInfo(BaseModel):
    filename: str
    relevance_score: float


class RAGAnalysisResponse(BaseModel):
    algorithm_result: Dict[str, Any]
    rag_queries: List[str]
    sources_found: int
    top_sources: List[SourceInfo]
    explanation: str


class HealthResponse(BaseModel):
    status: str
    version: str


class ConfigResponse(BaseModel):
    project_name: str
    version: str
    database_configured: bool
    llm_configured: bool
    qdrant_configured: bool
