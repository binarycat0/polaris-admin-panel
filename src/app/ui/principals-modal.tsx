'use client'
import { Modal, Table, Typography, Tag, Tooltip, Spin, Space } from 'antd'
import { UserOutlined, CalendarOutlined, SettingOutlined, IdcardOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text } = Typography;

export interface PrincipalItem {
  name: string;
  clientId: string;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

interface PrincipalsModalProps {
  visible: boolean;
  principalRoleName: string | null;
  principals: PrincipalItem[];
  loading: boolean;
  onClose: () => void;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

export default function PrincipalsModal({ 
  visible, 
  principalRoleName, 
  principals, 
  loading, 
  onClose 
}: PrincipalsModalProps) {
  const columns: ColumnsType<PrincipalItem> = [
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
      width: 90,
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
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>Principals for Role &quot;{principalRoleName}&quot;</span>
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
          dataSource={principals}
          rowKey="name"
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} principals`,
          }}
          locale={{
            emptyText: (
              <Space direction="vertical">
                <UserOutlined/>
                <Text type="secondary">No principals found for this principal role</Text>
              </Space>
            ),
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      )}
    </Modal>
  );
}

