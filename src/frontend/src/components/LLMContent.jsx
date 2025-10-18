import { Card, Typography, Space, Tag, List, Divider, Timeline } from 'antd';
import { 
  RobotOutlined, 
  FileTextOutlined, 
  SearchOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { Title, Paragraph, Text } = Typography;

export default function LLMContent({ data }) {
  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* AI Header Card */}
      <Card
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #8B9D83 0%, #A8C5A0 100%)',
          border: 'none',
          color: 'white',
        }}
      >
        <Space align="center" size={16}>
          <RobotOutlined style={{ fontSize: 48, color: 'white' }} />
          <div>
            <Title level={2} style={{ color: 'white', margin: 0, marginBottom: 8 }}>
              Экспертное заключение AI
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15 }}>
              Анализ на основе нормативной базы и методов машинного обучения
            </Text>
          </div>
        </Space>
      </Card>

      {/* Sources Card */}
      <Card
        title={
          <Space>
            <FileTextOutlined style={{ color: '#8B9D83' }} />
            <span>Источники анализа</span>
          </Space>
        }
        extra={
          <Tag color="blue" style={{ borderRadius: 6 }}>
            Найдено: {data.sources_found}
          </Tag>
        }
        style={{ borderRadius: 12, border: '1px solid #E8E6E3' }}
      >
        {data.top_sources && data.top_sources.length > 0 ? (
          <List
            dataSource={data.top_sources}
            renderItem={(source, idx) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: '#F5F3F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      color: '#8B9D83'
                    }}>
                      {idx + 1}
                    </div>
                  }
                  title={
                    <Text strong style={{ fontSize: 14 }}>
                      {source.filename}
                    </Text>
                  }
                  description={
                    <Space size={8}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Релевантность:
                      </Text>
                      <Tag color="green" style={{ borderRadius: 6 }}>
                        {(source.relevance_score * 100).toFixed(1)}%
                      </Tag>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">Источники не указаны</Text>
        )}
      </Card>

      {/* RAG Queries */}
      {data.rag_queries && data.rag_queries.length > 0 && (
        <Card
          title={
            <Space>
              <SearchOutlined style={{ color: '#8B9D83' }} />
              <span>Использованные поисковые запросы</span>
            </Space>
          }
          style={{ borderRadius: 12, border: '1px solid #E8E6E3' }}
        >
          <Timeline
            items={data.rag_queries.map((query) => ({
              dot: <CheckCircleOutlined style={{ fontSize: 16, color: '#8B9D83' }} />,
              children: (
                <Text style={{ fontSize: 14 }}>{query}</Text>
              )
            }))}
          />
        </Card>
      )}

      {/* Main Explanation - с Markdown рендерингом */}
      <Card
        title={
          <Space>
            <RobotOutlined style={{ color: '#8B9D83' }} />
            <span>Детальное объяснение</span>
          </Space>
        }
        style={{ 
          borderRadius: 12, 
          border: '1px solid #E8E6E3',
          background: '#FEFDFB'
        }}
      >
        <div 
          className="markdown-content"
          style={{
            padding: 20,
            background: 'white',
            borderRadius: 8,
            border: '1px solid #F0EDE9'
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Кастомные стили для markdown элементов
              h1: ({node, ...props}) => <h1 style={{ fontSize: 24, fontWeight: 600, color: '#3D3D3D', marginTop: 24, marginBottom: 16 }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ fontSize: 20, fontWeight: 600, color: '#3D3D3D', marginTop: 20, marginBottom: 12 }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ fontSize: 17, fontWeight: 600, color: '#3D3D3D', marginTop: 16, marginBottom: 10 }} {...props} />,
              h4: ({node, ...props}) => <h4 style={{ fontSize: 15, fontWeight: 600, color: '#3D3D3D', marginTop: 12, marginBottom: 8 }} {...props} />,
              p: ({node, ...props}) => <p style={{ fontSize: 14, lineHeight: 1.8, color: '#3D3D3D', marginBottom: 12 }} {...props} />,
              ul: ({node, ...props}) => <ul style={{ fontSize: 14, lineHeight: 1.8, color: '#3D3D3D', paddingLeft: 24, marginBottom: 12 }} {...props} />,
              ol: ({node, ...props}) => <ol style={{ fontSize: 14, lineHeight: 1.8, color: '#3D3D3D', paddingLeft: 24, marginBottom: 12 }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: 6 }} {...props} />,
              blockquote: ({node, ...props}) => (
                <blockquote style={{
                  borderLeft: '4px solid #8B9D83',
                  paddingLeft: 16,
                  marginLeft: 0,
                  marginBottom: 12,
                  color: '#8A8A8A',
                  fontStyle: 'italic'
                }} {...props} />
              ),
              code: ({node, inline, ...props}) => 
                inline ? (
                  <code style={{
                    background: '#F5F3F0',
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 13,
                    color: '#8B9D83',
                    fontFamily: 'monospace'
                  }} {...props} />
                ) : (
                  <code style={{
                    display: 'block',
                    background: '#F5F3F0',
                    padding: 12,
                    borderRadius: 6,
                    fontSize: 13,
                    color: '#3D3D3D',
                    fontFamily: 'monospace',
                    marginBottom: 12,
                    overflowX: 'auto'
                  }} {...props} />
                ),
              strong: ({node, ...props}) => <strong style={{ fontWeight: 600, color: '#3D3D3D' }} {...props} />,
              em: ({node, ...props}) => <em style={{ fontStyle: 'italic', color: '#8A8A8A' }} {...props} />,
              a: ({node, ...props}) => <a style={{ color: '#8B9D83', textDecoration: 'underline' }} {...props} />,
              table: ({node, ...props}) => (
                <div style={{ overflowX: 'auto', marginBottom: 12 }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    fontSize: 13
                  }} {...props} />
                </div>
              ),
              th: ({node, ...props}) => (
                <th style={{
                  background: '#F5F3F0',
                  padding: '8px 12px',
                  border: '1px solid #E8E6E3',
                  fontWeight: 600,
                  textAlign: 'left'
                }} {...props} />
              ),
              td: ({node, ...props}) => (
                <td style={{
                  padding: '8px 12px',
                  border: '1px solid #E8E6E3'
                }} {...props} />
              ),
            }}
          >
            {data.explanation}
          </ReactMarkdown>
        </div>
      </Card>

      {/* Algorithm Summary */}
      {data.algorithm_result && (
        <Card
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#8B9D83' }} />
              <span>Краткая сводка алгоритма</span>
            </Space>
          }
          style={{ 
            borderRadius: 12, 
            border: '1px solid #E8E6E3',
            background: 'linear-gradient(135deg, #F9F7F4 0%, #FEFDFB 100%)'
          }}
        >
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Продукт:</Text>
              <br />
              <Text strong style={{ fontSize: 15 }}>
                {data.algorithm_result.metadata.product_name}
              </Text>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Рекомендуемые тарифные меры:</Text>
              <br />
              <Space wrap style={{ marginTop: 4 }}>
                {data.algorithm_result.tariff_measures.measures.map((measure, idx) => (
                  <Tag key={idx} color="success" style={{ borderRadius: 6, fontSize: 13 }}>
                    {measure}
                  </Tag>
                ))}
              </Space>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Рекомендуемые нетарифные меры:</Text>
              <br />
              <Space wrap style={{ marginTop: 4 }}>
                {data.algorithm_result.nontariff_measures.measures.map((measure, idx) => (
                  <Tag key={idx} color="processing" style={{ borderRadius: 6, fontSize: 13 }}>
                    {measure}
                  </Tag>
                ))}
              </Space>
            </div>
          </Space>
        </Card>
      )}
    </Space>
  );
}
