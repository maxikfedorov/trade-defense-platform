import { Steps, Affix } from 'antd';
import { 
  FormOutlined, 
  BarChartOutlined, 
  RobotOutlined 
} from '@ant-design/icons';

export default function ProgressIndicator({ currentStep, llmLoading, onStepClick }) {
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'finish';
    if (stepIndex === currentStep) {
      if (stepIndex === 2 && llmLoading) return 'process';
      return 'process';
    }
    return 'wait';
  };

  const items = [
    {
      title: 'Ввод данных',
      description: 'Код ТН ВЭД',
      icon: <FormOutlined />,
      status: getStepStatus(0),
      disabled: currentStep < 1 // Нельзя вернуться на ввод со страницы анализа
    },
    {
      title: 'Аналитика',
      description: 'Dashboard',
      icon: <BarChartOutlined />,
      status: getStepStatus(1),
      disabled: currentStep < 1
    },
    {
      title: 'AI заключение',
      description: llmLoading ? 'Генерация...' : 'Рекомендации',
      icon: <RobotOutlined />,
      status: getStepStatus(2),
      disabled: currentStep < 2
    },
  ];

  const handleStepClick = (stepIndex) => {
    // Разрешаем клик только если шаг уже пройден или это текущий шаг
    if (stepIndex <= currentStep && onStepClick) {
      onStepClick(stepIndex);
    }
  };

  return (
    <Affix offsetTop={80}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: 12,
        border: '1px solid #E8E6E3',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        minWidth: 240
      }}>
        <Steps
          direction="vertical"
          current={currentStep}
          items={items.map((item, index) => ({
            ...item,
            style: { cursor: index <= currentStep ? 'pointer' : 'not-allowed' },
            onClick: () => handleStepClick(index)
          }))}
          size="small"
        />
      </div>
    </Affix>
  );
}
