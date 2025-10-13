'use client'
import type {MenuProps} from 'antd'
import {Badge, Button, Dropdown, Flex, Space, Spin, Table, Tag, Tooltip, Typography} from 'antd'
import {
  CalendarOutlined,
  CloudOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  IdcardOutlined,
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

interface PrincipalRolesListProps {
  roles: PrincipalRoleItem[];
  loading: boolean;
  onRowClick?: (principalRoleName: string) => void;
  expandedRowKeys?: string[];
  principals?: Record<string, PrincipalItem[]>;
  principalsLoading?: Record<string, boolean>;
  onEdit?: (principalRoleName: string) => void;
  onDelete?: (principalRoleName: string) => void;
  onEditPrincipal?: (principalRoleName: string, principalName: string) => void;
  onDeletePrincipal?: (principalRoleName: string, principalName: string) => void;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

export default function PrincipalRolesList({
                                             roles,
                                             loading,
                                             onRowClick,
                                             expandedRowKeys = [],
                                             principals = {},
                                             principalsLoading = {},
                                             onEdit,
                                             onDelete,
                                             onEditPrincipal,
                                             onDeletePrincipal,
                                           }: PrincipalRolesListProps) {

  // Columns for the principals expandable table
  const getPrincipalsColumns = (principalRoleName: string): ColumnsType<PrincipalItem> => [
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
      width: 90,
      sorter: (a, b) => a.entityVersion - b.entityVersion,
      render: (version: number) => (
          <Tag color="blue">v{version}</Tag>
      ),
    },
    {
      title: (
          <Space><CalendarOutlined/>Created</Space>
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
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined/>,
            onClick: () => {
              if (onEditPrincipal) {
                onEditPrincipal(principalRoleName, record.name);
              }
            },
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined/>,
            danger: true,
            onClick: () => {
              if (onDeletePrincipal) {
                onDeletePrincipal(principalRoleName, record.name);
              }
            },
          },
        ];

        return (
            <Dropdown menu={{items}} trigger={['click']}>
              <Button
                  size="small"
                  icon={<SettingOutlined/>}
                  onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
        );
      },
    },
  ];
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
      render: (_: unknown, record: PrincipalRoleItem) => {
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
      render: (_: unknown, record: PrincipalRoleItem) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined/>,
            onClick: () => {
              if (onEdit) {
                onEdit(record.name);
              }
            },
          },
          {
            type: 'divider',
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: <DeleteOutlined/>,
            danger: true,
            onClick: () => {
              if (onDelete) {
                onDelete(record.name);
              }
            },
          },
        ];

        return (
            <Dropdown menu={{items}} trigger={['click']}>
              <Button
                  size="small"
                  icon={<SettingOutlined/>}
                  onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
        );
      },
    }
  ];

  return (
      <Table
            columns={columns}
            dataSource={roles}
            rowKey="name"
            loading={loading}
            expandable={{
              expandedRowKeys: expandedRowKeys,
              onExpand: (expanded, record) => {
                if (expanded && onRowClick) {
                  onRowClick(record.name);
                }
              },
              expandedRowRender: (record) => {
                const principalsList = principals?.[record.name] || [];
                const loading = principalsLoading?.[record.name] || false;

                if (loading) {
                  return (
                      <div style={{padding: '20px', textAlign: 'center'}}>
                        <Spin size="large"/>
                      </div>
                  );
                }

                return (
                    <div style={{padding: '0 10px'}}>
                      <Title level={5} style={{marginBottom: 16}}>
                        <Space>
                          <UserOutlined/>
                          Principals for:
                          {record.name}
                          <Tag color="blue">{principalsList.length}</Tag>
                        </Space>
                      </Title>
                      <Table
                          columns={getPrincipalsColumns(record.name)}
                          dataSource={principalsList}
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
                                <Space>
                                  <UserOutlined/>
                                  <Text type="secondary">No principals found for this principal
                                    role</Text>
                                </Space>
                            ),
                          }}
                          size="small"
                      />
                    </div>
                );
              },
            }}
            onRow={(record) => ({
              onClick: () => {
                if (onRowClick) {
                  onRowClick(record.name);
                }
              },
              style: {cursor: 'pointer'},
            })}
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
            size="small"
      />
  );
}

