'use client'
import {Button, Popover, Space, Table, Tag, Typography} from 'antd'
import {
  CalendarOutlined,
  FileUnknownOutlined,
  InfoCircleOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text} = Typography;

export interface PrincipalRole {
  name: string;
  federated: boolean;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

interface PrincipalRolesProps {
  roles: PrincipalRole[];
  loading: boolean;
}

export default function PrincipalRoles({
                                         roles,
                                         loading
                                       }: PrincipalRolesProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns: ColumnsType<PrincipalRole> = [
    {
      title: (
          <Space>
            <TeamOutlined/>
            Principal Role Name
          </Space>
      ),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong style={{color: '#722ed1'}}>{name}</Text>
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
                <Text type="secondary"><Tag color="blue">{record.entityVersion}</Tag></Text>
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
          id="principal-roles-table"
          columns={columns}
          dataSource={roles}
          rowKey="name"
          loading={loading}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} principal roles`,
          }}
          locale={{
            emptyText: (
                <Space direction="vertical">
                  <TeamOutlined style={{fontSize: '32px', color: '#d9d9d9', marginBottom: '8px'}}/>
                  <Text type="secondary">No principal roles found for this catalog role</Text>
                </Space>
            ),
          }}
          size="small"
      />
  );
}
