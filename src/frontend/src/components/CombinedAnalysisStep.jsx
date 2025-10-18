export default function CombinedAnalysisStep({ 
  tariffData, 
  ragData,
  llmLoading,
  llmError,
  onLoadLLM,
  onReset,
  onDownloadPDF 
}) {
  const { metadata, product_info, dashboard_data, tariff_measures, nontariff_measures } = tariffData;

  return (
    <div>
      <h2>Комплексный анализ ТН ВЭД {metadata.tnved_code}</h2>

      {/* ============ БЛОК ДАШБОРДА (всегда видим) ============ */}
      <section>
        <h3>Информация о товаре</h3>
        <div>
          <div><strong>Код ТН ВЭД:</strong> {metadata.tnved_code}</div>
          <div><strong>Наименование:</strong> {metadata.tnved_name}</div>
          <div><strong>Продукт:</strong> {metadata.product_name}</div>
          <div><strong>Текущая ставка пошлины:</strong> {metadata.current_tariff}</div>
          <div><strong>Ставка по ВТО:</strong> {(product_info.wto_rate * 100).toFixed(1)}%</div>
        </div>

        {metadata.okpd_codes && metadata.okpd_codes.length > 0 && (
          <div>
            <h4>Коды ОКПД2:</h4>
            <ul>
              {metadata.okpd_codes.map((okpd, idx) => (
                <li key={idx}>{okpd.okpd_code} - {okpd.okpd_name}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Динамика импорта */}
      <section>
        <h3>Динамика импорта (2022-2024)</h3>
        <table border="1">
          <thead>
            <tr>
              <th>Год</th>
              <th>Объем (млн USD)</th>
              <th>Вес (тонн)</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.import_dynamics.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>{item.value_mln_usd.toFixed(2)}</td>
                <td>{item.weight_tons.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Динамика производства */}
      <section>
        <h3>Динамика производства (2022-2024)</h3>
        <table border="1">
          <thead>
            <tr><th>Год</th><th>Объем (млн USD)</th></tr>
          </thead>
          <tbody>
            {dashboard_data.production_dynamics.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>{item.value_mln_usd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Динамика потребления */}
      <section>
        <h3>Динамика потребления (2022-2024)</h3>
        <table border="1">
          <thead>
            <tr><th>Год</th><th>Объем (млн USD)</th></tr>
          </thead>
          <tbody>
            {dashboard_data.consumption_dynamics.map((item) => (
              <tr key={item.year}>
                <td>{item.year}</td>
                <td>{item.value_mln_usd.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* География импорта */}
      <section>
        <h3>Географическая структура импорта (топ-10)</h3>
        <table border="1">
          <thead>
            <tr>
              <th>Страна</th>
              <th>Объем (млн USD)</th>
              <th>Доля (%)</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.import_geography
              .filter(c => c.share_percent > 0)
              .slice(0, 10)
              .map((country, idx) => (
                <tr key={idx}>
                  <td>{country.country}</td>
                  <td>{country.value.toFixed(2)}</td>
                  <td>{country.share_percent.toFixed(2)}</td>
                  <td>{country.is_unfriendly ? 'Недружественная' : 'Дружественная'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      {/* Топ-5 цен */}
      <section>
        <h3>Средняя контрактная цена импорта (топ-5)</h3>
        <table border="1">
          <thead>
            <tr>
              <th>Страна</th>
              <th>Цена (USD/тонна)</th>
              <th>Объем (млн USD)</th>
              <th>Вес (тонн)</th>
            </tr>
          </thead>
          <tbody>
            {dashboard_data.top5_contract_prices.map((item, idx) => (
              <tr key={idx}>
                <td>{item.country}</td>
                <td>{item.avg_price_usd_per_ton.toFixed(2)}</td>
                <td>{item.total_value_mln_usd.toFixed(2)}</td>
                <td>{item.total_weight_tons.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Рекомендации алгоритма */}
      <section>
        <h3>Рекомендации по применению мер ТТР</h3>
        <div>
          <h4>Тарифные меры:</h4>
          <ul>
            {tariff_measures.measures.map((measure, idx) => (
              <li key={idx}>
                <strong>{measure}</strong>
                {tariff_measures.reasoning[idx] && ` - ${tariff_measures.reasoning[idx]}`}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Нетарифные меры:</h4>
          <ul>
            {nontariff_measures.measures.map((measure, idx) => (
              <li key={idx}>
                <strong>{measure}</strong>
                {nontariff_measures.reasoning[idx] && ` - ${nontariff_measures.reasoning[idx]}`}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ БЛОК LLM (появляется по требованию) ============ */}
      <hr />
      
      {!ragData && !llmLoading && (
        <section>
          <h3>Экспертное заключение AI</h3>
          <p>Получите детальное объяснение от языковой модели на основе регуляторной базы знаний</p>
          <button onClick={onLoadLLM}>Получить экспертное заключение</button>
        </section>
      )}

      {llmLoading && (
        <section>
          <h3>Экспертное заключение AI</h3>
          <div>
            <p>⏳ Генерируем заключение нейросети...</p>
            <p>Анализируем данные с помощью LLM и векторной базы знаний</p>
          </div>
        </section>
      )}

      {llmError && (
        <section>
          <h3>Экспертное заключение AI</h3>
          <p style={{color: 'red'}}>❌ Ошибка: {llmError}</p>
          <button onClick={onLoadLLM}>Попробовать снова</button>
        </section>
      )}

      {ragData && !llmLoading && (
        <section>
          <h3>Экспертное заключение AI</h3>
          
          <div>
            <h4>📚 Источники анализа</h4>
            <p>Найдено документов: <strong>{ragData.sources_found}</strong></p>
            
            {ragData.top_sources && ragData.top_sources.length > 0 && (
              <div>
                <p><strong>Топ релевантных документов:</strong></p>
                <ul>
                  {ragData.top_sources.map((source, idx) => (
                    <li key={idx}>
                      {source.filename} 
                      <em> (релевантность: {(source.relevance_score * 100).toFixed(1)}%)</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {ragData.rag_queries && ragData.rag_queries.length > 0 && (
            <div>
              <h4>🔍 Использованные поисковые запросы:</h4>
              <ul>
                {ragData.rag_queries.map((query, idx) => (
                  <li key={idx}>{query}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4>💡 Детальное объяснение:</h4>
            <div style={{
              whiteSpace: 'pre-wrap',
              border: '1px solid #ccc',
              padding: '15px',
              background: '#f9f9f9'
            }}>
              {ragData.explanation}
            </div>
          </div>
        </section>
      )}

      {/* ============ КНОПКИ ДЕЙСТВИЙ ============ */}
      <hr />
      <div>
        <button onClick={onReset}>🔄 Новый анализ</button>
        
        {ragData && (
          <button onClick={onDownloadPDF}>
            📄 Скачать PDF отчет
          </button>
        )}
      </div>
    </div>
  );
}
