import json
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from app.services.tariff_service import main_algorithm
from app.core.config import settings
from app.core.prompts import RAGPrompts


class LocalLLMRAGProcessor:
    def __init__(self):
        self.llm_client = OpenAI(
            base_url=settings.LLM_BASE_URL,
            api_key="not-needed"
        )
        self.qdrant_client = QdrantClient(url=settings.QDRANT_URL)
        self.embedding_model = SentenceTransformer("deepvk/USER-base")
        self.collection_name = settings.QDRANT_COLLECTION
    
    def search_rag(self, query, top_k=5):
        """Поиск релевантных документов (изменен top_k на 5)"""
        query_embedding = self.embedding_model.encode(
            [query], 
            normalize_embeddings=True, 
            prompt_name="query"
        )[0]
        results = self.qdrant_client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding.tolist(),
            limit=top_k
        )
        return results
    
    def generate_search_query(self, algorithm_result):
        """Генерирует ОДИН релевантный поисковый запрос"""
        prompt = RAGPrompts.format_search_query(algorithm_result)
        
        response = self.llm_client.chat.completions.create(
            model=settings.LLM_MODEL_NAME,
            messages=[
                {"role": "system", "content": RAGPrompts.SEARCH_QUERY_SYSTEM},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=200
        )
        
        query = response.choices[0].message.content.strip()
        
        # Фоллбэк на случай ошибки генерации
        if not query or len(query) < 10:
            measures = (algorithm_result['tariff_measures']['measures'] + 
                       algorithm_result['nontariff_measures']['measures'])
            query = (f"применение мер {' '.join(measures[:2])} "
                    f"ТН ВЭД {algorithm_result['metadata']['tnved_code']} "
                    f"ЕАЭС правовое основание процедура")
        
        return query
    
    def collect_rag_context(self, query, top_k=5):
        """Собирает топ-5 документов по одному запросу"""
        results = self.search_rag(query, top_k=top_k)
        
        chunks = []
        for result in results:
            payload = result.payload
            chunks.append({
                'text': payload.get('text', ''),
                'filename': payload.get('filename', 'Неизвестный документ'),
                'score': result.score,
                'chunk_id': result.id
            })
        
        return chunks
    
    def build_final_prompt(self, algorithm_result, rag_chunks, user_prompt=None):
        """Формирует финальный промпт с контекстом"""
        context_parts = []
        
        # Блок 1: Метаданные товара
        context_parts.append("=== РЕЗУЛЬТАТЫ АНАЛИЗА ===")
        context_parts.append(f"Товар: {algorithm_result['metadata']['product_name']}")
        context_parts.append(f"Код ТН ВЭД: {algorithm_result['metadata']['tnved_code']}")
        context_parts.append(f"Текущий тариф: {algorithm_result['product_info']['tariff_rate']*100}%")
        context_parts.append(f"Связанный тариф ВТО: {algorithm_result['product_info']['wto_rate']*100}%")
        context_parts.append(f"Сертификация: {algorithm_result['product_info']['has_certification']}")
        
        # Блок 2: Ключевые метрики
        context_parts.append("\n=== КЛЮЧЕВЫЕ МЕТРИКИ ===")
        context_parts.append(f"Доля НС в импорте: {algorithm_result['metrics']['unfriendly_share']*100:.1f}%")
        context_parts.append(f"Прирост импорта из НС: {algorithm_result['metrics']['unfriendly_growth']:.2f} млн $")
        context_parts.append(f"СКЦ топ-1: {algorithm_result['metrics']['top1_avg_price']:.2f} $/т")
        context_parts.append(f"СКЦ остальных: {algorithm_result['metrics']['other_avg_price']:.2f} $/т")
        
        # Блок 3: Рекомендованные меры
        context_parts.append("\n=== ТАРИФНЫЕ МЕРЫ ===")
        for measure, reason in zip(
            algorithm_result['tariff_measures']['measures'],
            algorithm_result['tariff_measures']['reasoning']
        ):
            context_parts.append(f"• {measure}: {reason}")
        
        context_parts.append("\n=== НЕТАРИФНЫЕ МЕРЫ ===")
        for measure, reason in zip(
            algorithm_result['nontariff_measures']['measures'],
            algorithm_result['nontariff_measures']['reasoning']
        ):
            context_parts.append(f"• {measure}: {reason}")
        
        # Блок 4: Найденные документы (топ-5)
        context_parts.append("\n=== НОРМАТИВНЫЕ ДОКУМЕНТЫ (ТОП-5) ===")
        for i, chunk in enumerate(rag_chunks[:5], 1):
            context_parts.append(f"\n[Документ {i}]: {chunk['filename']}")
            context_parts.append(f"Релевантность: {chunk['score']:.4f}")
            text = chunk['text'][:1000].replace('\n', ' ')
            context_parts.append(f"Фрагмент: {text}...")
        
        full_context = "\n".join(context_parts)
        prompt_text = user_prompt if user_prompt else RAGPrompts.EXPLANATION_DEFAULT
        
        return f"{full_context}\n\n{'='*60}\n\n{prompt_text}"
    
    def generate_explanation(self, prompt):
        """Генерирует финальное объяснение"""
        response = self.llm_client.chat.completions.create(
            model=settings.LLM_MODEL_NAME,
            messages=[
                {"role": "system", "content": RAGPrompts.EXPLANATION_SYSTEM},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2500
        )
        return response.choices[0].message.content
    
    def process(self, algorithm_result, user_prompt=None):
        """Основной процесс обработки"""
        # 1. Генерируем ОДИН поисковый запрос
        search_query = self.generate_search_query(algorithm_result)
        
        # 2. Собираем топ-5 документов
        rag_chunks = self.collect_rag_context(search_query, top_k=5)
        
        # 3. Формируем финальный промпт
        final_prompt = self.build_final_prompt(algorithm_result, rag_chunks, user_prompt)
        
        # 4. Генерируем объяснение
        explanation = self.generate_explanation(final_prompt)
        
        # 5. Формируем выходные данные
        output = {
            'algorithm_result': algorithm_result,
            'rag_queries': [search_query],  # Один запрос вместо списка
            'sources_found': len(rag_chunks),
            'top_sources': [
                {
                    'filename': chunk['filename'],
                    'relevance_score': round(chunk['score'], 4)
                }
                for chunk in rag_chunks[:5]  # Топ-5
            ],
            'explanation': explanation
        }
        
        return output


def full_pipeline(tnved_input, user_prompt=None):
    """Полный пайплайн обработки"""
    algorithm_result = main_algorithm(tnved_input)
    processor = LocalLLMRAGProcessor()
    final_output = processor.process(algorithm_result, user_prompt)
    return final_output
