'use client'
import {Button, Flex, Space, Table, Tag, Tooltip, Typography} from 'antd'
import {
  CalendarOutlined,
  IdcardOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {useState} from 'react'
import CreatePrincipalModal from './create-principal-modal'

const {Text, Title} = Typography;

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
  onViewRoles?: (principalName: string) => void;
  onRefresh?: () => void;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

export default function Principals({principals, loading, onViewRoles, onRefresh}: PrincipalsProps) {
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const handleCreateSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const columns: ColumnsType<Principal> = [
    {
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong style={{color: '#1890ff'}}>{name}</Text>
      ),
    },
    {
      title: (
          <Space>
            <IdcardOutlined/>
            Client ID
          </Space>
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
          <Space>
            <CalendarOutlined/>
            Created
          </Space>
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
          <Space>
            <CalendarOutlined/>
            Last Updated
          </Space>
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
          <Space>
            <SettingOutlined/>
            Properties
          </Space>
      ),
      key: 'properties',
      // width: 150,
      render: (_, record) => {
        const properties = Object.entries(record.properties || {});

        if (properties.length === 0) {
          return <Text type="secondary">None</Text>;
        }

        return (
            <div>
              {properties.slice(0, 2).map(([key, value]) => (
                  <Tag key={key} style={{marginBottom: 2, fontSize: '11px'}}>
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
                    <Tag style={{fontSize: '11px'}}>
                      +{properties.length - 2} more
                    </Tag>
                  </Tooltip>
              )}
            </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
          <Button
              variant="outlined"
              size="small"
              icon={<TeamOutlined/>}
              onClick={(e) => {
                e.stopPropagation();
                if (onViewRoles) {
                  onViewRoles(record.name);
                }
              }}
          >
            Roles
          </Button>
      ),
    },
  ];

  return (
      <>
        <Flex justify="space-between" align="flex-start">
          <Button
              variant="outlined"
              icon={<UserAddOutlined/>}
              onClick={() => setCreateModalVisible(true)}
          >
            Create new
          </Button>
          <Title level={4}>
            <Space>
              Principals
              <UserOutlined/>
            </Space>
          </Title>
        </Flex>

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
                  <Space direction="vertical">
                    <UserOutlined/>
                    <Text type="secondary">No principals found</Text>
                  </Space>
              ),
            }}
        />

        <CreatePrincipalModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onSuccess={handleCreateSuccess}
        />
      </>
  );
}

