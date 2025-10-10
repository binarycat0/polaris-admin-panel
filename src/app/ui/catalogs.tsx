'use client'
import {Button, Popover, Space, Table, Tag, Typography} from 'antd'
import {
  CalendarOutlined,
  CloudOutlined,
  DatabaseOutlined,
  FileUnknownOutlined,
  InfoCircleOutlined
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
            <Space direction="vertical">
              <Space>
                <FileUnknownOutlined/>
                Version:
                <Text type="secondary"> <Tag color="blue">{record.entityVersion}</Tag></Text>
              </Space>
              <Space>
                <CloudOutlined/>
                Base Location:
                <Text type="secondary"> {record.properties['default-base-location']}</Text>
              </Space>
              <Space>
                <CloudOutlined/>
                Allowed Location:
                <Text
                    type="secondary"> {record.storageConfigInfo?.allowedLocations || 'Not specified'}
                </Text>
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
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} catalogs`,
          }}
          locale={{
            emptyText: (
                <Space>
                  <DatabaseOutlined/>
                  <Text type="secondary">There are no catalogs available at the moment.</Text>
                </Space>
            ),
          }}
          size="small"
      />
  );
}