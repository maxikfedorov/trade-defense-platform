export default function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: 'white',
        padding: '30px',
        maxWidth: '600px',
        maxHeight: '80vh',
        overflowY: 'auto',
        borderRadius: '8px'
      }}>
        <h2>О проекте</h2>
        
        <section>
          <h3>Название</h3>
          <p><strong>Система автоматизированной оценки эффективности мер таможенно-тарифного регулирования</strong></p>
        </section>

        <section>
          <h3>Цель проекта</h3>
          <p>
            Разработка интеллектуальной аналитической системы для предоставления предприятиям 
            Москвы комплексной информации о мерах таможенно-тарифного регулирования на основе 
            анализа импорта, производства, потребления и применения технологий искусственного интеллекта.
          </p>
        </section>

        <section>
          <h3>Технологический стек</h3>
          <ul>
            <li><strong>Frontend:</strong> React 18 + Vite</li>
            <li><strong>Backend:</strong> FastAPI (Python)</li>
            <li><strong>AI/ML:</strong> OpenAI GPT, RAG (Retrieval-Augmented Generation), Qdrant Vector DB</li>
            <li><strong>Данные:</strong> PostgreSQL, анализ ТН ВЭД, ОКПД2</li>
            <li><strong>Экспорт:</strong> jsPDF, html2canvas</li>
          </ul>
        </section>

        <section>
          <h3>Дисклеймер</h3>
          <p>
            Данный проект разработан в образовательных целях в рамках хакатона «Открой#Моспром». 
            Система является прототипом и предназначена для демонстрации возможностей применения 
            технологий искусственного интеллекта в области анализа таможенно-тарифного регулирования.
          </p>
          <p>
            <em>
              Информация, предоставляемая системой, носит справочный характер и не является 
              официальной рекомендацией для принятия управленческих решений. Для получения 
              актуальных данных обращайтесь к официальным источникам ФТС России и Минпромторга РФ.
            </em>
          </p>
        </section>

        <section>
          <h3>О хакатоне</h3>
          <p>
            <strong>Хакатон:</strong> «Открой#Моспром»<br/>
            <strong>Организатор:</strong> Департамент инвестиционной и промышленной политики города Москвы<br/>
            <strong>Даты проведения:</strong> 17-19 октября 2025<br/>
            <strong>Кейс:</strong> Разработка автоматизированной информационной системы для системной 
            оценки эффективности мер таможенно-тарифного регулирования
          </p>
        </section>

        <section>
          <h3>Версия</h3>
          <p>1.0.0 (MVP)</p>
        </section>

        <section>
          <h3>Авторы</h3>
          <p>Команда участников хакатона «Открой#Моспром» 2025</p>
        </section>

        <button onClick={onClose} style={{ marginTop: '20px' }}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
