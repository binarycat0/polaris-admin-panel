'use client'

import {Divider, Space, Table, Typography} from 'antd'
import {
  DatabaseOutlined,
  EyeOutlined,
  FileProtectOutlined,
  FolderOutlined,
  SafetyOutlined,
  TableOutlined
} from '@ant-design/icons'
import type {ColumnsType} from 'antd/es/table'

const {Text, Title, Paragraph, Link} = Typography;

interface Privilege {
  key: string;
  privilege: string;
  description: string | React.ReactNode;
}

const tablePrivileges: Privilege[] = [
  {
    key: '1',
    privilege: 'TABLE_CREATE',
    description: 'Enables registering a table with the catalog.',
  },
  {
    key: '2',
    privilege: 'TABLE_DROP',
    description: 'Enables dropping a table from the catalog.',
  },
  {
    key: '3',
    privilege: 'TABLE_LIST',
    description: 'Enables listing any table in the catalog.',
  },
  {
    key: '4',
    privilege: 'TABLE_READ_PROPERTIES',
    description: 'Enables reading properties of the table.',
  },
  {
    key: '5',
    privilege: 'TABLE_WRITE_PROPERTIES',
    description: 'Enables configuring properties for the table.',
  },
  {
    key: '6',
    privilege: 'TABLE_READ_DATA',
    description: 'Enables reading data from the table by receiving short-lived read-only storage credentials from the catalog.',
  },
  {
    key: '7',
    privilege: 'TABLE_WRITE_DATA',
    description: 'Enables writing data to the table by receiving short-lived read+write storage credentials from the catalog.',
  },
  {
    key: '8',
    privilege: 'TABLE_FULL_METADATA',
    description: (
        <Text>
          Grants all table privileges, except <Text code>TABLE_READ_DATA</Text> and <Text code>TABLE_WRITE_DATA</Text>, which need to be granted
          individually.
        </Text>
    ),
  },
  {
    key: '9',
    privilege: 'TABLE_ATTACH_POLICY',
    description: 'Enables attaching policy to a table.',
  },
  {
    key: '10',
    privilege: 'TABLE_DETACH_POLICY',
    description: 'Enables detaching policy from a table.',
  },
];

const viewPrivileges: Privilege[] = [
  {
    key: '1',
    privilege: 'VIEW_CREATE',
    description: 'Enables registering a view with the catalog.',
  },
  {
    key: '2',
    privilege: 'VIEW_DROP',
    description: 'Enables dropping a view from the catalog.',
  },
  {
    key: '3',
    privilege: 'VIEW_LIST',
    description: 'Enables listing any views in the catalog.',
  },
  {
    key: '4',
    privilege: 'VIEW_READ_PROPERTIES',
    description: 'Enables reading all the view properties.',
  },
  {
    key: '5',
    privilege: 'VIEW_WRITE_PROPERTIES',
    description: 'Enables configuring view properties.',
  },
  {
    key: '6',
    privilege: 'VIEW_FULL_METADATA',
    description: 'Grants all view privileges.',
  },
];

const namespacePrivileges: Privilege[] = [
  {
    key: '1',
    privilege: 'NAMESPACE_CREATE',
    description: 'Enables creating a namespace in a catalog.',
  },
  {
    key: '2',
    privilege: 'NAMESPACE_DROP',
    description: 'Enables dropping the namespace from the catalog.',
  },
  {
    key: '3',
    privilege: 'NAMESPACE_LIST',
    description: 'Enables listing any object in the namespace, including nested namespaces and tables.',
  },
  {
    key: '4',
    privilege: 'NAMESPACE_READ_PROPERTIES',
    description: 'Enables reading all the namespace properties.',
  },
  {
    key: '5',
    privilege: 'NAMESPACE_WRITE_PROPERTIES',
    description: 'Enables configuring namespace properties.',
  },
  {
    key: '6',
    privilege: 'NAMESPACE_FULL_METADATA',
    description: 'Grants all namespace privileges.',
  },
  {
    key: '7',
    privilege: 'NAMESPACE_ATTACH_POLICY',
    description: 'Enables attaching policy to a namespace.',
  },
  {
    key: '8',
    privilege: 'NAMESPACE_DETACH_POLICY',
    description: 'Enables detaching policy from a namespace.',
  },
];

const catalogPrivileges: Privilege[] = [
  {
    key: '1',
    privilege: 'CATALOG_MANAGE_ACCESS',
    description: 'Includes the ability to grant or revoke privileges on objects in a catalog to catalog roles, and the ability to grant or revoke catalog roles to or from principal roles.',
  },
  {
    key: '2',
    privilege: 'CATALOG_MANAGE_CONTENT',
    description: (
        <Text>
          Enables full management of content for the catalog. This privilege encompasses the
          following privileges:
          <Space direction="vertical">
            <Text code>CATALOG_MANAGE_METADATA</Text>
            <Text code>TABLE_FULL_METADATA</Text>
            <Text code>NAMESPACE_FULL_METADATA</Text>
            <Text code>VIEW_FULL_METADATA</Text>
            <Text code>TABLE_WRITE_DATA</Text>
            <Text code>TABLE_READ_DATA</Text>
            <Text code>CATALOG_READ_PROPERTIES</Text>
            <Text code>CATALOG_WRITE_PROPERTIES</Text>
          </Space>
        </Text>
    )
  },
  {
    key: '3',
    privilege: 'CATALOG_MANAGE_METADATA',
    description: 'Enables full management of the catalog, catalog roles, namespaces, and tables.',
  },
  {
    key: '4',
    privilege: 'CATALOG_READ_PROPERTIES',
    description: 'Enables listing catalogs and reading properties of the catalog.',
  },
  {
    key: '5',
    privilege: 'CATALOG_WRITE_PROPERTIES',
    description: 'Enables configuring catalog properties.',
  },
  {
    key: '6',
    privilege: 'CATALOG_ATTACH_POLICY',
    description: 'Enables attaching policy to a catalog.',
  },
  {
    key: '7',
    privilege: 'CATALOG_DETACH_POLICY',
    description: 'Enables detaching policy from a catalog.',
  },
];

const policyPrivileges: Privilege[] = [
  {
    key: '1',
    privilege: 'POLICY_CREATE',
    description: 'Enables creating a policy under specified namespace.',
  },
  {
    key: '2',
    privilege: 'POLICY_READ',
    description: 'Enables reading policy content and metadata.',
  },
  {
    key: '3',
    privilege: 'POLICY_WRITE',
    description: 'Enables updating the policy details such as its content or description.',
  },
  {
    key: '4',
    privilege: 'POLICY_LIST',
    description: 'Enables listing any policy from the catalog.',
  },
  {
    key: '5',
    privilege: 'POLICY_DROP',
    description: 'Enables dropping a policy if it is not attached to any resource entity.',
  },
  {
    key: '6',
    privilege: 'POLICY_FULL_METADATA',
    description: 'Grants all policy privileges.',
  },
  {
    key: '7',
    privilege: 'POLICY_ATTACH',
    description: 'Enables policy to be attached to entities.',
  },
  {
    key: '8',
    privilege: 'POLICY_DETACH',
    description: 'Enables policy to be detached from entities.',
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
              <DatabaseOutlined style={{color: '#722ed1'}}/>
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
