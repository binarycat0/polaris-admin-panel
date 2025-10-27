'use client'
import type {MenuProps} from 'antd'
import {Button, Dropdown, Empty, Space, Table, Typography} from 'antd'
import {
  CalendarOutlined,
  CloudOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  SettingOutlined,
  TagsOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {useState} from 'react'
import DeleteConfirmationModal from '@/app/ui/delete-confirmation-modal'
import PropertiesCell from '@/app/ui/properties-cell'

const {Text} = Typography;

export interface CatalogEntity {
  name: string;
  type: 'INTERNAL' | 'EXTERNAL';
  properties: {
    "default-base-location": string;
    [key: string]: string; // Allows additional string properties
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
  storageConfigInfo: {
    storageType: 'S3' | 'AZURE' | 'GCS' | 'FILE';
    allowedLocations?: string[] | string;
    roleArn?: string;
    externalId?: string;
    userArn?: string;
    region?: string;
    endpoint?: string;
    stsEndpoint?: string;
    stsUnavailable?: boolean;
    endpointInternal?: string;
    pathStyleAccess?: boolean;
    tenantId?: string;
    multiTenantAppName?: string;
    consentUrl?: string;
    gcsServiceAccount?: string;
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCatalogForDelete, setSelectedCatalogForDelete] = useState<string | null>(null);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteClick = (catalogName: string) => {
    setSelectedCatalogForDelete(catalogName);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async (catalogName: string) => {
    if (onDelete) {
      await onDelete(catalogName);
    }
  };

  const columns: ColumnsType<CatalogEntity> = [
    {
      title: (
          <Space><FolderOutlined/>Name</Space>
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
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      sorter: (a, b) => a.type.localeCompare(b.type),
    },
    {
      title: (
          <Space>
            <CloudOutlined/>
            Storage Type
          </Space>
      ),
      dataIndex: ['storageConfigInfo', 'storageType'],
      key: 'storageType',
      width: 180,
      sorter: (a, b) => (a.storageConfigInfo?.storageType || '').localeCompare(b.storageConfigInfo?.storageType || ''),
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
            <TagsOutlined/>
            Properties
          </Space>
      ),
      key: 'properties',
      render: (_: unknown, record: CatalogEntity) => <PropertiesCell properties={record.properties}/>,
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

        <DeleteConfirmationModal
            visible={deleteModalVisible}
            entityType="Catalog"
            entityName={selectedCatalogForDelete}
            onClose={() => {
              setDeleteModalVisible(false);
              setSelectedCatalogForDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            description=""
            warningMessage="This will permanently remove the catalog and all associated catalog roles, permissions, and data."
        />
      </>
  );
}