'use client'
import {Badge, Flex, Modal, Space, Spin, Table, Tag, Tooltip, Typography} from 'antd'
import {
  CalendarOutlined,
  CloudOutlined,
  HomeOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text} = Typography;

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
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong style={{color: '#722ed1'}}>{name}</Text>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'federated',
      key: 'federated',
      width: 140,
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
      width: 90,
      sorter: (a, b) => a.entityVersion - b.entityVersion,
      render: (version: number) => (
          <Tag color="purple">v{version}</Tag>
      ),
    },
    {
      title: (
          <Space><CalendarOutlined/> Created</Space>
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
          <Space><SettingOutlined/>Properties</Space>
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
                  <Tag key={key} style={{marginBottom: 2, fontSize: '11px'}}>
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
                    <Tag style={{fontSize: '11px'}}>
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
            <Flex align="center">
              <Space><TeamOutlined/>Principal Roles for: <Badge>{principalName}</Badge></Space>
            </Flex>
          }
          open={visible}
          onCancel={onClose}
          footer={null}
          width={1000}
          destroyOnHidden
      >
        {loading ? (
            <Spin size="large"/>
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
                      <Space direction="vertical">
                        <TeamOutlined/>
                        <Text type="secondary">No principal roles found for this principal</Text>
                      </Space>
                  ),
                }}
                scroll={{x: 800}}
                size="small"
            />
        )}
      </Modal>
  );
}

