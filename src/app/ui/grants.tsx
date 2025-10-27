'use client'
import {Empty, Divider, List, Space, Spin, Typography} from 'antd'
import {
  EyeOutlined,
  FolderOutlined,
  KeyOutlined,
  SafetyOutlined,
  TableOutlined
} from '@ant-design/icons'

const {Text} = Typography;

export interface Grant {
  privilege?: string;
  type?: string;

  [key: string]: unknown;
}

interface GrantsProps {
  grants: Grant[];
  loading: boolean;
}

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

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'catalog':
      return <FolderOutlined/>;
    case 'namespace':
      return <FolderOutlined/>;
    case 'table':
      return <TableOutlined/>;
    case 'view':
      return <EyeOutlined/>;
    case 'policy':
      return <SafetyOutlined/>;
    default:
      return <KeyOutlined/>;
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
                <Divider orientation="left">
                  <Space>
                    {getTypeIcon(type)}
                    {type.charAt(0).toUpperCase() + type.slice(1)} Grants
                    {typeGrants.length}
                  </Space>
                </Divider>

                <List
                    size="small"
                    dataSource={hasPrivileges ? typeGrants : []}
                    locale={{
                      emptyText: (
                          <Empty
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                              description={<Text type="secondary">{type} privileges not granted</Text>}
                          />
                      ),
                    }}
                    renderItem={(grant, index) => (
                        <List.Item key={`${type}-${index}`}>
                          <Space direction="vertical" style={{width: '100%'}}>
                          </Space>
                          {grant.privilege && (
                              <Text strong>
                                {grant.privilege}
                              </Text>
                          )}
                        </List.Item>
                    )}
                />
              </div>
          );
        })}
      </Space>
  );
}
