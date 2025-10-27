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
  SettingOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {useState} from 'react'
import DeleteConfirmationModal from './delete-confirmation-modal'

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
                                             onDeletePrincipal,
                                           }: PrincipalRolesListProps) {
  const [deleteRoleModalVisible, setDeleteRoleModalVisible] = useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState<string | null>(null);
  const [deletePrincipalModalVisible, setDeletePrincipalModalVisible] = useState(false);
  const [selectedPrincipalForDelete, setSelectedPrincipalForDelete] = useState<{
    principalRoleName: string;
    principalName: string;
  } | null>(null);

  const handleDeleteRoleClick = (roleName: string) => {
    setSelectedRoleForDelete(roleName);
    setDeleteRoleModalVisible(true);
  };

  const handleDeleteRoleConfirm = async (roleName: string) => {
    if (onDelete) {
      await onDelete(roleName);
    }
  };

  const handleDeletePrincipalClick = (principalRoleName: string, principalName: string) => {
    setSelectedPrincipalForDelete({principalRoleName, principalName});
    setDeletePrincipalModalVisible(true);
  };

  const handleDeletePrincipalConfirm = async () => {
    if (onDeletePrincipal && selectedPrincipalForDelete) {
      await onDeletePrincipal(
          selectedPrincipalForDelete.principalRoleName,
          selectedPrincipalForDelete.principalName
      );
    }
  };

  const getPrincipalsColumns = (principalRoleName: string): ColumnsType<PrincipalItem> => [
    {
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
          <Space direction="vertical">
            <Text strong style={{color: '#1890ff'}}>{name}</Text>
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
          <Space><SettingOutlined/>Properties</Space>
      ),
      key: 'properties',
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
    }
  ];
  const columns: ColumnsType<PrincipalRoleItem> = [
    {
      title: "Name",
      dataIndex: 'name',
      key: 'name',
      width: 200,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
          <Space direction="vertical">
            <Text strong className="principal-roles-text">{name}</Text>
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
      render: (timestamp: number) => (
          <Space direction="vertical">
            <Text type="secondary">{formatDate(timestamp)}</Text>
            <Text type="secondary">{formatDate(timestamp)}</Text>
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
              handleDeleteRoleClick(record.name);
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
      <>
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
                          <Tag>{principalsList.length}</Tag>
                          <UserOutlined/>
                          Principals for:
                          {record.name}
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
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<Text type="secondary">No principals
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
                  `${range[0]}-${range[1]} of ${total} principal roles`,
            }}
            locale={{
              emptyText: (
                  <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={<Text type="secondary">No principal roles found</Text>}
                  />
              ),
            }}
            size="small"
        />

        <DeleteConfirmationModal
            visible={deleteRoleModalVisible}
            entityType="Principal Role"
            entityName={selectedRoleForDelete}
            onClose={() => {
              setDeleteRoleModalVisible(false);
              setSelectedRoleForDelete(null);
            }}
            onConfirm={handleDeleteRoleConfirm}
            description=""
            warningMessage="This will permanently remove the principal role and all associated permissions."
        />

        <DeleteConfirmationModal
            visible={deletePrincipalModalVisible}
            entityType="Principal"
            entityName={selectedPrincipalForDelete?.principalName || null}
            onClose={() => {
              setDeletePrincipalModalVisible(false);
              setSelectedPrincipalForDelete(null);
            }}
            onConfirm={handleDeletePrincipalConfirm}
            description=""
            warningMessage="This will unassign the principal from this principal role."
        />
      </>
  );
}

