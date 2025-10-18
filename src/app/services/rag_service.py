# src\app\services\rag_service.py
import json
from openai import OpenAI
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from app.services.tariff_service import main_algorithm
from app.core.config import settings

class LocalLLMRAGProcessor:
    def __init__(self):
        self.llm_client = OpenAI(
            base_url=settings.LLM_BASE_URL,
            api_key="not-needed"
        )
        self.qdrant_client = QdrantClient(url=settings.QDRANT_URL)
        self.embedding_model = SentenceTransformer("deepvk/USER-base")
        self.collection_name = settings.QDRANT_COLLECTION
    
    def search_rag(self, query, top_k=3):
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
    
    def generate_rag_queries(self, algorithm_result):
        measures_tariff = algorithm_result['tariff_measures']['measures']
        measures_nontariff = algorithm_result['nontariff_measures']['measures']
        product_name = algorithm_result['metadata']['product_name']
        unfriendly_share = algorithm_result['metrics']['unfriendly_share']
        tnved_code = algorithm_result['metadata']['tnved_code']
        prompt = f"""Сформулируй ровно 3 поисковых запроса для базы нормативных документов.

Товар: {product_name} (ТН ВЭД {tnved_code})
Рекомендованные меры: {', '.join(measures_tariff + measures_nontariff)}
Доля НС: {unfriendly_share*100:.1f}%

Запросы должны покрывать:
1. Нормативно-правовую базу для рекомендованных мер
2. Процедуры применения мер в рамках ЕАЭС
3. Критерии и условия применения защитных мер

Формат ответа (только JSON, без дополнительного текста):
{{"queries": ["запрос 1", "запрос 2", "запрос 3"]}}"""
        response = self.llm_client.chat.completions.create(
            model=settings.LLM_MODEL_NAME,
            messages=[
                {"role": "system", "content": "Ты помощник для формирования поисковых запросов. Отвечай только в формате JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )
        try:
            content = response.choices[0].message.content.strip()
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('json'):
                    content = content[4:]
            queries_json = json.loads(content)
            queries = queries_json['queries'][:3]
        except:
            queries = [
                f"правовое основание {' '.join(measures_tariff)} защитные меры ЕАЭС",
                f"процедура применения тарифных мер ТН ВЭД {tnved_code}",
                f"критерии доля недружественных стран защитные меры демпинг"
            ]
        return queries
    
    def collect_rag_context(self, queries):
        all_chunks = []
        seen_ids = set()
        for query in queries:
            results = self.search_rag(query, top_k=3)
            for result in results:
                chunk_id = result.id
                if chunk_id not in seen_ids:
                    seen_ids.add(chunk_id)
                    payload = result.payload
                    all_chunks.append({
                        'text': payload.get('text', ''),
                        'filename': payload.get('filename', 'Неизвестный документ'),
                        'score': result.score,
                        'query': query
                    })
        all_chunks.sort(key=lambda x: x['score'], reverse=True)
        return all_chunks
    
    def build_final_prompt(self, algorithm_result, rag_chunks, user_prompt=None):
        default_prompt = """На основе результатов анализа и найденных документов объясни:

1. Правовое обоснование каждой рекомендованной меры со ссылками на документы
2. Экономическое обоснование через рассчитанные метрики
3. Процедуры и этапы применения мер
4. Ожидаемые последствия для отрасли

Формат ссылок: [Документ: название_файла]
Пиши структурированно, по пунктам, конкретно."""
        context_parts = []
        context_parts.append("=== РЕЗУЛЬТАТЫ АНАЛИЗА ===\n")
        context_parts.append(f"Товар: {algorithm_result['metadata']['product_name']}")
        context_parts.append(f"Код ТН ВЭД: {algorithm_result['metadata']['tnved_code']}")
        context_parts.append(f"Текущий тариф: {algorithm_result['product_info']['tariff_rate']*100}%")
        context_parts.append(f"Связанный тариф ВТО: {algorithm_result['product_info']['wto_rate']*100}%")
        context_parts.append(f"Сертификация: {algorithm_result['product_info']['has_certification']}")
        context_parts.append("\n=== МЕТРИКИ ===")
        context_parts.append(f"Доля НС в импорте: {algorithm_result['metrics']['unfriendly_share']*100:.1f}%")
        context_parts.append(f"Прирост импорта из НС: {algorithm_result['metrics']['unfriendly_growth']:.2f} млн $")
        context_parts.append(f"СКЦ топ-1: {algorithm_result['metrics']['top1_avg_price']:.2f} $/т")
        context_parts.append(f"СКЦ остальных: {algorithm_result['metrics']['other_avg_price']:.2f} $/т")
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
        context_parts.append("\n=== НОРМАТИВНЫЕ ДОКУМЕНТЫ ===")
        for i, chunk in enumerate(rag_chunks[:9], 1):
            context_parts.append(f"\n[Документ {i}]: {chunk['filename']}")
            context_parts.append(f"Релевантность: {chunk['score']:.3f}")
            text = chunk['text'][:800].replace('\n', ' ')
            context_parts.append(f"Текст: {text}...")
        full_context = "\n".join(context_parts)
        prompt_text = user_prompt if user_prompt else default_prompt
        return f"{full_context}\n\n{'='*50}\n\n{prompt_text}"
    
    def generate_explanation(self, prompt):
        response = self.llm_client.chat.completions.create(
            model=settings.LLM_MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": "Ты эксперт по таможенному регулированию РФ и ЕАЭС. Отвечай структурированно, конкретно, со ссылками на документы. Не используй теги <think> и другую метаинформацию."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000
        )
        return response.choices[0].message.content
    
    def process(self, algorithm_result, user_prompt=None):
        queries = self.generate_rag_queries(algorithm_result)
        rag_chunks = self.collect_rag_context(queries)
        final_prompt = self.build_final_prompt(algorithm_result, rag_chunks, user_prompt)
        explanation = self.generate_explanation(final_prompt)
        output = {
            'algorithm_result': algorithm_result,
            'rag_queries': queries,
            'sources_found': len(rag_chunks),
            'top_sources': [
                {
                    'filename': chunk['filename'],
                    'relevance_score': round(chunk['score'], 4)
                }
                for chunk in rag_chunks[:5]
            ],
            'explanation': explanation
        }
        return output

def full_pipeline(tnved_input, user_prompt=None):
    algorithm_result = main_algorithm(tnved_input)
    processor = LocalLLMRAGProcessor()
    final_output = processor.process(algorithm_result, user_prompt)
    return final_output
