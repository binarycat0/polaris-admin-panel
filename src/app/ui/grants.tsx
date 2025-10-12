'use client'
import {List, Space, Spin, Tag, Typography} from 'antd'
import {
  EyeOutlined,
  FolderOutlined,
  KeyOutlined,
  SafetyOutlined,
  TableOutlined
} from '@ant-design/icons'

const {Text, Title} = Typography;

export interface Grant {
  privilege?: string;
  type?: string;

  [key: string]: unknown; // Allow additional properties
}

interface GrantsProps {
  grants: Grant[];
  loading: boolean;
}

// Group grants by type
const groupGrantsByType = (grants: Grant[]): Record<string, Grant[]> => {
  const grouped: Record<string, Grant[]> = {
    catalog: [],
    namespace: [],
    table: [],
    view: [],
    policy: []
  };

  grants.forEach(grant => {
    const type = grant.type?.toLowerCase() || 'unknown';
    if (grouped[type]) {
      grouped[type].push(grant);
    }
  });

  return grouped;
};

// Get icon for grant type
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'catalog':
      return <FolderOutlined style={{fontSize: 16, color: '#1677ff'}}/>;
    case 'namespace':
      return <FolderOutlined style={{fontSize: 16, color: '#52c41a'}}/>;
    case 'table':
      return <TableOutlined style={{fontSize: 16, color: '#fa8c16'}}/>;
    case 'view':
      return <EyeOutlined style={{fontSize: 16, color: '#722ed1'}}/>;
    case 'policy':
      return <SafetyOutlined style={{fontSize: 16, color: '#eb2f96'}}/>;
    default:
      return <KeyOutlined style={{fontSize: 16}}/>;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'catalog':
      return 'blue';
    case 'namespace':
      return 'green';
    case 'table':
      return 'orange';
    case 'view':
      return 'purple';
    case 'policy':
      return 'magenta';
    default:
      return 'default';
  }
};

export default function Grants({grants, loading}: GrantsProps) {
  if (loading) {
    return (
        <div style={{textAlign: 'center', padding: '40px'}}>
          <Spin size="large"/>
        </div>
    );
  }

  const groupedGrants = groupGrantsByType(grants);
  const grantTypes = ['catalog', 'namespace', 'table', 'view', 'policy'];

  return (
      <Space direction="vertical" style={{width: '100%'}} size="small">
        {grantTypes.map(type => {
          const typeGrants = groupedGrants[type] || [];
          const hasPrivileges = typeGrants.length > 0;

          return (
              <div key={type}>
                <Title level={5}>
                  <Space>
                    {getTypeIcon(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)} Grants
                    <Tag color={getTypeColor(type)}>{typeGrants.length}</Tag>
                  </Space>
                </Title>

                <List
                    bordered
                    size="small"
                    dataSource={hasPrivileges ? typeGrants : []}
                    locale={{
                      emptyText: (
                          <Space>
                            <KeyOutlined/>
                            <Text type="secondary">No {type} privileges granted</Text>
                          </Space>
                      ),
                    }}
                    renderItem={(grant, index) => (
                        <List.Item key={`${type}-${index}`}>
                          <Space direction="vertical" style={{width: '100%'}}>
                          </Space>
                            {grant.privilege && (
                                <Text code>
                                  {grant.privilege}
                                </Text>
                            )}
                        </List.Item>
                    )}
                />
              </div>
          );
        })}

        {grants.length === 0 && !loading && (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <Space direction="vertical">
                <KeyOutlined style={{fontSize: 48, color: '#d9d9d9'}}/>
                <Text type="secondary">No grants found for this catalog role</Text>
              </Space>
            </div>
        )}
      </Space>
  );
}
