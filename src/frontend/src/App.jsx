import { useState } from 'react';
import { apiClient } from './api/client';
import ProgressIndicator from './components/ProgressIndicator';
import InputStep from './components/InputStep';
import CombinedAnalysisView from './components/CombinedAnalysisView';
import AboutModal from './components/AboutModal';
import { exportToPDF } from './utils/pdfExport';

const STEPS = {
  INPUT: 0,
  ANALYSIS: 1
};

function App() {
  const [currentStep, setCurrentStep] = useState(STEPS.INPUT);
  const [isLoading, setIsLoading] = useState(false);
  const [tariffData, setTariffData] = useState(null);
  const [ragData, setRagData] = useState(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleTnvedSubmit = async (tnvedCode) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.analyzeTariff(tnvedCode);
      setTariffData(result);
      setCurrentStep(STEPS.ANALYSIS);
    } catch (err) {
      setError(err.message || 'Ошибка при анализе ТН ВЭД');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadLLM = async () => {
    if (!tariffData?.metadata?.tnved_code) return;

    setLlmLoading(true);
    setError(null);

    try {
      const result = await apiClient.analyzeFullRAG(tariffData.metadata.tnved_code);
      setRagData(result);
    } catch (err) {
      setError(err.message || 'Ошибка при получении заключения');
    } finally {
      setLlmLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF('analysis-report', `анализ_${tariffData.metadata.tnved_code}.pdf`);
      alert('PDF успешно сохранен!');
    } catch (err) {
      alert('Ошибка при экспорте PDF: ' + err.message);
    }
  };

  const handleReset = () => {
    setCurrentStep(STEPS.INPUT);
    setTariffData(null);
    setRagData(null);
    setError(null);
  };

  return (
    <div>
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Система анализа таможенно-тарифного регулирования</h1>
            <p>Хакатон Моспром 2025</p>
          </div>
          <button onClick={() => setIsAboutOpen(true)}>
            О проекте
          </button>
        </div>
      </header>

      <main>
        {currentStep === STEPS.ANALYSIS && (
          <ProgressIndicator currentStep={1} totalSteps={2} />
        )}

        {currentStep === STEPS.INPUT && (
          <InputStep 
            onSubmit={handleTnvedSubmit}
            isLoading={isLoading}
          />
        )}

        {currentStep === STEPS.ANALYSIS && tariffData && (
          <CombinedAnalysisView
            dashboardData={tariffData}
            llmData={ragData}
            llmLoading={llmLoading}
            llmError={error}
            onLoadLLM={handleLoadLLM}
            onReset={handleReset}
            onExportPDF={handleExportPDF}
          />
        )}

        {error && currentStep === STEPS.INPUT && (
          <div>
            <p>{error}</p>
            <button onClick={handleReset}>Попробовать снова</button>
          </div>
        )}
      </main>

      <footer>
        <p>Департамент инвестиционной и промышленной политики города Москвы</p>
      </footer>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

export default App;
