'use client'
import { Table, Typography, Tag, Tooltip } from 'antd'
import { SafetyOutlined, CalendarOutlined, SettingOutlined, KeyOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Text, Title } = Typography;

export interface Grant {
  [key: string]: any; // Flexible interface since schema wasn't provided
}

interface GrantsResponse {
  grants?: Grant[];
  [key: string]: any; // Flexible response structure
}

interface GrantsProps {
  catalogName: string;
  catalogRoleName: string;
  grants: Grant[];
  loading: boolean;
}

export default function Grants({ catalogName, catalogRoleName, grants, loading }: GrantsProps) {
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Dynamic columns based on the actual data structure
  const generateColumns = (): ColumnsType<Grant> => {
    if (grants.length === 0) {
      return [];
    }

    const sampleGrant = grants[0];
    const columns: ColumnsType<Grant> = [];

    // Common expected fields with special handling
    const specialFields = ['id', 'name', 'type', 'privilege', 'resource', 'grantee', 'grantor'];
    const dateFields = ['createTimestamp', 'lastUpdateTimestamp', 'createdAt', 'updatedAt'];
    const versionFields = ['version', 'entityVersion'];

    // Add special columns first
    Object.keys(sampleGrant).forEach((key, index) => {
      if (specialFields.includes(key)) {
        if (key === 'name' || key === 'id') {
          columns.push({
            title: (
              <>
                <SafetyOutlined style={{ marginRight: 8 }} />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </>
            ),
            dataIndex: key,
            key: key,
            sorter: (a, b) => String(a[key] || '').localeCompare(String(b[key] || '')),
            render: (value: any) => (
              <Text strong style={{ color: '#fa8c16' }}>{String(value || 'N/A')}</Text>
            ),
          });
        } else if (key === 'type' || key === 'privilege') {
          columns.push({
            title: key.charAt(0).toUpperCase() + key.slice(1),
            dataIndex: key,
            key: key,
            width: 120,
            sorter: (a, b) => String(a[key] || '').localeCompare(String(b[key] || '')),
            render: (value: any) => (
              <Tag color="orange">{String(value || 'N/A')}</Tag>
            ),
          });
        } else {
          columns.push({
            title: key.charAt(0).toUpperCase() + key.slice(1),
            dataIndex: key,
            key: key,
            sorter: (a, b) => String(a[key] || '').localeCompare(String(b[key] || '')),
            render: (value: any) => (
              <Text>{String(value || 'N/A')}</Text>
            ),
          });
        }
      }
    });

    // Add version columns
    Object.keys(sampleGrant).forEach((key) => {
      if (versionFields.includes(key)) {
        columns.push({
          title: 'Version',
          dataIndex: key,
          key: key,
          width: 100,
          sorter: (a, b) => (a[key] || 0) - (b[key] || 0),
          render: (value: any) => (
            <Tag color="orange">v{value || 0}</Tag>
          ),
        });
      }
    });

    // Add date columns
    Object.keys(sampleGrant).forEach((key) => {
      if (dateFields.includes(key)) {
        columns.push({
          title: (
            <>
              <CalendarOutlined style={{ marginRight: 8 }} />
              {key.includes('create') || key.includes('Created') ? 'Created' : 'Updated'}
            </>
          ),
          dataIndex: key,
          key: key,
          width: 180,
          sorter: (a, b) => (a[key] || 0) - (b[key] || 0),
          render: (value: any) => (
            <Text type="secondary">{formatDate(value)}</Text>
          ),
        });
      }
    });

    // Add properties column for any remaining object fields
    const remainingFields = Object.keys(sampleGrant).filter(
      key => !specialFields.includes(key) && 
             !dateFields.includes(key) && 
             !versionFields.includes(key) &&
             typeof sampleGrant[key] === 'object' &&
             sampleGrant[key] !== null
    );

    if (remainingFields.length > 0) {
      columns.push({
        title: (
          <>
            <SettingOutlined style={{ marginRight: 8 }} />
            Additional Data
          </>
        ),
        key: 'additionalData',
        width: 250,
        render: (_, record) => {
          const additionalData: Array<[string, any]> = [];
          
          remainingFields.forEach(field => {
            if (record[field] && typeof record[field] === 'object') {
              if (Array.isArray(record[field])) {
                additionalData.push([field, `Array(${record[field].length})`]);
              } else {
                Object.entries(record[field]).forEach(([key, value]) => {
                  additionalData.push([`${field}.${key}`, value]);
                });
              }
            }
          });
          
          if (additionalData.length === 0) {
            return <Text type="secondary">None</Text>;
          }
          
          return (
            <div>
              {additionalData.slice(0, 2).map(([key, value]) => (
                <Tag key={key} style={{ marginBottom: 2, fontSize: '11px' }}>
                  {key}: {String(value)}
                </Tag>
              ))}
              {additionalData.length > 2 && (
                <Tooltip title={
                  <div>
                    {additionalData.slice(2).map(([key, value]) => (
                      <div key={key}>{key}: {String(value)}</div>
                    ))}
                  </div>
                }>
                  <Tag style={{ fontSize: '11px' }}>
                    +{additionalData.length - 2} more
                  </Tag>
                </Tooltip>
              )}
            </div>
          );
        },
      });
    }

    return columns;
  };

  const columns = generateColumns();

  return (
    <div style={{ marginTop: 24 }}>
      <Title level={5} style={{ marginBottom: 16 }}>
        <KeyOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
        Grants for Catalog Role "{catalogRoleName}" in "{catalogName}"
      </Title>
      
      <Table
        columns={columns}
        dataSource={grants.map((grant, index) => ({ ...grant, _key: grant.id || grant.name || `grant-${index}` }))}
        rowKey="_key"
        loading={loading}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} grants`,
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '20px 0' }}>
              <KeyOutlined style={{ fontSize: '32px', color: '#d9d9d9', marginBottom: '8px' }} />
              <div>
                <Text type="secondary">No grants found for this catalog role</Text>
              </div>
            </div>
          ),
        }}
        size="small"
        style={{
          backgroundColor: '#f5f5f5',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          padding: '16px'
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
