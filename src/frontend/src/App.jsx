import { useState } from 'react';
import { ConfigProvider, Layout, Button, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { apiClient } from './api/client';
import ProgressIndicator from './components/ProgressIndicator';
import InputStep from './components/InputStep';
import CombinedAnalysisView from './components/CombinedAnalysisView';
import AboutModal from './components/AboutModal';
import { exportToPDF } from './utils/pdfExport';

const { Header, Content, Footer } = Layout;

const STEPS = {
  INPUT: 0,
  ANALYSIS: 1,
  LLM: 2
};

// Кастомная тема (без изменений)
const customTheme = {
  token: {
    colorPrimary: '#8B9D83',
    colorSuccess: '#A8C5A0',
    colorWarning: '#E8D5B7',
    colorError: '#D4A59A',
    colorInfo: '#B8C5D6',
    colorBgBase: '#F9F7F4',
    colorBgContainer: '#FFFFFF',
    colorBgElevated: '#FEFDFB',
    colorBgLayout: '#F5F3F0',
    colorText: '#3D3D3D',
    colorTextSecondary: '#8A8A8A',
    colorTextTertiary: '#B8B8B8',
    colorBorder: '#E8E6E3',
    colorBorderSecondary: '#F0EDE9',
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
  },
  components: {
    Layout: {
      headerBg: '#FFFFFF',
      headerPadding: '0 48px',
      bodyBg: '#F9F7F4',
      footerBg: '#FFFFFF',
    },
    Button: {
      primaryShadow: '0 2px 8px rgba(139, 157, 131, 0.15)',
      controlHeight: 40,
      controlHeightLG: 48,
      fontWeight: 500,
    },
    Card: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      borderRadius: 12,
    },
    Table: {
      headerBg: '#F5F3F0',
      headerColor: '#3D3D3D',
      rowHoverBg: '#F9F7F4',
    },
  },
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

    setCurrentStep(STEPS.LLM);
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
    } catch (err) {
      console.error('PDF Export Error:', err);
    }
  };

  const handleReset = () => {
    setCurrentStep(STEPS.INPUT);
    setTariffData(null);
    setRagData(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Плавная навигация по секциям
  const handleStepClick = (stepIndex) => {
    if (stepIndex === 0) {
      // Ввод данных - возврат на начало
      handleReset();
      return;
    }

    if (stepIndex === 1) {
      // Dashboard - скролл к дашборду
      const element = document.getElementById('dashboard-section');
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }

    if (stepIndex === 2) {
      // LLM - скролл к секции LLM
      const element = document.getElementById('llm-section');
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <ConfigProvider theme={customTheme}>
      <Layout style={{ minHeight: '100vh' }}>
        {/* Header - с кликабельным логотипом */}
        <Header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 48px',
            height: 72,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            borderBottom: '1px solid #E8E6E3',
            position: 'sticky',
            top: 0,
            zIndex: 999
          }}
        >
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
            onClick={handleReset}
          >
            {/* Логотип */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #8B9D83 0%, #A8C5A0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: 'white',
              flexShrink: 0,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 157, 131, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              ТТР
            </div>
            
            {/* Текст */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ 
                fontSize: 17, 
                fontWeight: 600,
                color: '#3D3D3D',
                letterSpacing: '-0.3px',
                lineHeight: 1.3,
                marginBottom: 2
              }}>
                Система анализа ТТР
              </div>
              <div style={{ 
                fontSize: 12, 
                color: '#8A8A8A',
                fontWeight: 400,
                lineHeight: 1.2
              }}>
                Хакатон Моспром 2025
              </div>
            </div>
          </div>
          
          <Button
            type="text"
            icon={<InfoCircleOutlined />}
            onClick={() => setIsAboutOpen(true)}
            style={{ 
              height: 40,
              fontSize: 14,
              color: '#8B9D83',
              fontWeight: 500
            }}
          >
            О проекте
          </Button>
        </Header>

        {/* Main Content */}
        <Content style={{ padding: '32px 48px 24px' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            {currentStep === STEPS.INPUT && (
              <InputStep 
                onSubmit={handleTnvedSubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep >= STEPS.ANALYSIS && tariffData && (
              <Row gutter={24}>
                {/* Боковой интерактивный прогресс */}
                <Col xs={0} lg={6} xl={5}>
                  <ProgressIndicator 
                    currentStep={currentStep} 
                    llmLoading={llmLoading}
                    onStepClick={handleStepClick}
                  />
                </Col>

                {/* Основной контент */}
                <Col xs={24} lg={18} xl={19}>
                  <CombinedAnalysisView
                    dashboardData={tariffData}
                    llmData={ragData}
                    llmLoading={llmLoading}
                    llmError={error}
                    onLoadLLM={handleLoadLLM}
                    onReset={handleReset}
                    onExportPDF={handleExportPDF}
                  />
                </Col>
              </Row>
            )}
          </div>
        </Content>

        {/* Footer */}
        <Footer style={{ 
          textAlign: 'center', 
          padding: '20px 48px',
          borderTop: '1px solid #E8E6E3',
          fontSize: 12,
          color: '#8A8A8A'
        }}>
          Департамент инвестиционной и промышленной политики города Москвы
        </Footer>
      </Layout>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </ConfigProvider>
  );
}

export default App;
