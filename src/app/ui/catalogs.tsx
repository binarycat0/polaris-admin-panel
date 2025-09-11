'use client'
import { Table, Typography, Tag, Tooltip } from 'antd'
import { DatabaseOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

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

interface CatalogsProps {
  catalogs: CatalogEntity[];
  onRowClick?: (catalogName: string) => void;
  selectedCatalog?: string | null;
}

export default function Catalogs({ catalogs, onRowClick, selectedCatalog }: CatalogsProps) {
  // Add defensive programming to handle non-array values
  if (!Array.isArray(catalogs)) {
    console.error('Catalogs prop is not an array:', catalogs);
    return <Text type="danger">Error: Invalid catalog data received</Text>;
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

  const columns: ColumnsType<CatalogEntity> = [
    {
      title: (
        <>
          <DatabaseOutlined style={{ marginRight: 8 }} />
          Catalog Name
        </>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Text strong style={{ color: '#1890ff' }}>{name}</Text>
      ),
    },
    {
      title: 'Version',
      dataIndex: 'entityVersion',
      key: 'entityVersion',
      width: 100,
      sorter: (a, b) => a.entityVersion - b.entityVersion,
      render: (version: number) => (
        <Tag color="blue">v{version}</Tag>
      ),
    },
    {
      title: (
        <>
          <EnvironmentOutlined style={{ marginRight: 8 }} />
          Base Location
        </>
      ),
      key: 'baseLocation',
      render: (_, record) => (
        <Tooltip title={record.properties['default-base-location']}>
          <Text code style={{ fontSize: '12px' }}>
            {record.properties['default-base-location'] || 'Not specified'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Allowed Locations',
      key: 'allowedLocations',
      render: (_, record) => (
        <Tooltip title={record.storageConfigInfo?.allowedLocations}>
          <Text code style={{ fontSize: '12px' }}>
            {record.storageConfigInfo?.allowedLocations || 'Not specified'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: (
        <>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Created
        </>
      ),
      dataIndex: 'createTimestamp',
      key: 'createTimestamp',
      width: 180,
      sorter: (a, b) => a.createTimestamp - b.createTimestamp,
      render: (timestamp: number) => (
        <Text type="secondary">{formatDate(timestamp)}</Text>
      ),
    },
    {
      title: (
        <>
          <CalendarOutlined style={{ marginRight: 8 }} />
          Last Updated
        </>
      ),
      dataIndex: 'lastUpdateTimestamp',
      key: 'lastUpdateTimestamp',
      width: 180,
      sorter: (a, b) => a.lastUpdateTimestamp - b.lastUpdateTimestamp,
      render: (timestamp: number) => (
        <Text type="secondary">{formatDate(timestamp)}</Text>
      ),
    },
    {
      title: 'Properties',
      key: 'properties',
      width: 200,
      render: (_, record) => {
        const additionalProps = Object.entries(record.properties)
          .filter(([key]) => key !== 'default-base-location');

        if (additionalProps.length === 0) {
          return <Text type="secondary">None</Text>;
        }

        return (
          <div>
            {additionalProps.slice(0, 2).map(([key, value]) => (
              <Tag key={key} style={{ marginBottom: 2, fontSize: '11px' }}>
                {key}: {value}
              </Tag>
            ))}
            {additionalProps.length > 2 && (
              <Tooltip title={
                <div>
                  {additionalProps.slice(2).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </div>
              }>
                <Tag style={{ fontSize: '11px' }}>
                  +{additionalProps.length - 2} more
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={catalogs}
      rowKey="name"
      onRow={(record) => ({
        onClick: () => {
          if (onRowClick) {
            onRowClick(record.name);
          }
        },
        style: {
          cursor: onRowClick ? 'pointer' : 'default',
          backgroundColor: selectedCatalog === record.name ? '#e6f7ff' : undefined,
        },
      })}
      rowClassName={(record) =>
        selectedCatalog === record.name ? 'selected-row' : ''
      }
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} catalogs`,
      }}
      locale={{
        emptyText: (
          <div style={{ padding: '40px 0' }}>
            <DatabaseOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
            <div>
              <Title level={4} type="secondary">No catalogs found</Title>
              <Text type="secondary">There are no catalogs available at the moment.</Text>
            </div>
          </div>
        ),
      }}
      scroll={{ x: 1200 }}
      size="middle"
    />
  );
}