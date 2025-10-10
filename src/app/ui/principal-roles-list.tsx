'use client'
import {Badge, Button, Flex, Space, Table, Tag, Tooltip, Typography} from 'antd'
import {
  CalendarOutlined,
  CloudOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text, Title} = Typography;

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

interface PrincipalRolesListProps {
  roles: PrincipalRoleItem[];
  loading: boolean;
  onViewPrincipals?: (principalRoleName: string) => void;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

export default function PrincipalRolesList({
                                             roles,
                                             loading,
                                             onViewPrincipals
                                           }: PrincipalRolesListProps) {
  const columns: ColumnsType<PrincipalRoleItem> = [
    {
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong className="principal-roles-text">{name}</Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'federated',
      key: 'federated',
      width: 150,
      sorter: (a, b) => Number(a.federated) - Number(b.federated),
      render: (federated: boolean) => (
          <Flex align="center">
            <Badge
                status={federated ? "processing" : "default"}
                text={federated ? (
                    <Space>
                      <CloudOutlined/>
                      Federated
                    </Space>
                ) : (
                    <Space>
                      <HomeOutlined/>
                      Local
                    </Space>
                )}
            />
          </Flex>
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
      width: 250,
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
      width: 150,
      fixed: 'right',
      render: (_, record) => (
          <Button
              variant="outlined"
              size="small"
              icon={<UserOutlined/>}
              onClick={(e) => {
                e.stopPropagation();
                if (onViewPrincipals) {
                  onViewPrincipals(record.name);
                }
              }}
          >
            Principals
          </Button>
      ),
    },
  ];

  return (
      <>
        <Title level={4}>
          <Space>
            Principal Roles
            <TeamOutlined/>
          </Space>
        </Title>

        <Table
            columns={columns}
            dataSource={roles}
            rowKey="name"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} principal roles`,
            }}
            locale={{
              emptyText: (
                  <Space>
                    <TeamOutlined/>
                    <Text type="secondary">No principal roles found</Text>
                  </Space>
              ),
            }}
        />
      </>
  );
}

