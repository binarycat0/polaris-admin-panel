'use client'
import {Space, Table, Tag, Tooltip, Typography} from 'antd'
import {KeyOutlined, SafetyOutlined, SettingOutlined} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text} = Typography;

export interface Grant {
  privilege?: string;
  type?: string;

  [key: string]: unknown; // Allow additional properties
}

interface GrantsProps {
  grants: Grant[];
  loading: boolean;
}

export default function Grants({grants, loading}: GrantsProps) {
  // Dynamic columns based on the actual data structure
  const generateColumns = (): ColumnsType<Grant> => {
    if (grants.length === 0) {
      return [];
    }

    const sampleGrant = grants[0];
    const columns: ColumnsType<Grant> = [];

    // Common expected fields with special handling
    const specialFields = ['type', 'privilege'];

    // Add special columns first
    Object.keys(sampleGrant).forEach((key) => {
      if (specialFields.includes(key)) {
        if (key === 'name' || key === 'id') {
          columns.push({
            title: (
                <>
                  <SafetyOutlined style={{marginRight: 8}}/>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </>
            ),
            dataIndex: key,
            key: key,
            sorter: (a, b) => String(a[key] || '').localeCompare(String(b[key] || '')),
            render: (value: unknown) => (
                <Text strong style={{color: '#fa8c16'}}>{String(value || 'N/A')}</Text>
            ),
          });
        } else if (key === 'type' || key === 'privilege') {
          columns.push({
            title: key.charAt(0).toUpperCase() + key.slice(1),
            dataIndex: key,
            key: key,
            width: 120,
            sorter: (a, b) => String(a[key] || '').localeCompare(String(b[key] || '')),
            render: (value: unknown) => (
                <Tag color="orange">{String(value || 'N/A')}</Tag>
            ),
          });
        } else {
          columns.push({
            title: key.charAt(0).toUpperCase() + key.slice(1),
            dataIndex: key,
            key: key,
            sorter: (a, b) => String(a[key] || '').localeCompare(String(b[key] || '')),
            render: (value: unknown) => (
                <Text>{String(value || 'N/A')}</Text>
            ),
          });
        }
      }
    });


    // Add properties column for any remaining object fields
    const remainingFields = Object.keys(sampleGrant).filter(
        key => !specialFields.includes(key) &&
            typeof sampleGrant[key] === 'object' &&
            sampleGrant[key] !== null
    );

    if (remainingFields.length > 0) {
      columns.push({
        title: (
            <>
              <SettingOutlined style={{marginRight: 8}}/>
              Additional Data
            </>
        ),
        key: 'additionalData',
        width: 250,
        render: (_, record) => {
          const additionalData: Array<[string, unknown]> = [];

          remainingFields.forEach(field => {
            if (record[field] && typeof record[field] === 'object') {
              if (Array.isArray(record[field])) {
                additionalData.push([field, `Array(${(record[field] as unknown[]).length})`]);
              } else {
                Object.entries(record[field] as Record<string, unknown>).forEach(([key, value]) => {
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
                    <Tag key={key} style={{marginBottom: 2, fontSize: '11px'}}>
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
                      <Tag style={{fontSize: '11px'}}>
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
      <Table
          id="roles-grants-table"
          columns={columns}
          dataSource={grants.map((grant, index) => ({
            ...grant,
            _key: grant.id || grant.name || `grant-${index}`
          }))}
          rowKey="_key"
          loading={loading}
          locale={{
            emptyText: (
                <Space>
                  <KeyOutlined/>
                  <Text type="secondary">No grants found for this catalog role</Text>
                </Space>
            ),
          }}
          size="small"
      />
  );
}
