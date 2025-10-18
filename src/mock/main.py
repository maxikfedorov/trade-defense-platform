from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import uvicorn


# Мок-функции из предыдущего кода
def mock_load_config():
    """Мок-функция для загрузки конфигурации"""
    return {
        'tnved_product_mapping': {
            '8428': 'lifts',
            '842810': 'lifts'
        },
        'product_names': {
            'lifts': 'Лифты'
        }
    }


def mock_main_algorithm(tnved_input, product_name=None):
    """Мок-функция основного алгоритма"""
    return {
        'metadata': {
            'tnved_code': tnved_input,
            'tnved_name': 'Лифты и подъемники скиповые',
            'okpd_codes': [{'okpd_code': '28.22.16', 'okpd_name': 'Лифты, скиповые подъемники'}],
            'product_name': product_name or 'Лифты',
            'current_tariff': '0%'
        },
        'product_info': {
            'tariff_rate': 0,
            'wto_rate': 0.05,
            'has_certification': 'да'
        },
        'metrics': {
            'unfriendly_share': 0.15,
            'unfriendly_growth': 25.5,
            'top1_avg_price': 12.5,
            'other_avg_price': 15.8
        },
        'tariff_measures': {
            'measures': ['Мера 1'],
            'reasoning': ['Возможность повышения тарифа, производство >= потребления']
        },
        'nontariff_measures': {
            'measures': ['Мера 5'],
            'reasoning': ['Применима мера сертификации']
        }
    }


class MockLocalLLMRAGProcessor:
    """Мок-класс для RAG процессора"""
    
    def __init__(self):
        pass
    
    def search_rag(self, query, top_k=3):
        """Мок поиска в RAG базе"""
        mock_results = []
        for i in range(top_k):
            mock_results.append({
                'id': i,
                'score': 0.85 - (i * 0.1),
                'payload': {
                    'text': f'Тестовый фрагмент документа {i+1} по запросу: {query}. Содержит информацию о применении мер...',
                    'filename': f'документ_{i+1}.pdf'
                }
            })
        return mock_results
    
    def generate_rag_queries(self, algorithm_result):
        """Мок генерации поисковых запросов"""
        product_name = algorithm_result['metadata']['product_name']
        measures = algorithm_result['tariff_measures']['measures']
        return [
            f"правовое основание {' '.join(measures)} для {product_name}",
            f"процедура применения тарифных мер ЕАЭС",
            f"критерии защитных мер таможенное регулирование"
        ]
    
    def collect_rag_context(self, queries):
        """Мок сбора контекста из RAG"""
        chunks = []
        for i, query in enumerate(queries):
            results = self.search_rag(query, top_k=2)
            for result in results:
                chunks.append({
                    'text': result['payload']['text'],
                    'filename': result['payload']['filename'],
                    'score': result['score'],
                    'query': query
                })
        return chunks
    
    def generate_explanation(self, prompt):
        """Мок генерации объяснения"""
        return """### Правовое обоснование мер

Рекомендованная Мера 1 (повышение тарифа) основывается на положениях законодательства ЕАЭС о защите внутреннего рынка.

### Экономическое обоснование

Анализ показывает, что производство превышает потребление, что создает условия для применения защитных мер.

### Процедуры применения

1. Подача заявления в уполномоченный орган
2. Проведение расследования
3. Принятие решения о введении меры

### Ожидаемые последствия

Введение мер приведет к усилению конкурентоспособности отечественных производителей."""
    
    def process(self, algorithm_result, user_prompt=None):
        """Мок полной обработки"""
        queries = self.generate_rag_queries(algorithm_result)
        rag_chunks = self.collect_rag_context(queries)
        explanation = self.generate_explanation("")
        
        return {
            'rag_queries': queries,
            'sources_found': len(rag_chunks),
            'top_sources': [
                {'filename': chunk['filename'], 'relevance_score': round(chunk['score'], 4)}
                for chunk in rag_chunks[:5]
            ],
            'explanation': explanation
        }


# Pydantic модели для валидации запросов
class AnalyzeRequest(BaseModel):
    tnved_code: str = Field(..., description="Код ТН ВЭД", example="8428 10")
    product_name: Optional[str] = Field(None, description="Название продукта (опционально)")


class GenerateRequest(BaseModel):
    algorithm_result: Dict[str, Any] = Field(..., description="Результат анализа из эндпоинта /analyze")
    user_prompt: Optional[str] = Field(None, description="Пользовательский промпт (опционально)")


class FullPipelineRequest(BaseModel):
    tnved_code: str = Field(..., description="Код ТН ВЭД", example="8428 10")
    product_name: Optional[str] = Field(None, description="Название продукта (опционально)")
    user_prompt: Optional[str] = Field(None, description="Пользовательский промпт (опционально)")


# Создание FastAPI приложения
app = FastAPI(
    title="Таможенный анализ API",
    description="API для анализа таможенных мер и тарифов с RAG",
    version="1.0.0"
)


@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": "Добро пожаловать в API таможенного анализа",
        "endpoints": {
            "/health": "Проверка состояния сервиса",
            "/analyze": "Анализ тарифов по коду ТН ВЭД",
            "/generate": "Генерация объяснения с RAG на основе результатов анализа",
            "/full-pipeline": "Полный анализ с RAG (анализ + генерация)"
        }
    }


@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса"""
    return {
        "status": "healthy",
        "service": "customs-analysis-api",
        "version": "1.0.0"
    }


@app.post("/analyze")
async def analyze_tnved(request: AnalyzeRequest):
    """
    Анализ тарифов и мер по коду ТН ВЭД
    
    Args:
        request: Запрос с кодом ТН ВЭД и опциональным названием продукта
    
    Returns:
        JSON с результатами анализа (метрики, меры, информация о товаре)
    """
    try:
        result = mock_main_algorithm(request.tnved_code, request.product_name)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при анализе: {str(e)}")


@app.post("/generate")
async def generate_explanation(request: GenerateRequest):
    """
    Генерация объяснения с использованием RAG и LLM
    
    Args:
        request: Запрос с результатами анализа и опциональным промптом
    
    Returns:
        JSON с RAG запросами, источниками и сгенерированным объяснением
    """
    try:
        processor = MockLocalLLMRAGProcessor()
        result = processor.process(request.algorithm_result, request.user_prompt)
        return JSONResponse(content=result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при генерации объяснения: {str(e)}")


@app.post("/full-pipeline")
async def full_pipeline(request: FullPipelineRequest):
    """
    Полный пайплайн: анализ + генерация объяснения
    
    Args:
        request: Запрос с кодом ТН ВЭД, опциональным названием продукта и промптом
    
    Returns:
        JSON с полными результатами: анализ + RAG + объяснение
    """
    try:
        # Шаг 1: Анализ
        algorithm_result = mock_main_algorithm(request.tnved_code, request.product_name)
        
        # Шаг 2: Генерация
        processor = MockLocalLLMRAGProcessor()
        generation_result = processor.process(algorithm_result, request.user_prompt)
        
        # Объединяем результаты
        full_result = {
            'algorithm_result': algorithm_result,
            **generation_result
        }
        
        return JSONResponse(content=full_result, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при полном анализе: {str(e)}")


@app.get("/config")
async def get_config():
    """Получить текущую конфигурацию"""
    try:
        config = mock_load_config()
        return JSONResponse(content=config, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при загрузке конфигурации: {str(e)}")


if __name__ == "__main__":
    # Запуск сервера
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
