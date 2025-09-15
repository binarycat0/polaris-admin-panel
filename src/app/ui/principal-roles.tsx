'use client'
import { Table, Typography, Tag, Tooltip, Badge } from 'antd'
import { TeamOutlined, CalendarOutlined, SettingOutlined, CloudOutlined, HomeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text, Title } = Typography;

export interface PrincipalRole {
  name: string;
  federated: boolean;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

interface PrincipalRolesProps {
  catalogName: string;
  catalogRoleName: string;
  roles: PrincipalRole[];
  loading: boolean;
}

export default function PrincipalRoles({ catalogName, catalogRoleName, roles, loading }: PrincipalRolesProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: ColumnsType<PrincipalRole> = [
    {
      title: (
        <>
          <TeamOutlined style={{ marginRight: 8 }} />
          Principal Role Name
        </>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
        <Text strong style={{ color: '#722ed1' }}>{name}</Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'federated',
      key: 'federated',
      width: 120,
      sorter: (a, b) => Number(a.federated) - Number(b.federated),
      render: (federated: boolean) => (
        <Badge 
          status={federated ? "processing" : "default"} 
          text={
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {federated ? (
                <>
                  <CloudOutlined style={{ marginRight: 4 }} />
                  Federated
                </>
              ) : (
                <>
                  <HomeOutlined style={{ marginRight: 4 }} />
                  Local
                </>
              )}
            </span>
          }
        />
      ),
    },
    {
      title: 'Version',
      dataIndex: 'entityVersion',
      key: 'entityVersion',
      width: 100,
      sorter: (a, b) => a.entityVersion - b.entityVersion,
      render: (version: number) => (
        <Tag color="purple">v{version}</Tag>
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
    <div style={{ marginTop: 24 }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        <TeamOutlined style={{ marginRight: 8, color: '#722ed1' }} />
        Principal Roles for Catalog Role &quot;{catalogRoleName}&quot; in &quot;{catalogName}&quot;
      </Title>
      
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="name"
        loading={loading}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} principal roles`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '20px 0' }}>
              <TeamOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '8px' }} />
              <div>
                <Text type="secondary">No principal roles found for this catalog role</Text>
              </div>
            </div>
          ),
        }}
        size="small"
        style={{
          backgroundColor: '#f0f0f0',
          border: '1px solid #e8e8e8',
          borderRadius: '6px',
          padding: '16px'
        }}
      />
    </div>
  );
}
