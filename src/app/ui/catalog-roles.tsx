'use client'
import type {MenuProps} from 'antd'
import {Button, Dropdown, Table, Tag, Typography, Space} from 'antd'
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  FileUnknownOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

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
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong style={{color: '#1890ff'}}>{name}</Text>
      ),
    },
    {
      title: (
          <Space><FileUnknownOutlined/>Version</Space>
      ),
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
          <Space><CalendarOutlined/>Created</Space>
      ),
      dataIndex: 'createTimestamp',
      key: 'created',
      width: 180,
      sorter: (a, b) => a.createTimestamp - b.createTimestamp,
      render: (timestamp: number) => (
          <Text type="secondary">{formatDate(timestamp)}</Text>
      ),
    },
    {
      title: (
          <Space><CalendarOutlined/>Last Updated</Space>
      ),
      dataIndex: 'lastUpdateTimestamp',
      key: 'lastUpdated',
      width: 180,
      sorter: (a, b) => a.lastUpdateTimestamp - b.lastUpdateTimestamp,
      render: (timestamp: number) => (
          <Text type="secondary">{formatDate(timestamp)}</Text>
      ),
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
    },
  ];

  return (
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
                <Space>
                  <TeamOutlined/>
                  <Text type="secondary">No roles found for this catalog</Text>
                </Space>
            ),
          }}
          size="small"
      />
  );
}
