import { Space, Button, Spin, Alert } from 'antd';
import { 
  ReloadOutlined, 
  DownloadOutlined, 
  RobotOutlined,
  LoadingOutlined 
} from '@ant-design/icons';
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
    <Space direction="vertical" size={32} style={{ width: '100%' }}>
      {/* Контейнер для PDF - БЕЗ кнопок */}
      <div id="analysis-report">
        {/* Dashboard Section - всегда видна */}
        <DashboardContent data={dashboardData} />

        {/* LLM Section */}
        {llmLoading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 24px',
            background: 'linear-gradient(135deg, #F9F7F4 0%, #FEFDFB 100%)',
            borderRadius: 16,
            marginTop: 32
          }}>
            <Spin 
              indicator={<LoadingOutlined style={{ fontSize: 48, color: '#8B9D83' }} spin />}
              size="large"
            />
            <h3 style={{ 
              marginTop: 24, 
              marginBottom: 8,
              fontSize: 20,
              fontWeight: 600,
              color: '#3D3D3D'
            }}>
              Генерируем заключение нейросети
            </h3>
            <p style={{ 
              fontSize: 14, 
              color: '#8A8A8A',
              margin: 0
            }}>
              Анализируем данные с помощью LLM и нормативной базы...
            </p>
          </div>
        )}

        {llmError && (
          <Alert
            message="Ошибка получения экспертного заключения"
            description={llmError}
            type="error"
            showIcon
            style={{ 
              marginTop: 32,
              borderRadius: 12 
            }}
          />
        )}

        {llmData && !llmLoading && (
          <div style={{ marginTop: 32 }}>
            <LLMContent data={llmData} />
          </div>
        )}
      </div>

      {/* Кнопки ВНЕ контейнера для экспорта */}
      <div style={{
        padding: '24px',
        background: 'white',
        borderRadius: 12,
        border: '1px solid #E8E6E3',
        position: 'sticky',
        bottom: 24,
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
        zIndex: 100
      }}>
        <Space size={12} wrap style={{ width: '100%', justifyContent: 'center' }}>
          {!llmData && !llmLoading && (
            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              onClick={onLoadLLM}
              style={{
                height: 48,
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 8,
                minWidth: 240
              }}
            >
              Получить экспертное заключение AI
            </Button>
          )}
          
          <Button
            size="large"
            icon={<DownloadOutlined />}
            onClick={onExportPDF}
            style={{
              height: 48,
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 8,
              minWidth: 200
            }}
          >
            Экспортировать в PDF
          </Button>

          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={onReset}
            style={{
              height: 48,
              fontSize: 15,
              fontWeight: 500,
              borderRadius: 8,
              minWidth: 160
            }}
          >
            Новый анализ
          </Button>
        </Space>
      </div>
    </Space>
  );
}
