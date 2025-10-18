import { Modal, Typography, Space, Divider, Tag, Descriptions } from 'antd';
import { 
  InfoCircleOutlined,
  RocketOutlined,
  CodeOutlined,
  SafetyOutlined,
  TrophyOutlined,
  TeamOutlined,
  TagOutlined,
  CloudOutlined,
  DatabaseOutlined,
  ApiOutlined,
  RobotOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

export default function AboutModal({ isOpen, onClose }) {
  return (
    <Modal
      title={
        <Space>
          <InfoCircleOutlined style={{ color: '#8B9D83', fontSize: 20 }} />
          <span style={{ fontSize: 18, fontWeight: 600 }}>О проекте</span>
        </Space>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{
        body: { maxHeight: '75vh', overflowY: 'auto', padding: '24px 24px 16px' }
      }}
    >
      <Space direction="vertical" size={28} style={{ width: '100%' }}>
        {/* Название */}
        <div>
          <Space align="start" size={12}>
            <RocketOutlined style={{ fontSize: 22, color: '#8B9D83', marginTop: 2 }} />
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 10, fontSize: 16 }}>
                Название проекта
              </Title>
              <Text strong style={{ fontSize: 15, lineHeight: 1.6 }}>
                Система автоматизированной оценки эффективности мер таможенно-тарифного регулирования
              </Text>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Цель */}
        <div>
          <Space align="start" size={12}>
            <InfoCircleOutlined style={{ fontSize: 22, color: '#8B9D83', marginTop: 2 }} />
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 10, fontSize: 16 }}>
                Цель проекта
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#3D3D3D' }}>
                Разработка интеллектуальной аналитической системы для предоставления предприятиям 
                Москвы комплексной информации о мерах таможенно-тарифного регулирования на основе 
                анализа импорта, производства, потребления и применения технологий искусственного интеллекта.
              </Paragraph>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Технологии */}
        <div>
          <Space align="start" size={12} style={{ width: '100%', alignItems: 'flex-start' }}>
            <CodeOutlined style={{ fontSize: 22, color: '#8B9D83', marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <Title level={4} style={{ margin: 0, marginBottom: 16, fontSize: 16 }}>
                Технологический стек
              </Title>
              
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* Frontend */}
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="blue" icon={<ApiOutlined />}>Frontend</Tag>
                  </div>
                  <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                    React 18, Vite, Ant Design 5, Node.js 22.18.0
                  </Text>
                </div>

                {/* Backend Gateway */}
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="volcano" icon={<ApiOutlined />}>Backend Gateway</Tag>
                  </div>
                  <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                    Kotlin, Java Spring Boot
                  </Text>
                </div>

                {/* AI Backend */}
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="purple" icon={<CloudOutlined />}>AI Backend</Tag>
                  </div>
                  <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                    Python, FastAPI, OpenAI API, Sentence Transformers
                  </Text>
                </div>

                {/* AI Models */}
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="magenta" icon={<RobotOutlined />}>AI Модели</Tag>
                  </div>
                  <Descriptions column={1} size="small" colon={false}>
                    <Descriptions.Item 
                      label={<Text style={{ fontSize: 12, color: '#8A8A8A' }}>LLM:</Text>}
                    >
                      <Text code style={{ fontSize: 12 }}>yandex/YandexGPT-5-Lite-8B</Text>
                    </Descriptions.Item>
                    <Descriptions.Item 
                      label={<Text style={{ fontSize: 12, color: '#8A8A8A' }}>Embeddings:</Text>}
                    >
                      <Text code style={{ fontSize: 12 }}>deepvk/USER-bge-m3</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>

                {/* Databases */}
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="green" icon={<DatabaseOutlined />}>Базы данных</Tag>
                  </div>
                  <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                    Qdrant (Vector DB), PostgreSQL
                  </Text>
                </div>

                {/* Infrastructure */}
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="cyan" icon={<CloudOutlined />}>Инфраструктура</Tag>
                  </div>
                  <Text style={{ fontSize: 13, lineHeight: 1.6 }}>
                    Docker (контейнеризация), jsPDF (экспорт)
                  </Text>
                </div>
              </Space>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Дисклеймер */}
        <div>
          <Space align="start" size={12}>
            <SafetyOutlined style={{ fontSize: 22, color: '#D4A59A', marginTop: 2 }} />
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 10, fontSize: 16 }}>
                Дисклеймер
              </Title>
              <Paragraph style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#3D3D3D' }}>
                Данный проект разработан в образовательных целях в рамках хакатона «Открой#Моспром». 
                Система является прототипом и предназначена для демонстрации возможностей применения 
                технологий искусственного интеллекта в области анализа таможенно-тарифного регулирования.
              </Paragraph>
              <div
                style={{ 
                  marginTop: 12,
                  fontSize: 12, 
                  lineHeight: 1.6,
                  padding: '12px 16px',
                  background: '#FFF7E6',
                  borderRadius: 8,
                  border: '1px solid #FFD591',
                  color: '#8A8A8A'
                }}
              >
                <Text style={{ fontSize: 12 }}>
                  ⚠️ Информация носит справочный характер и не является официальной рекомендацией. 
                  Для актуальных данных обращайтесь к ФТС России и Минпромторга РФ.
                </Text>
              </div>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Хакатон */}
        <div>
          <Space align="start" size={12}>
            <TrophyOutlined style={{ fontSize: 22, color: '#8B9D83', marginTop: 2 }} />
            <div>
              <Title level={4} style={{ margin: 0, marginBottom: 12, fontSize: 16 }}>
                О хакатоне
              </Title>
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label={<Text strong style={{ fontSize: 13 }}>Хакатон</Text>}>
                  <Text style={{ fontSize: 13 }}>«Открой#Моспром»</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong style={{ fontSize: 13 }}>Организатор</Text>}>
                  <Text style={{ fontSize: 13 }}>Департамент инвестиционной и промышленной политики г. Москвы</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong style={{ fontSize: 13 }}>Даты</Text>}>
                  <Text style={{ fontSize: 13 }}>17-19 октября 2025</Text>
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong style={{ fontSize: 13 }}>Кейс</Text>}>
                  <Text style={{ fontSize: 13 }}>
                    Автоматизированная система оценки эффективности мер ТТР
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Space>
        </div>

        <Divider style={{ margin: 0 }} />

        {/* Версия и авторы */}
        <Space size={40} style={{ width: '100%' }}>
          <div>
            <Space align="start" size={12}>
              <TagOutlined style={{ fontSize: 22, color: '#8B9D83', marginTop: 2 }} />
              <div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  Версия
                </Title>
                <Tag color="geekblue" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6 }}>
                  v1.0.0 (MVP)
                </Tag>
              </div>
            </Space>
          </div>

          <div>
            <Space align="start" size={12}>
              <TeamOutlined style={{ fontSize: 22, color: '#8B9D83', marginTop: 2 }} />
              <div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  Авторы
                </Title>
                <Text style={{ fontSize: 13 }}>Команда «Открой#Моспром» 2025</Text>
              </div>
            </Space>
          </div>
        </Space>
      </Space>
    </Modal>
  );
}
