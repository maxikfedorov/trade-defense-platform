import { useState } from 'react';

export default function InputStep({ onSubmit, isLoading }) {
  const [tnvedCode, setTnvedCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!tnvedCode.trim()) {
      setError('Введите код ТН ВЭД');
      return;
    }

    setError('');
    onSubmit(tnvedCode.trim());
  };

  return (
    <div className="input-step">
      <h1>Анализ таможенно-тарифных мер</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="tnved-input">
            Код ТН ВЭД
          </label>
          <input
            id="tnved-input"
            type="text"
            value={tnvedCode}
            onChange={(e) => setTnvedCode(e.target.value)}
            placeholder="Например: 8428 10"
            disabled={isLoading}
          />
          {error && <span className="error-message">{error}</span>}
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? 'Анализируем...' : 'Начать анализ'}
          </button>
        </div>
      </form>

      <div className="info-section">
        <h3>Что вы получите:</h3>
        <ul>
          <li>Анализ текущих ставок таможенных пошлин</li>
          <li>Динамику импорта, производства и потребления</li>
          <li>Географическую структуру импорта</li>
          <li>Рекомендации по применению мер ТТР</li>
        </ul>
      </div>
    </div>
  );
}
