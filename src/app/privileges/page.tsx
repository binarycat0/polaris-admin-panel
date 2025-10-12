'use client'

import {Divider, Space, Table, Typography} from 'antd'
import {
  EyeOutlined,
  FileProtectOutlined,
  FolderOutlined,
  SafetyOutlined,
  TableOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'
import {
  TablePrivileges,
  TablePrivilegeDescriptions,
  ViewPrivileges,
  ViewPrivilegeDescriptions,
  NamespacePrivileges,
  NamespacePrivilegeDescriptions,
  CatalogPrivileges,
  CatalogPrivilegeDescriptions,
  PolicyPrivileges,
  PolicyPrivilegeDescriptions,
} from './constants'

const {Text, Title, Paragraph, Link} = Typography;

interface Privilege {
  key: string;
  privilege: string;
  description: string | React.ReactNode;
}

const tablePrivileges: Privilege[] = [
  {
    key: '2',
    privilege: TablePrivileges.TABLE_DROP,
    description: TablePrivilegeDescriptions.TABLE_DROP,
  },
  {
    key: '3',
    privilege: TablePrivileges.TABLE_LIST,
    description: TablePrivilegeDescriptions.TABLE_LIST,
  },
  {
    key: '4',
    privilege: TablePrivileges.TABLE_READ_PROPERTIES,
    description: TablePrivilegeDescriptions.TABLE_READ_PROPERTIES,
  },
  {
    key: '5',
    privilege: TablePrivileges.TABLE_WRITE_PROPERTIES,
    description: TablePrivilegeDescriptions.TABLE_WRITE_PROPERTIES,
  },
  {
    key: '6',
    privilege: TablePrivileges.TABLE_READ_DATA,
    description: TablePrivilegeDescriptions.TABLE_READ_DATA,
  },
  {
    key: '7',
    privilege: TablePrivileges.TABLE_WRITE_DATA,
    description: TablePrivilegeDescriptions.TABLE_WRITE_DATA,
  },
  {
    key: '8',
    privilege: TablePrivileges.TABLE_FULL_METADATA,
    description: (
        <Text>
          Grants all table privileges, except <Text code>{TablePrivileges.TABLE_READ_DATA}</Text> and <Text code>{TablePrivileges.TABLE_WRITE_DATA}</Text>, which need to be granted
          individually.
        </Text>
    ),
  },
  {
    key: '9',
    privilege: TablePrivileges.TABLE_ATTACH_POLICY,
    description: TablePrivilegeDescriptions.TABLE_ATTACH_POLICY,
  },
  {
    key: '10',
    privilege: TablePrivileges.TABLE_DETACH_POLICY,
    description: TablePrivilegeDescriptions.TABLE_DETACH_POLICY,
  },
];

const viewPrivileges: Privilege[] = [
  {
    key: '2',
    privilege: ViewPrivileges.VIEW_DROP,
    description: ViewPrivilegeDescriptions.VIEW_DROP,
  },
  {
    key: '3',
    privilege: ViewPrivileges.VIEW_LIST,
    description: ViewPrivilegeDescriptions.VIEW_LIST,
  },
  {
    key: '4',
    privilege: ViewPrivileges.VIEW_READ_PROPERTIES,
    description: ViewPrivilegeDescriptions.VIEW_READ_PROPERTIES,
  },
  {
    key: '5',
    privilege: ViewPrivileges.VIEW_WRITE_PROPERTIES,
    description: ViewPrivilegeDescriptions.VIEW_WRITE_PROPERTIES,
  },
  {
    key: '6',
    privilege: ViewPrivileges.VIEW_FULL_METADATA,
    description: ViewPrivilegeDescriptions.VIEW_FULL_METADATA,
  },
];

const namespacePrivileges: Privilege[] = [
  {
    key: '1',
    privilege: NamespacePrivileges.NAMESPACE_CREATE,
    description: NamespacePrivilegeDescriptions.NAMESPACE_CREATE,
  },
  {
    key: '2',
    privilege: NamespacePrivileges.NAMESPACE_DROP,
    description: NamespacePrivilegeDescriptions.NAMESPACE_DROP,
  },
  {
    key: '3',
    privilege: NamespacePrivileges.NAMESPACE_LIST,
    description: NamespacePrivilegeDescriptions.NAMESPACE_LIST,
  },
  {
    key: '4',
    privilege: NamespacePrivileges.NAMESPACE_READ_PROPERTIES,
    description: NamespacePrivilegeDescriptions.NAMESPACE_READ_PROPERTIES,
  },
  {
    key: '5',
    privilege: NamespacePrivileges.NAMESPACE_WRITE_PROPERTIES,
    description: NamespacePrivilegeDescriptions.NAMESPACE_WRITE_PROPERTIES,
  },
  {
    key: '6',
    privilege: NamespacePrivileges.NAMESPACE_FULL_METADATA,
    description: NamespacePrivilegeDescriptions.NAMESPACE_FULL_METADATA,
  },
  {
    key: '7',
    privilege: NamespacePrivileges.NAMESPACE_ATTACH_POLICY,
    description: NamespacePrivilegeDescriptions.NAMESPACE_ATTACH_POLICY,
  },
  {
    key: '8',
    privilege: NamespacePrivileges.NAMESPACE_DETACH_POLICY,
    description: NamespacePrivilegeDescriptions.NAMESPACE_DETACH_POLICY,
  },
];

const catalogPrivileges: Privilege[] = [
  {
    key: '1',
    privilege: CatalogPrivileges.CATALOG_MANAGE_ACCESS,
    description: CatalogPrivilegeDescriptions.CATALOG_MANAGE_ACCESS,
  },
  {
    key: '2',
    privilege: CatalogPrivileges.CATALOG_MANAGE_CONTENT,
    description: (
        <Text>
          Enables full management of content for the catalog. This privilege encompasses the
          following privileges:
          <Space direction="vertical">
            <Text code>{CatalogPrivileges.CATALOG_MANAGE_METADATA}</Text>
            <Text code>{TablePrivileges.TABLE_FULL_METADATA}</Text>
            <Text code>{NamespacePrivileges.NAMESPACE_FULL_METADATA}</Text>
            <Text code>{ViewPrivileges.VIEW_FULL_METADATA}</Text>
            <Text code>{TablePrivileges.TABLE_WRITE_DATA}</Text>
            <Text code>{TablePrivileges.TABLE_READ_DATA}</Text>
            <Text code>{CatalogPrivileges.CATALOG_READ_PROPERTIES}</Text>
            <Text code>{CatalogPrivileges.CATALOG_WRITE_PROPERTIES}</Text>
          </Space>
        </Text>
    )
  },
  {
    key: '3',
    privilege: CatalogPrivileges.CATALOG_MANAGE_METADATA,
    description: CatalogPrivilegeDescriptions.CATALOG_MANAGE_METADATA,
  },
  {
    key: '4',
    privilege: CatalogPrivileges.CATALOG_READ_PROPERTIES,
    description: CatalogPrivilegeDescriptions.CATALOG_READ_PROPERTIES,
  },
  {
    key: '5',
    privilege: CatalogPrivileges.CATALOG_WRITE_PROPERTIES,
    description: CatalogPrivilegeDescriptions.CATALOG_WRITE_PROPERTIES,
  },
  {
    key: '6',
    privilege: CatalogPrivileges.CATALOG_ATTACH_POLICY,
    description: CatalogPrivilegeDescriptions.CATALOG_ATTACH_POLICY,
  },
  {
    key: '7',
    privilege: CatalogPrivileges.CATALOG_DETACH_POLICY,
    description: CatalogPrivilegeDescriptions.CATALOG_DETACH_POLICY,
  },
];

const policyPrivileges: Privilege[] = [
  {
    key: '2',
    privilege: PolicyPrivileges.POLICY_READ,
    description: PolicyPrivilegeDescriptions.POLICY_READ,
  },
  {
    key: '3',
    privilege: PolicyPrivileges.POLICY_WRITE,
    description: PolicyPrivilegeDescriptions.POLICY_WRITE,
  },
  {
    key: '4',
    privilege: PolicyPrivileges.POLICY_LIST,
    description: PolicyPrivilegeDescriptions.POLICY_LIST,
  },
  {
    key: '5',
    privilege: PolicyPrivileges.POLICY_DROP,
    description: PolicyPrivilegeDescriptions.POLICY_DROP,
  },
  {
    key: '6',
    privilege: PolicyPrivileges.POLICY_FULL_METADATA,
    description: PolicyPrivilegeDescriptions.POLICY_FULL_METADATA,
  },
  {
    key: '7',
    privilege: PolicyPrivileges.POLICY_ATTACH,
    description: PolicyPrivilegeDescriptions.POLICY_ATTACH,
  },
  {
    key: '8',
    privilege: PolicyPrivileges.POLICY_DETACH,
    description: PolicyPrivilegeDescriptions.POLICY_DETACH,
  },
];

export default function PrivilegesPage() {
  const columns: ColumnsType<Privilege> = [
    {
      title: 'Privilege',
      dataIndex: 'privilege',
      key: 'privilege',
      width: '30%',
      render: (privilege: string) => (
          <Text code strong>{privilege}</Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
          <Text>{description}</Text>
      ),
    },
  ];

  return (
      <>
        <Space direction="vertical">
          <Title level={2}>
            <Space>
              <SafetyOutlined/>
              Access Control Privileges
            </Space>
          </Title>
          <Paragraph>
            This section describes the privileges that are available in the Polaris access control
            model.
            Privileges are granted to catalog roles, catalog roles are granted to principal roles,
            and
            principal roles are granted to principals to specify the operations that principals can
            perform
            on objects in Polaris.
          </Paragraph>
          <Paragraph>
            <Text type="secondary">
              To grant the full set of privileges (drop, list, read, write, etc.) on an object, you
              can use the full privilege option.
            </Text>
          </Paragraph>
          <Paragraph>
            <Link
                href="https://polaris.apache.org/releases/1.1.0/access-control/#access-control-privileges">
              This information is taken from the Apache Polaris documentation site.
            </Link>
          </Paragraph>
        </Space>

        <Divider/>

        <Space direction="vertical">
          <Title level={4}>
            <Space>
              <TableOutlined style={{color: '#1890ff'}}/>
              Table Privileges
            </Space>
          </Title>
          <Table
              columns={columns}
              dataSource={tablePrivileges}
              pagination={false}
              bordered
              size="middle"
          />

          <Divider/>

          <Title level={4}>
            <Space>
              <EyeOutlined style={{color: '#52c41a'}}/>
              View Privileges
            </Space>
          </Title>
          <Table
              columns={columns}
              dataSource={viewPrivileges}
              pagination={false}
              bordered
              size="middle"
          />

          <Divider/>

          <Title level={4}>
            <Space>
              <FolderOutlined style={{color: '#faad14'}}/>
              Namespace Privileges
            </Space>
          </Title>
          <Table
              columns={columns}
              dataSource={namespacePrivileges}
              pagination={false}
              bordered
              size="middle"
          />

          <Divider/>

          <Title level={4}>
            <Space>
              <FolderOutlined style={{color: '#722ed1'}}/>
              Catalog Privileges
            </Space>
          </Title>
          <Table
              columns={columns}
              dataSource={catalogPrivileges}
              pagination={false}
              bordered
              size="middle"
          />

          <Divider/>

          <Title level={4}>
            <Space>
              <FileProtectOutlined style={{color: '#eb2f96'}}/>
              Policy Privileges
            </Space>
          </Title>
          <Table
              columns={columns}
              dataSource={policyPrivileges}
              pagination={false}
              bordered
              size="middle"
          />
        </Space>
      </>
  );
}
