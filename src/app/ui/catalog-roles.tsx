'use client'
import {Button, Popover, Table, Tag, Typography,} from 'antd'
import {
  CalendarOutlined,
  FileUnknownOutlined,
  InfoCircleOutlined,
  UserOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text, Title} = Typography;

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
  catalogName: string;
  roles: CatalogRole[];
  loading: boolean;
  onRowClick?: (catalogRoleName: string) => void;
  selectedCatalogRole?: string | null;
}

export default function CatalogRoles(
    {
      catalogName,
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
          <>
            <UserOutlined style={{marginRight: 8}}/>
            Role Name
          </>
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
            <div>
              <p>
                <>
                  <FileUnknownOutlined style={{marginRight: 8}}/>
                  Version:
                </>
                <Text type="secondary"> <Tag color="blue">{record.entityVersion}</Tag></Text>
              </p>
              <p>
                <>
                  <CalendarOutlined style={{marginRight: 8}}/>
                  Created:
                </>
                <Text type="secondary">{formatDate(record.createTimestamp)}</Text>
              </p>
              <p>
                <>
                  <CalendarOutlined style={{marginRight: 8}}/>
                  Last Updated:
                </>
                <Text type="secondary">{formatDate(record.lastUpdateTimestamp)}</Text>
              </p>
            </div>
        );

        return (
            <div>
              <Popover content={content}>
                <Button type="primary" size="small">
                  <InfoCircleOutlined></InfoCircleOutlined>
                  More details ...
                </Button>
              </Popover>
            </div>
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
            position: ['bottomLeft'],
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} roles`,
          }}
          locale={{
            emptyText: (
                <div style={{padding: '20px 0'}}>
                  <UserOutlined style={{fontSize: '32px', color: '#d9d9d9', marginBottom: '8px'}}/>
                  <div>
                    <Text type="secondary">No roles found for this catalog</Text>
                  </div>
                </div>
            ),
          }}
          size="small"
      />
  );
}
