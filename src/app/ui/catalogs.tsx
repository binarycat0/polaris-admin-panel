'use client'
import {Card, Divider, List, Space, Tag, Typography} from 'antd'
import {CalendarOutlined, DatabaseOutlined, EnvironmentOutlined} from '@ant-design/icons'

const { Text, Title } = Typography;

export interface CatalogEntity {
  name: string;
  properties: {
    "default-base-location": string;
    [key: string]: string; // Allows additional string properties
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
  storageConfigInfo: {
    allowedLocations: string;
  };
}

export default function Catalogs(
    {catalogs,}: {
      catalogs: CatalogEntity[]
    }) {
  // Add defensive programming to handle non-array values
  if (!Array.isArray(catalogs)) {
    console.error('Catalogs prop is not an array:', catalogs);
    return (
      <Card>
        <Text type="danger">Error: Invalid catalog data received</Text>
      </Card>
    );
  }

  if (catalogs.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <DatabaseOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Title level={4} type="secondary">No catalogs found</Title>
          <Text type="secondary">There are no catalogs available at the moment.</Text>
        </div>
      </Card>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <List
      grid={{
        gutter: 16,
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        xxl: 3
      }}
      dataSource={catalogs}
      renderItem={(catalog) => (
        <List.Item>
          <Card
            hoverable
            title={
              <Space>
                <DatabaseOutlined style={{ color: '#1890ff' }} />
                <Text strong>{catalog.name}</Text>
              </Space>
            }
            extra={<Tag color="blue">v{catalog.entityVersion}</Tag>}
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {catalog.properties['default-base-location'] && (
                <div>
                  <Text type="secondary">
                    <EnvironmentOutlined style={{ marginRight: 8 }} />
                    Base Location:
                  </Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>
                    {catalog.properties['default-base-location']}
                  </Text>
                </div>
              )}

              {catalog.storageConfigInfo?.allowedLocations && (
                <div>
                  <Text type="secondary">Allowed Locations:</Text>
                  <br />
                  <Text code style={{ fontSize: '12px' }}>
                    {catalog.storageConfigInfo.allowedLocations}
                  </Text>
                </div>
              )}

              <Divider style={{ margin: '12px 0' }} />

              <Space direction="vertical" size="small">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  Created: {formatDate(catalog.createTimestamp)}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  Updated: {formatDate(catalog.lastUpdateTimestamp)}
                </Text>
              </Space>

              {Object.keys(catalog.properties).length > 1 && (
                <div>
                  <Text type="secondary">Additional Properties:</Text>
                  <div style={{ marginTop: 8 }}>
                    {Object.entries(catalog.properties)
                      .filter(([key]) => key !== 'default-base-location')
                      .map(([key, value]) => (
                        <Tag key={key} style={{ marginBottom: 4 }}>
                          {key}: {value}
                        </Tag>
                      ))
                    }
                  </div>
                </div>
              )}
            </Space>
          </Card>
        </List.Item>
      )}
    />
  )
}