'use client'
import type {MenuProps} from 'antd'
import {Button, Dropdown, Space, Table, Tag, Typography, Empty} from 'antd'
import {
  CalendarOutlined,
  CloudOutlined,
  FolderOutlined,
  DeleteOutlined,
  EditOutlined,
  FileUnknownOutlined,
  SettingOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text} = Typography;

export interface CatalogEntity {
  name: string;
  properties: {
    "default-base-location": string;
    [key: string]: string; // Allows additional string properties
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
  storageConfigInfo: {
    allowedLocations: string;
  };
}

interface CatalogsProps {
  catalogs: CatalogEntity[];
  onRowClick?: (catalogName: string) => void;
  selectedCatalog?: string | null;
  onEdit?: (catalogName: string) => void;
  onDelete?: (catalogName: string) => void;
  onShowRoles?: (catalogName: string) => void;
}

export default function Catalogs({
                                   catalogs,
                                   onRowClick,
                                   selectedCatalog,
                                   onEdit,
                                   onDelete,
                                   onShowRoles
                                 }: CatalogsProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: ColumnsType<CatalogEntity> = [
    {
      title: (
          <Space><FolderOutlined/>Name</Space>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
          <Space>
            <Text strong style={{color: '#1890ff'}}>{name}</Text>
            <Text type="secondary">ver. {record.entityVersion}</Text>
          </Space>
      ),
      width: 200,
    },
    {
      title: (
          <Space><CloudOutlined/>Base Location</Space>
      ),
      dataIndex: ['properties', 'default-base-location'],
      key: 'baseLocation',
      ellipsis: true,
      render: (location: string) => (
          <Text type="secondary">{location}</Text>
      ),
    },
    {
      title: (
          <Space><CloudOutlined/>Allowed Location</Space>
      ),
      key: 'allowedLocation',
      ellipsis: true,
      render: (_, record) => (
          <Text type="secondary">
            {record.storageConfigInfo?.allowedLocations || 'Not specified'}
          </Text>
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
          columns={columns}
          dataSource={catalogs}
          rowKey="name"
          scroll={{x: 'max-content'}}
          onRow={(record) => ({
            onClick: () => {
              if (onRowClick) {
                onRowClick(record.name);
              }
            },
            style: {
              cursor: onRowClick ? 'pointer' : 'default',
              backgroundColor: selectedCatalog === record.name ? '#e6f7ff' : undefined,
            },
          })}
          rowClassName={(record) =>
              selectedCatalog === record.name ? 'selected-row' : ''
          }
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} catalogs`,
          }}
          locale={{
            emptyText: (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<Text type="secondary">No catalogs found</Text>}
                />
            ),
          }}
          size="small"
      />
  );
}