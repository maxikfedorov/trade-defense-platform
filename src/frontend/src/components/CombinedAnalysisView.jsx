import DashboardContent from './DashboardContent';
import LLMContent from './LLMContent';

export default function CombinedAnalysisView({ 
  dashboardData, 
  llmData,
  llmLoading,
  llmError,
  onLoadLLM,
  onReset,
  onExportPDF 
}) {
  return (
    <>
      {/* Контейнер для PDF - БЕЗ кнопок */}
      <div id="analysis-report">
        {/* Dashboard Section - всегда видна */}
        <section id="dashboard-section">
          <DashboardContent data={dashboardData} />
        </section>

        {/* LLM Section */}
        <section id="llm-section">
          {llmLoading && (
            <div>
              <h3>Генерируем экспертное заключение...</h3>
              <p>Анализируем данные с помощью LLM...</p>
            </div>
          )}

          {llmError && (
            <div>
              <h3>Ошибка: {llmError}</h3>
            </div>
          )}

          {llmData && !llmLoading && (
            <LLMContent data={llmData} />
          )}
        </section>
      </div>

      {/* Кнопки ВНЕ контейнера для экспорта */}
      <section>
        {!llmData && !llmLoading && (
          <button onClick={onLoadLLM}>
            Получить экспертное заключение AI
          </button>
        )}
        
        <button onClick={onReset}>
          Новый анализ
        </button>
        
        {/* Убрали условие llmData - кнопка доступна всегда */}
        <button onClick={onExportPDF}>
          Экспортировать в PDF
        </button>
      </section>
    </>
  );
}
