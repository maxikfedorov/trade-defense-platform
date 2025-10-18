import { Card, Descriptions, Table, Tag, Space, Typography, Statistic, Row, Col, Divider, Alert } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  GlobalOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

export default function DashboardContent({ data }) {
  const { metadata, product_info, dashboard_data, tariff_measures, nontariff_measures } = data;

  // Расчет трендов
  const importTrend = calculateTrend(dashboard_data.import_dynamics);
  const productionTrend = calculateTrend(dashboard_data.production_dynamics);
  const consumptionTrend = calculateTrend(dashboard_data.consumption_dynamics);

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {/* Header Card - Metadata */}
      <Card
        style={{
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E8E6E3',
        }}
      >
        <Title level={3} style={{ marginBottom: 24, color: '#3D3D3D' }}>
          Информация о товаре
        </Title>

        <Descriptions
          column={{ xs: 1, sm: 2, md: 2, lg: 3 }}
          labelStyle={{ fontWeight: 500, color: '#8A8A8A' }}
          contentStyle={{ color: '#3D3D3D', fontWeight: 500 }}
        >
          <Descriptions.Item label="Код ТН ВЭД">
            <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px', borderRadius: 6 }}>
              {metadata.tnved_code}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Продукт">
            <Text strong>{metadata.product_name}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Текущая пошлина">
            <Tag color="green" style={{ fontSize: 14, padding: '4px 12px', borderRadius: 6 }}>
              {metadata.current_tariff}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Ставка по ВТО">
            <Text strong>{(product_info.wto_rate * 100).toFixed(1)}%</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Сертификация">
            <Tag 
              icon={<CheckCircleOutlined />} 
              color={product_info.has_certification === 'да' ? 'success' : 'default'}
              style={{ borderRadius: 6 }}
            >
              {product_info.has_certification}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        {metadata.okpd_codes && metadata.okpd_codes.length > 0 && (
          <>
            <Divider style={{ margin: '20px 0' }} />
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Коды ОКПД2:</Text>
              <div style={{ marginTop: 8 }}>
                {metadata.okpd_codes.map((okpd, idx) => (
                  <Tag key={idx} style={{ marginTop: 4, borderRadius: 6 }}>
                    {okpd.okpd_code} - {okpd.okpd_name}
                  </Tag>
                ))}
              </div>
            </div>
          </>
        )}

        <Divider style={{ margin: '20px 0' }} />
        
        <Text 
          type="secondary" 
          style={{ 
            fontSize: 12, 
            display: 'block',
            lineHeight: 1.5
          }}
        >
          {metadata.tnved_name}
        </Text>
      </Card>

      {/* Statistics Cards Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, background: '#F9F7F4' }}>
            <Statistic
              title="Импорт 2024"
              value={dashboard_data.import_dynamics[2]?.value_mln_usd.toFixed(2)}
              suffix="млн USD"
              prefix={importTrend > 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ 
                color: importTrend > 0 ? '#8B9D83' : '#D4A59A',
                fontSize: 24
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {importTrend > 0 ? '+' : ''}{importTrend.toFixed(1)}% к 2023
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, background: '#F9F7F4' }}>
            <Statistic
              title="Производство 2024"
              value={dashboard_data.production_dynamics[2]?.value_mln_usd.toFixed(2)}
              suffix="млн USD"
              prefix={productionTrend > 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ 
                color: productionTrend > 0 ? '#8B9D83' : '#D4A59A',
                fontSize: 24
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {productionTrend > 0 ? '+' : ''}{productionTrend.toFixed(1)}% к 2023
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ borderRadius: 12, background: '#F9F7F4' }}>
            <Statistic
              title="Потребление 2024"
              value={dashboard_data.consumption_dynamics[2]?.value_mln_usd.toFixed(2)}
              suffix="млн USD"
              prefix={consumptionTrend > 0 ? <RiseOutlined /> : <FallOutlined />}
              valueStyle={{ 
                color: consumptionTrend > 0 ? '#8B9D83' : '#D4A59A',
                fontSize: 24
              }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {consumptionTrend > 0 ? '+' : ''}{consumptionTrend.toFixed(1)}% к 2023
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Dynamics Tables */}
      <Card
        title={
          <Space>
            <RiseOutlined style={{ color: '#8B9D83' }} />
            <span>Динамика импорта за 3 года</span>
          </Space>
        }
        style={{ borderRadius: 12, border: '1px solid #E8E6E3' }}
      >
        <Table
          dataSource={dashboard_data.import_dynamics}
          columns={[
            {
              title: 'Год',
              dataIndex: 'year',
              key: 'year',
              width: 100,
              render: (year) => <Text strong>{year}</Text>
            },
            {
              title: 'Объем (млн USD)',
              dataIndex: 'value_mln_usd',
              key: 'value',
              render: (val) => <Text>{val.toFixed(2)}</Text>
            },
            {
              title: 'Вес (тонн)',
              dataIndex: 'weight_tons',
              key: 'weight',
              render: (val) => <Text>{val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</Text>
            },
          ]}
          pagination={false}
          size="middle"
          rowKey="year"
        />
      </Card>

      {/* Production & Consumption in Row */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#8B9D83' }} />
                <span>Производство за 3 года</span>
              </Space>
            }
            style={{ borderRadius: 12, border: '1px solid #E8E6E3', height: '100%' }}
          >
            <Table
              dataSource={dashboard_data.production_dynamics}
              columns={[
                {
                  title: 'Год',
                  dataIndex: 'year',
                  key: 'year',
                  render: (year) => <Text strong>{year}</Text>
                },
                {
                  title: 'Объем (млн USD)',
                  dataIndex: 'value_mln_usd',
                  key: 'value',
                  render: (val) => <Text>{val.toFixed(2)}</Text>
                },
              ]}
              pagination={false}
              size="middle"
              rowKey="year"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: '#8B9D83' }} />
                <span>Потребление за 3 года</span>
              </Space>
            }
            style={{ borderRadius: 12, border: '1px solid #E8E6E3', height: '100%' }}
          >
            <Table
              dataSource={dashboard_data.consumption_dynamics}
              columns={[
                {
                  title: 'Год',
                  dataIndex: 'year',
                  key: 'year',
                  render: (year) => <Text strong>{year}</Text>
                },
                {
                  title: 'Объем (млн USD)',
                  dataIndex: 'value_mln_usd',
                  key: 'value',
                  render: (val) => <Text>{val.toFixed(2)}</Text>
                },
              ]}
              pagination={false}
              size="middle"
              rowKey="year"
            />
          </Card>
        </Col>
      </Row>

      {/* Geography Table */}
      <Card
        title={
          <Space>
            <GlobalOutlined style={{ color: '#8B9D83' }} />
            <span>География импорта (топ-10 стран)</span>
          </Space>
        }
        style={{ borderRadius: 12, border: '1px solid #E8E6E3' }}
      >
        <Table
          dataSource={dashboard_data.import_geography
            .filter(c => c.share_percent > 0)
            .slice(0, 10)}
          columns={[
            {
              title: 'Страна',
              dataIndex: 'country',
              key: 'country',
              render: (country, record) => (
                <Space>
                  <Text strong>{country}</Text>
                  {record.is_unfriendly && (
                    <Tag color="orange" style={{ fontSize: 11 }}>недружественная</Tag>
                  )}
                </Space>
              )
            },
            {
              title: 'Объем (млн USD)',
              dataIndex: 'value',
              key: 'value',
              align: 'right',
              render: (val) => <Text>{val.toFixed(2)}</Text>,
              sorter: (a, b) => a.value - b.value,
            },
            {
              title: 'Доля (%)',
              dataIndex: 'share_percent',
              key: 'share',
              align: 'right',
              render: (val) => (
                <Tag color="blue" style={{ borderRadius: 6 }}>
                  {val.toFixed(2)}%
                </Tag>
              ),
              sorter: (a, b) => a.share_percent - b.share_percent,
            },
          ]}
          pagination={false}
          size="middle"
          rowKey="country"
        />
      </Card>

      {/* Contract Prices */}
      <Card
        title={
          <Space>
            <DollarOutlined style={{ color: '#8B9D83' }} />
            <span>Средняя контрактная цена (топ-5)</span>
          </Space>
        }
        style={{ borderRadius: 12, border: '1px solid #E8E6E3' }}
      >
        <Table
          dataSource={dashboard_data.top5_contract_prices}
          columns={[
            {
              title: 'Страна',
              dataIndex: 'country',
              key: 'country',
              render: (country) => <Text strong>{country}</Text>
            },
            {
              title: 'Средняя цена (USD/т)',
              dataIndex: 'avg_price_usd_per_ton',
              key: 'price',
              align: 'right',
              render: (val) => <Text>{val.toFixed(2)}</Text>
            },
            {
              title: 'Объем (млн USD)',
              dataIndex: 'total_value_mln_usd',
              key: 'volume',
              align: 'right',
              render: (val) => <Text>{val.toFixed(2)}</Text>
            },
            {
              title: 'Вес (тонн)',
              dataIndex: 'total_weight_tons',
              key: 'weight',
              align: 'right',
              render: (val) => <Text>{val.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</Text>
            },
          ]}
          pagination={false}
          size="middle"
          rowKey="country"
        />
      </Card>

      {/* Recommendations */}
      <Card
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#8B9D83' }} />
            <span>Рекомендации по применению мер</span>
          </Space>
        }
        style={{ 
          borderRadius: 12, 
          border: '1px solid #E8E6E3',
          background: 'linear-gradient(135deg, #FEFDFB 0%, #F9F7F4 100%)'
        }}
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Tariff Measures */}
          <div>
            <Title level={5} style={{ marginBottom: 12, color: '#3D3D3D' }}>
              Тарифные меры:
            </Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {tariff_measures.measures.map((measure, idx) => (
                <Alert
                  key={idx}
                  message={measure}
                  description={tariff_measures.reasoning[idx]}
                  type="success"
                  showIcon
                  style={{ borderRadius: 8 }}
                />
              ))}
            </Space>
          </div>

          {/* Non-Tariff Measures */}
          <div>
            <Title level={5} style={{ marginBottom: 12, color: '#3D3D3D' }}>
              Нетарифные меры:
            </Title>
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {nontariff_measures.measures.map((measure, idx) => (
                <Alert
                  key={idx}
                  message={measure}
                  description={nontariff_measures.reasoning[idx]}
                  type="info"
                  showIcon
                  style={{ borderRadius: 8 }}
                />
              ))}
            </Space>
          </div>
        </Space>
      </Card>
    </Space>
  );
}

// Helper function для расчета тренда
function calculateTrend(dynamics) {
  if (dynamics.length < 2) return 0;
  const current = dynamics[dynamics.length - 1].value_mln_usd;
  const previous = dynamics[dynamics.length - 2].value_mln_usd;
  return ((current - previous) / previous) * 100;
}
