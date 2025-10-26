'use client'
import type {MenuProps} from 'antd'
import {
  Badge,
  Button,
  Dropdown,
  Flex,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  Empty
} from 'antd'
import {
  CalendarOutlined,
  CloudOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  IdcardOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {useState} from 'react'
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
  onAddRole?: (principalName: string) => void;
  onRemoveRole?: (principalName: string) => void;
  onEditPrincipalRole?: (principalName: string, roleName: string) => void;
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
                                     onAddRole,
                                     onRemoveRole,
                                     onEditPrincipalRole
                                   }: PrincipalsProps) {
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedPrincipalForReset, setSelectedPrincipalForReset] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPrincipalForDelete, setSelectedPrincipalForDelete] = useState<string | null>(null);

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
      render: (name: string, record) => (
          <Space>
            <Text strong style={{color: '#722ed1'}}>{name}</Text>
            <Text type="secondary">ver. {record.entityVersion}</Text>
          </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'federated',
      key: 'federated',
      width: 140,
      sorter: (a, b) => Number(a.federated) - Number(b.federated),
      render: (federated: boolean) => (
          <Text>
            {federated ? 'Federated' : 'Local'}
          </Text>
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
  ];

  const columns: ColumnsType<Principal> = [
    {
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => (
          <Space>
            <Text strong style={{color: '#1890ff'}}>{record.name}</Text>
            <Text type="secondary">ver. {record.entityVersion}</Text>
          </Space>
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
                      <Flex justify="space-between" align="center" style={{marginBottom: 16}}>
                        <Title level={5} style={{marginBottom: 0}}>
                          <Space>
                            <TeamOutlined/>
                            Principal Roles for:
                            {record.name}
                            {roles.length}
                          </Space>
                        </Title>
                        <Space>
                          {onAddRole && (
                              <Button
                                  type="default"
                                  size="small"
                                  icon={<PlusOutlined/>}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddRole(record.name);
                                  }}
                              >
                                Add Role
                              </Button>
                          )}
                          {onRemoveRole && (
                              <Button
                                  danger
                                  size="small"
                                  icon={<MinusOutlined/>}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveRole(record.name);
                                  }}
                                  disabled={roles.length === 0}
                              >
                                Remove Role
                              </Button>
                          )}
                        </Space>
                      </Flex>
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
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<Text type="secondary">No principal roles
                                      assigned</Text>}
                                />
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
                  <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<Text type="secondary">No principals found</Text>}
                  />
              ),
            }}
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

