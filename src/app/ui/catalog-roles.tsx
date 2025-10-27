'use client'
import type {MenuProps} from 'antd'
import {Button, Dropdown, Empty, Space, Table, Typography} from 'antd'
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {useState} from 'react'
import DeleteConfirmationModal from '@/app/ui/delete-confirmation-modal'
import PropertiesCell from '@/app/ui/properties-cell'

const {Text} = Typography;

export interface CatalogRole {
  name: string;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

interface CatalogRolesProps {
  roles: CatalogRole[];
  loading: boolean;
  onRowClick?: (catalogRoleName: string) => void;
  selectedCatalogRole?: string | null;
  onEdit?: (catalogRoleName: string) => void;
  onDelete?: (catalogRoleName: string) => void;
}

export default function CatalogRoles(
    {
      roles,
      loading,
      onRowClick,
      selectedCatalogRole,
      onEdit,
      onDelete
    }: CatalogRolesProps) {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedRoleForDelete, setSelectedRoleForDelete] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (catalogRoleName: string) => {
    setSelectedRoleForDelete(catalogRoleName);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (catalogRoleName: string) => {
    if (onDelete) {
      await onDelete(catalogRoleName);
    }
  };

  const columns: ColumnsType<CatalogRole> = [
    {
      title: (
          <Space>
            <TeamOutlined/>
            Role Name
          </Space>
      ),
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
            <CalendarOutlined/>
            Created / Last Updated
          </Space>
      ),
      dataIndex: 'createTimestamp',
      key: 'created',
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
      render: (_: unknown, record: CatalogRole) => <PropertiesCell properties={record.properties}/>,
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
            id="catalog-roles-table"
            columns={columns}
            dataSource={roles}
            rowKey="name"
            loading={loading}
            scroll={{x: 'max-content'}}
            onRow={(record) => ({
              onClick: () => {
                if (onRowClick) {
                  onRowClick(record.name);
                }
              },
              style: {
                cursor: onRowClick ? 'pointer' : 'default',
                backgroundColor: selectedCatalogRole === record.name ? '#f6ffed' : undefined,
              },
            })}
            rowClassName={(record) =>
                selectedCatalogRole === record.name ? 'selected-catalogs-role-row' : ''
            }
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
                      description={<Text type="secondary">No roles found for this catalog</Text>}
                  />
              ),
            }}
            size="small"
        />

        <DeleteConfirmationModal
            visible={deleteModalVisible}
            entityType="Catalog Role"
            entityName={selectedRoleForDelete}
            onClose={() => {
              setDeleteModalVisible(false);
              setSelectedRoleForDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            description=""
            warningMessage="This will permanently remove the catalog role and all associated permissions."
        />
      </>
  );
}
