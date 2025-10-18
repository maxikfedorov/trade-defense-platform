export default function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className="progress-indicator">
      <div className="steps-container">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div key={index} className="step-item">
            <div 
              className={`step-circle ${index <= currentStep ? 'active' : ''}`}
              data-step={index + 1}
            >
              {index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div className={`step-line ${index < currentStep ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
      <div className="step-labels">
        <span>Ввод ТН ВЭД</span>
        <span>Анализ данных</span>
        <span>Рекомендации LLM</span>
      </div>
    </div>
  );
}
