'use client'
import {Button, Popover, Table, Tag, Typography} from 'antd'
import {
  CalendarOutlined,
  FileUnknownOutlined,
  InfoCircleOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text, Title} = Typography;

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
  catalogName: string;
  catalogRoleName: string;
  roles: PrincipalRole[];
  loading: boolean;
}

export default function PrincipalRoles({
                                         catalogName,
                                         catalogRoleName,
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
          <>
            <TeamOutlined style={{marginRight: 8}}/>
            Principal Role Name
          </>
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
                <div style={{padding: '20px 0'}}>
                  <TeamOutlined style={{fontSize: '32px', color: '#d9d9d9', marginBottom: '8px'}}/>
                  <div>
                    <Text type="secondary">No principal roles found for this catalog role</Text>
                  </div>
                </div>
            ),
          }}
          size="small"
      />
  );
}
