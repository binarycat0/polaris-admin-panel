'use client'
import type {MenuProps} from 'antd'
import {Button, Dropdown, Space, Table, Tag, Typography} from 'antd'
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  FileUnknownOutlined,
  SettingOutlined,
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
  onEdit?: (principalRoleName: string) => void;
  onDelete?: (principalRoleName: string) => void;
}

export default function PrincipalRoles({
                                         roles,
                                         loading,
                                         onEdit,
                                         onDelete
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
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => (
          <Text strong style={{color: '#722ed1'}}>{name}</Text>
      ),
      fixed: 'left',
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
          id="principal-roles-table"
          columns={columns}
          dataSource={roles}
          rowKey="name"
          loading={loading}
          scroll={{x: 'max-content'}}
          pagination={{
            pageSize: 5,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} principal roles`,
          }}
          locale={{
            emptyText: (
                <Space>
                  <TeamOutlined/>
                  <Text type="secondary">No principal roles found for this catalog role</Text>
                </Space>
            ),
          }}
          size="small"
      />
  );
}
