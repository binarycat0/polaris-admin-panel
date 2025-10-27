'use client'
import type {MenuProps} from 'antd'
import {
  Button,
  Dropdown,
  Flex,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Empty
} from 'antd'
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  IdcardOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {useState} from 'react'
import ResetPrincipalCredentialsModal from '@/app/ui/modals/principals/ResetPrincipalCredentialsModal'
import DeleteConfirmationModal from '@/app/ui/modals/shared/DeleteConfirmationModal'
import PropertiesCell from '@/app/ui/components/PropertiesCell'

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
                                     onRemoveRole
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

  const getRolesColumns = (): ColumnsType<PrincipalRoleItem> => [
    {
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
          <Space direction="vertical">
            <Text strong style={{color: '#722ed1'}}>{name}</Text>
            <Text type="secondary">version: {record.entityVersion}</Text>
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
            Created / Last Updated
          </Space>
      ),
      dataIndex: 'createTimestamp',
      key: 'createTimestamp',
      width: 250,
      sorter: (a, b) => a.createTimestamp - b.createTimestamp,
      render: (timestamp: number, record) => (
          <Space direction="vertical">
            <Text type="secondary">{formatDate(record.createTimestamp)}</Text>
            <Text type="secondary">{formatDate(record.lastUpdateTimestamp)}</Text>
          </Space>
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
      render: (_, record) => <PropertiesCell properties={record.properties}/>,
    },
  ];

  const columns: ColumnsType<Principal> = [
    {
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, record) => (
          <Space direction="vertical">
            <Text strong style={{color: '#1890ff'}}>{record.name}</Text>
            <Text type="secondary">version: {record.entityVersion}</Text>
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
      width: 200,
      sorter: (a, b) => a.clientId.localeCompare(b.clientId),
      render: (clientId: string) => (
          <Text strong>{clientId}</Text>
      ),
    },
    {
      title: (
          <Space>
            <CalendarOutlined/>
            Created / Last Updated
          </Space>
      ),
      dataIndex: 'createTimestamp',
      key: 'createTimestamp',
      width: 250,
      sorter: (a, b) => a.createTimestamp - b.createTimestamp,
      render: (timestamp: number, record) => (
          <Space direction="vertical">
            <Text type="secondary">{formatDate(timestamp)}</Text>
            <Text type="secondary">{formatDate(record.lastUpdateTimestamp)}</Text>
          </Space>
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
      render: (_, record) => <PropertiesCell properties={record.properties}/>,
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
                            <Tag>{roles.length}</Tag>
                            <TeamOutlined/>
                            Principal Roles for:
                            {record.name}
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
                          columns={getRolesColumns()}
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

