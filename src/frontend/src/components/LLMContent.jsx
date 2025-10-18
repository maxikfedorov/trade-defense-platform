export default function LLMContent({ data }) {
  return (
    <>
      <h2>Экспертное заключение AI</h2>

      <section>
        <h3>Источники анализа</h3>
        <p>Найдено источников: {data.sources_found}</p>
        
        {data.top_sources && data.top_sources.length > 0 && (
          <div>
            <h4>Топ документов:</h4>
            <ul>
              {data.top_sources.map((source, idx) => (
                <li key={idx}>
                  {source.filename} (релевантность: {(source.relevance_score * 100).toFixed(1)}%)
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {data.rag_queries && data.rag_queries.length > 0 && (
        <section>
          <h3>Поисковые запросы:</h3>
          <ul>
            {data.rag_queries.map((query, idx) => (
              <li key={idx}>{query}</li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>Детальное объяснение</h3>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {data.explanation}
        </div>
      </section>
    </>
  );
}
