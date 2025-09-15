'use client'
import { Table, Typography, Tag, Tooltip, Collapse } from 'antd'
import { UserOutlined, CalendarOutlined, SettingOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text, Title } = Typography;
const { Panel } = Collapse;

export interface CatalogRole {
  name: string;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

interface CatalogRolesResponse {
  roles: CatalogRole[];
}

interface CatalogRolesProps {
  catalogName: string;
  roles: CatalogRole[];
  loading: boolean;
  onRowClick?: (catalogRoleName: string) => void;
  selectedCatalogRole?: string | null;
}

export default function CatalogRoles({ catalogName, roles, loading, onRowClick, selectedCatalogRole }: CatalogRolesProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: ColumnsType<CatalogRole> = [
    {
      title: (
        <>
          <UserOutlined style={{ marginRight: 8 }} />
          Role Name
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
        <Tag color="green">v{version}</Tag>
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
      <Title level={4} style={{ marginBottom: 16 }}>
        <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Catalog Roles for "{catalogName}"
      </Title>
      
      <Table
        columns={columns}
        dataSource={roles}
        rowKey="name"
        loading={loading}
        onRow={(record) => ({
          onClick: () => {
            if (onRowClick) {
              onRowClick(record.name);
            }
          },
          style: {
            cursor: onRowClick ? 'pointer' : 'default',
            backgroundColor: selectedCatalogRole === record.name ? '#f6ffed' : undefined,
          },
        })}
        rowClassName={(record) =>
          selectedCatalogRole === record.name ? 'selected-catalogs-role-row' : ''
        }
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} roles`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '20px 0' }}>
              <UserOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '8px' }} />
              <div>
                <Text type="secondary">No roles found for this catalog</Text>
              </div>
            </div>
          ),
        }}
        size="small"
        style={{
          backgroundColor: '#fafafa',
          border: '1px solid #f0f0f0',
          borderRadius: '6px',
          padding: '16px'
        }}
      />
    </div>
  );
}
