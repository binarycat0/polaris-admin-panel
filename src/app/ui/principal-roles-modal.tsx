'use client'
import { Modal, Table, Typography, Tag, Tooltip, Badge, Spin } from 'antd'
import { TeamOutlined, CalendarOutlined, SettingOutlined, CloudOutlined, HomeOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography;

export interface PrincipalRoleItem {
  name: string;
  federated: boolean;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

interface PrincipalRolesModalProps {
  visible: boolean;
  principalName: string | null;
  roles: PrincipalRoleItem[];
  loading: boolean;
  onClose: () => void;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

export default function PrincipalRolesModal({ 
  visible, 
  principalName, 
  roles, 
  loading, 
  onClose 
}: PrincipalRolesModalProps) {
  const columns: ColumnsType<PrincipalRoleItem> = [
    {
      title: (
        <>
          <TeamOutlined style={{ marginRight: 8 }} />
          Role Name
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
      width: 140,
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
      width: 90,
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
          <SettingOutlined style={{ marginRight: 8 }} />
          Properties
        </>
      ),
      key: 'properties',
      width: 200,
      render: (_, record) => {
        const properties = Object.entries(record.properties || {});
        
        if (properties.length === 0) {
          return <Text type="secondary">None</Text>;
        }
        
        return (
          <div>
            {properties.slice(0, 1).map(([key, value]) => (
              <Tag key={key} style={{ marginBottom: 2, fontSize: '11px' }}>
                {key}: {value}
              </Tag>
            ))}
            {properties.length > 1 && (
              <Tooltip title={
                <div>
                  {properties.slice(1).map(([key, value]) => (
                    <div key={key}>{key}: {value}</div>
                  ))}
                </div>
              }>
                <Tag style={{ fontSize: '11px' }}>
                  +{properties.length - 1} more
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <TeamOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          <span>Principal Roles for &quot;{principalName}&quot;</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1000}
      destroyOnHidden
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="name"
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
                <TeamOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '8px' }} />
                <div>
                  <Text type="secondary">No principal roles found for this principal</Text>
                </div>
              </div>
            ),
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      )}
    </Modal>
  );
}

