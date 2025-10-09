'use client'
import {Button, Table, Typography, Popover, Tag} from 'antd'
import {
  DatabaseOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  CloudOutlined,
  FileUnknownOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text, Title} = Typography;

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
}

export default function Catalogs({catalogs, onRowClick, selectedCatalog}: CatalogsProps) {
  // Add defensive programming to handle non-array values
  if (!Array.isArray(catalogs)) {
    console.error('Catalogs prop is not an array:', catalogs);
    return <Text type="danger">Error: Invalid catalog data received</Text>;
  }

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
          <>
            <DatabaseOutlined style={{marginRight: 8}}/>
            Catalog Name
          </>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong style={{color: '#1890ff'}}>{name}</Text>
      ),
      minWidth: 250,
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
                  <CloudOutlined style={{marginRight: 8}}/>
                  Base Location:
                </>
                <Text type="secondary"> {record.properties['default-base-location']}</Text>
              </p>
              <p>
                <>
                  <CloudOutlined style={{marginRight: 8}}/>
                  Allowed Location:
                </>
                <Text
                    type="secondary"> {record.storageConfigInfo?.allowedLocations || 'Not specified'}
                </Text>
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
          columns={columns}
          dataSource={catalogs}
          rowKey="name"
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
            position: ['bottomLeft'],
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} catalogs`,
          }}
          locale={{
            emptyText: (
                <div style={{padding: '20px 0'}}>
                  <DatabaseOutlined
                      style={{fontSize: '32px', color: '#d9d9d9', marginBottom: '8px'}}/>
                  <div>
                    <Title level={4} type="secondary">No catalogs found</Title>
                    <Text type="secondary">There are no catalogs available at the moment.</Text>
                  </div>
                </div>
            ),
          }}
          size="small"
      />
  );
}