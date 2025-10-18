import { Steps, Affix } from 'antd';
import { 
  FormOutlined, 
  BarChartOutlined, 
  RobotOutlined 
} from '@ant-design/icons';

export default function ProgressIndicator({ currentStep, llmLoading }) {
  // Определяем статусы для каждого шага
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStep) return 'finish';
    if (stepIndex === currentStep) {
      // Если это шаг LLM и идет загрузка
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
      status: getStepStatus(0)
    },
    {
      title: 'Аналитика',
      description: 'Dashboard',
      icon: <BarChartOutlined />,
      status: getStepStatus(1)
    },
    {
      title: 'AI заключение',
      description: llmLoading ? 'Генерация...' : 'Рекомендации',
      icon: <RobotOutlined />,
      status: getStepStatus(2)
    },
  ];

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
          items={items}
          size="small"
        />
      </div>
    </Affix>
  );
}
