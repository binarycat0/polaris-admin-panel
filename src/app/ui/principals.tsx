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
  ReloadOutlined,
  SettingOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {useState} from 'react'
import CreatePrincipalModal from './create-principal-modal'
import ResetPrincipalCredentialsModal from './reset-principal-credentials-modal'
import DeleteConfirmationModal from './delete-confirmation-modal'

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

interface PrincipalsProps {
  principals: Principal[];
  loading: boolean;
  onRowClick?: (principalName: string) => void;
  onRefresh?: () => void;
  expandedRowKeys?: string[];
  principalRoles?: Record<string, PrincipalRoleItem[]>;
  rolesLoading?: Record<string, boolean>;
  onEdit?: (principalName: string) => void;
  onDelete?: (principalName: string) => void;
  onResetCredentials?: (principalName: string) => void;
  onEditPrincipalRole?: (principalName: string, roleName: string) => void;
  onDeletePrincipalRole?: (principalName: string, roleName: string) => void;
}

function formatDate(timestamp: number): string {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
}

export default function Principals({
                                     principals,
                                     loading,
                                     onRowClick,
                                     onRefresh,
                                     expandedRowKeys = [],
                                     principalRoles = {},
                                     rolesLoading = {},
                                     onEdit,
                                     onDelete,
                                     onResetCredentials,
                                     onEditPrincipalRole,
                                     onDeletePrincipalRole
                                   }: PrincipalsProps) {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedPrincipalForReset, setSelectedPrincipalForReset] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPrincipalForDelete, setSelectedPrincipalForDelete] = useState<string | null>(null);

  const handleCreateSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleResetSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
    if (onResetCredentials && selectedPrincipalForReset) {
      onResetCredentials(selectedPrincipalForReset);
    }
  };

  const handleResetClick = (principalName: string) => {
    setSelectedPrincipalForReset(principalName);
    setResetModalVisible(true);
  };

  const handleDeleteClick = (principalName: string) => {
    setSelectedPrincipalForDelete(principalName);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (principalName: string) => {
    if (onDelete) {
      await onDelete(principalName);
    }
  };

  const getRolesColumns = (principalName: string): ColumnsType<PrincipalRoleItem> => [
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
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: 'Edit',
            icon: <EditOutlined/>,
            onClick: () => {
              if (onEditPrincipalRole) {
                onEditPrincipalRole(principalName, record.name);
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
              if (onDeletePrincipalRole) {
                onDeletePrincipalRole(principalName, record.name);
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
      render: (_, record) => {
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
            key: 'reset',
            label: 'Reset Secret',
            icon: <ReloadOutlined/>,
            onClick: () => {
              handleResetClick(record.name);
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
              handleDeleteClick(record.name);
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
            expandable={{
              expandedRowKeys: expandedRowKeys,
              onExpand: (expanded, record) => {
                if (expanded && onRowClick) {
                  onRowClick(record.name);
                }
              },
              expandedRowRender: (record) => {
                const roles = principalRoles[record.name] || [];
                const loading = rolesLoading[record.name] || false;

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
                          <TeamOutlined/>
                          Principal Roles for:
                          {record.name}
                          <Tag color="blue">{roles.length}</Tag>
                        </Space>
                      </Title>
                      <Table
                          columns={getRolesColumns(record.name)}
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
                                <Space>
                                  <TeamOutlined/>
                                  <Text type="secondary">No principal roles found for this principal</Text>
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

        <ResetPrincipalCredentialsModal
            visible={resetModalVisible}
            principalName={selectedPrincipalForReset}
            onClose={() => {
              setResetModalVisible(false);
              setSelectedPrincipalForReset(null);
            }}
            onSuccess={handleResetSuccess}
        />

        <DeleteConfirmationModal
            visible={deleteModalVisible}
            entityType="Principal"
            entityName={selectedPrincipalForDelete}
            onClose={() => {
              setDeleteModalVisible(false);
              setSelectedPrincipalForDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            description=""
            warningMessage="This will permanently remove the principal and revoke all access."
        />
      </>
  );
}

