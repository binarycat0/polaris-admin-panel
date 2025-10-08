'use client'
import { Table, Typography, Tag, Tooltip } from 'antd'
import { UserOutlined, CalendarOutlined, SettingOutlined, IdcardOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text, Title } = Typography;

export interface Principal {
  name: string;
  clientId: string;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

interface PrincipalsProps {
  principals: Principal[];
  loading: boolean;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

export default function Principals({ principals, loading }: PrincipalsProps) {
  const columns: ColumnsType<Principal> = [
    {
      title: (
        <>
          <UserOutlined style={{ marginRight: 8 }} />
          Principal Name
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
      title: (
        <>
          <IdcardOutlined style={{ marginRight: 8 }} />
          Client ID
        </>
      ),
      dataIndex: 'clientId',
      key: 'clientId',
      sorter: (a, b) => a.clientId.localeCompare(b.clientId),
      render: (clientId: string) => (
        <Text code>{clientId}</Text>
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
      title: (
        <>
          <SettingOutlined style={{ marginRight: 8 }} />
          Properties
        </>
      ),
      key: 'properties',
      width: 250,
      render: (_, record) => {
        const properties = Object.entries(record.properties || {});
        
        if (properties.length === 0) {
          return <Text type="secondary">None</Text>;
        }
        
        return (
          <div>
            {properties.slice(0, 2).map(([key, value]) => (
              <Tag key={key} style={{ marginBottom: 2, fontSize: '11px' }}>
                {key}: {value}
              </Tag>
            ))}
            {properties.length > 2 && (
              <Tooltip title={
                <div>
                  {properties.slice(2).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </div>
              }>
                <Tag style={{ fontSize: '11px' }}>
                  +{properties.length - 2} more
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <UserOutlined style={{ marginRight: 8 }} />
        Principals
      </Title>
      
      <Table
        columns={columns}
        dataSource={principals}
        rowKey="name"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} principals`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '20px 0' }}>
              <UserOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '8px' }} />
              <div>
                <Text type="secondary">No principals found</Text>
              </div>
            </div>
          ),
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}

