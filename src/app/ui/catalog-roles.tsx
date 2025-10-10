'use client'
import {Button, Popover, Table, Tag, Typography, Space} from 'antd'
import {
  CalendarOutlined,
  FileUnknownOutlined,
  InfoCircleOutlined,
  UserOutlined
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
}

export default function CatalogRoles(
    {
      roles,
      loading,
      onRowClick,
      selectedCatalogRole
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
            <UserOutlined/>
            Role Name
          </Space>
      ),
      dataIndex: 'name',
      key: 'name',
      minWidth: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong style={{color: '#1890ff'}}>{name}</Text>
      ),
    },
    {
      title: 'Details',
      key: 'details',
      render: (_, record) => {

        const content = (
            <Space direction="vertical">
              <Space>
                <FileUnknownOutlined/>
                Version:
                <Text type="secondary"> <Tag color="blue">{record.entityVersion}</Tag></Text>
              </Space>
              <Space>
                <CalendarOutlined/>
                Created:
                <Text type="secondary">{formatDate(record.createTimestamp)}</Text>
              </Space>
              <Space>
                <CalendarOutlined/>
                Last Updated:
                <Text type="secondary">{formatDate(record.lastUpdateTimestamp)}</Text>
              </Space>
            </Space>
        );

        return (
            <Popover content={content}>
              <Button variant="outlined" size="small">
                <InfoCircleOutlined></InfoCircleOutlined>
                More details ...
              </Button>
            </Popover>
        )
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
                <Space direction="vertical">
                  <UserOutlined/>
                  <Text type="secondary">No roles found for this catalog</Text>
                </Space>
            ),
          }}
          size="small"
      />
  );
}
