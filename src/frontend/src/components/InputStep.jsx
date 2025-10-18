import { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Alert } from 'antd';
import { 
  SearchOutlined, 
  ThunderboltOutlined,
  BarChartOutlined,
  RiseOutlined,
  GlobalOutlined,
  BulbOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function InputStep({ onSubmit, isLoading }) {
  const [form] = Form.useForm();
  const [error, setError] = useState('');

  const handleSubmit = (values) => {
    const tnvedCode = values.tnved_code.trim();
    
    if (!tnvedCode) {
      setError('Введите код ТН ВЭД');
      return;
    }

    setError('');
    onSubmit(tnvedCode);
  };

  const handleValuesChange = () => {
    if (error) setError('');
  };

  return (
    <div style={{ 
      maxWidth: 720, 
      margin: '0 auto',
      paddingTop: '40px'
    }}>
      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 48 
      }}>
        <Title 
          level={1} 
          style={{ 
            marginBottom: 16,
            fontSize: 36,
            fontWeight: 600,
            color: '#3D3D3D',
            letterSpacing: '-0.5px'
          }}
        >
          Анализ таможенно-тарифных мер
        </Title>
        <Paragraph 
          style={{ 
            fontSize: 16, 
            color: '#8A8A8A',
            maxWidth: 560,
            margin: '0 auto',
            lineHeight: 1.6
          }}
        >
          Получите комплексный анализ мер ТТР на основе искусственного интеллекта 
          и актуальных данных о рынке
        </Paragraph>
      </div>

      {/* Main Form Card */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          border: '1px solid #E8E6E3',
          marginBottom: 32
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          size="large"
        >
          <Form.Item
            name="tnved_code"
            label={
              <Text strong style={{ fontSize: 15, color: '#3D3D3D' }}>
                Код товара по ТН ВЭД
              </Text>
            }
            validateStatus={error ? 'error' : ''}
            help={error}
            style={{ marginBottom: 24 }}
          >
            <Input
              placeholder="Например: 8428 10"
              prefix={<SearchOutlined style={{ color: '#B8B8B8' }} />}
              disabled={isLoading}
              style={{
                height: 48,
                fontSize: 15,
                borderRadius: 8,
              }}
              autoFocus
            />
          </Form.Item>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ 
                marginBottom: 24,
                borderRadius: 8 
              }}
            />
          )}

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              icon={<ThunderboltOutlined />}
              block
              style={{
                height: 48,
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(139, 157, 131, 0.25)',
              }}
            >
              {isLoading ? 'Анализируем данные...' : 'Начать анализ'}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Info Section */}
      <Card
        style={{
          borderRadius: 12,
          background: 'linear-gradient(135deg, #F9F7F4 0%, #FEFDFB 100%)',
          border: '1px solid #E8E6E3',
        }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#8B9D83'
            }} />
            <Title level={5} style={{ margin: 0, fontWeight: 600, color: '#3D3D3D' }}>
              Что вы получите:
            </Title>
          </div>

          <Space direction="vertical" size={12}>
            <InfoItem 
              icon={<BarChartOutlined style={{ fontSize: 20, color: '#8B9D83' }} />}
              text="Анализ текущих ставок таможенных пошлин и обязательств по ВТО" 
            />
            <InfoItem 
              icon={<RiseOutlined style={{ fontSize: 20, color: '#8B9D83' }} />}
              text="Динамику импорта, производства и потребления за последние 3 года" 
            />
            <InfoItem 
              icon={<GlobalOutlined style={{ fontSize: 20, color: '#8B9D83' }} />}
              text="Географическую структуру импорта с долями стран-поставщиков" 
            />
            <InfoItem 
              icon={<BulbOutlined style={{ fontSize: 20, color: '#8B9D83' }} />}
              text="Рекомендации по применению тарифных и нетарифных мер" 
            />
            <InfoItem 
              icon={<RobotOutlined style={{ fontSize: 20, color: '#8B9D83' }} />}
              text="Экспертное заключение на основе AI и нормативной базы" 
            />
          </Space>
        </Space>
      </Card>

      {/* Example Hint */}
      <div style={{ 
        marginTop: 24, 
        textAlign: 'center' 
      }}>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Не знаете код? Попробуйте: <Text code>8428 10</Text> (лифты) или <Text code>8472 30</Text> (банкоматы)
        </Text>
      </div>
    </div>
  );
}

// Helper component для списка преимуществ
function InfoItem({ icon, text }) {
  return (
    <div style={{ 
      display: 'flex', 
      gap: 12, 
      alignItems: 'flex-start' 
    }}>
      <div style={{ 
        flexShrink: 0,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F3F0',
        borderRadius: 8
      }}>
        {icon}
      </div>
      <Text style={{ 
        fontSize: 14, 
        color: '#3D3D3D',
        lineHeight: 1.6,
        paddingTop: 6
      }}>
        {text}
      </Text>
    </div>
  );
}
