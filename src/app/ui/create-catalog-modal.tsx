'use client'
import {
  Button,
  Divider,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Radio,
  Select,
  Space,
  Tabs,
  Typography
} from 'antd'
import {CloudOutlined, DatabaseOutlined, DeleteOutlined, PlusOutlined} from '@ant-design/icons'
import {useState} from 'react'

const {Text} = Typography;

interface CreateCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CatalogFormValues {
  type: 'INTERNAL' | 'EXTERNAL';
  name: string;
  defaultBaseLocation: string;
  storageType: 'S3' | 'AZURE' | 'GCS' | 'FILE';
  allowedLocations: string[];
  properties: { key: string; value: string }[];
  // External catalog fields
  connectionType?: 'ICEBERG_REST' | 'HADOOP' | 'HIVE';
  uri?: string;
  remoteCatalogName?: string;
  warehouse?: string;
  authenticationType?: 'OAUTH' | 'BEARER' | 'SIGV4' | 'IMPLICIT';
  // AWS S3 fields
  roleArn?: string;
  externalId?: string;
  userArn?: string;
  region?: string;
  // Azure fields
  tenantId?: string;
  multiTenantAppName?: string;
  // GCP fields
  gcsServiceAccount?: string;
  // OAuth fields
  tokenUri?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string;
  // Bearer fields
  bearerToken?: string;
  // SigV4 fields
  signingRegion?: string;
  signingName?: string;
  roleSessionName?: string;
}

export default function CreateCatalogModal({visible, onClose, onSuccess}: CreateCatalogModalProps) {
  const [form] = Form.useForm<CatalogFormValues>();
  const [loading, setLoading] = useState(false);
  const [catalogType, setCatalogType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [storageType, setStorageType] = useState<'S3' | 'AZURE' | 'GCS' | 'FILE'>('S3');
  const [connectionType, setConnectionType] = useState<'ICEBERG_REST' | 'HADOOP' | 'HIVE'>('ICEBERG_REST');
  const [authenticationType, setAuthenticationType] = useState<'OAUTH' | 'BEARER' | 'SIGV4' | 'IMPLICIT'>('IMPLICIT');

  const handleSubmit = async (values: CatalogFormValues) => {
    console.log('Form submitted with values:', values);
    setLoading(true);
    try {
      const properties: Record<string, string> = {
        'default-base-location': values.defaultBaseLocation,
      };

      if (values.properties && values.properties.length > 0) {
        values.properties.forEach(prop => {
          if (prop.key && prop.value) {
            properties[prop.key] = prop.value;
          }
        });
      }

      const storageConfigInfo: any = {
        storageType: values.storageType,
        allowedLocations: values.allowedLocations,
      };

      if (values.storageType === 'S3') {
        if (values.roleArn) storageConfigInfo.roleArn = values.roleArn;
        if (values.externalId) storageConfigInfo.externalId = values.externalId;
        if (values.userArn) storageConfigInfo.userArn = values.userArn;
        if (values.region) storageConfigInfo.region = values.region;
      } else if (values.storageType === 'AZURE') {
        if (values.tenantId) storageConfigInfo.tenantId = values.tenantId;
        if (values.multiTenantAppName) storageConfigInfo.multiTenantAppName = values.multiTenantAppName;
      } else if (values.storageType === 'GCS') {
        if (values.gcsServiceAccount) storageConfigInfo.gcsServiceAccount = values.gcsServiceAccount;
      }

      const catalog: any = {
        type: values.type,
        name: values.name,
        properties,
        storageConfigInfo,
      };

      if (values.type === 'EXTERNAL' && values.connectionType) {
        const connectionConfigInfo: any = {
          connectionType: values.connectionType,
        };

        if (values.uri) connectionConfigInfo.uri = values.uri;

        if (values.connectionType === 'ICEBERG_REST' && values.remoteCatalogName) {
          connectionConfigInfo.remoteCatalogName = values.remoteCatalogName;
        } else if ((values.connectionType === 'HADOOP' || values.connectionType === 'HIVE') && values.warehouse) {
          connectionConfigInfo.warehouse = values.warehouse;
        }

        if (values.authenticationType) {
          const authenticationParameters: any = {
            authenticationType: values.authenticationType,
          };

          if (values.authenticationType === 'OAUTH') {
            if (values.tokenUri) authenticationParameters.tokenUri = values.tokenUri;
            if (values.clientId) authenticationParameters.clientId = values.clientId;
            if (values.clientSecret) authenticationParameters.clientSecret = values.clientSecret;
            if (values.scopes) authenticationParameters.scopes = values.scopes.split(',').map(s => s.trim());
          } else if (values.authenticationType === 'BEARER') {
            if (values.bearerToken) authenticationParameters.bearerToken = values.bearerToken;
          } else if (values.authenticationType === 'SIGV4') {
            if (values.roleArn) authenticationParameters.roleArn = values.roleArn;
            if (values.signingRegion) authenticationParameters.signingRegion = values.signingRegion;
            if (values.externalId) authenticationParameters.externalId = values.externalId;
            if (values.roleSessionName) authenticationParameters.roleSessionName = values.roleSessionName;
            if (values.signingName) authenticationParameters.signingName = values.signingName;
          }

          connectionConfigInfo.authenticationParameters = authenticationParameters;
        }

        catalog.connectionConfigInfo = connectionConfigInfo;
      }

      const payload = {
        catalog,
      };

      const token = localStorage.getItem('access_token');
      const realmHeaderName = localStorage.getItem('realm_header_name');
      const realmHeaderValue = localStorage.getItem('realm_header_value');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      if (realmHeaderName && realmHeaderValue) {
        headers[realmHeaderName] = realmHeaderValue;
      }

      const response = await fetch('/api/catalogs', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Failed to create catalog';
        message.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Success
      message.success('Catalog created successfully!');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating catalog:', error);
      // Error message already shown above
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const storageS3MenuChildren = (
      <>
        <Form.Item
            label="Allowed Locations"
            name="allowedLocations"
            rules={[{required: true, message: 'Please enter allowed locations'}]}
            tooltip="Storage locations that are allowed for this catalog"
        >
          <Select
              mode="tags"
              placeholder="s3://bucketname/prefix/"
              style={{width: '100%'}}
          />
        </Form.Item>
        <Form.Item label="Role ARN" name="roleArn">
          <Input placeholder="arn:aws:iam::123456789001:role/my-role"/>
        </Form.Item>
        <Form.Item label="User ARN" name="userArn">
          <Input placeholder="arn:aws:iam::123456789001:user/my-user"/>
        </Form.Item>
        <Form.Item label="External ID" name="externalId">
          <Input placeholder="Optional external ID"/>
        </Form.Item>
        <Form.Item label="Region" name="region">
          <Input placeholder="us-east-1"/>
        </Form.Item>
      </>
  )

  const storageAzureMenuChildren = (
      <>
        <Form.Item
            label="Allowed Locations"
            name="allowedLocations"
            rules={[{required: true, message: 'Please enter allowed locations'}]}
            tooltip="Storage locations that are allowed for this catalog"
        >
          <Select
              mode="tags"
              placeholder="abfss://container@storageaccount.blob.core.windows.net/prefix/"
              style={{width: '100%'}}
          />
        </Form.Item>
        <Form.Item
            label="Tenant ID"
            name="tenantId"
            rules={[{
              required: true,
              message: 'Tenant ID is required for Azure storage'
            }]}
        >
          <Input placeholder="Azure tenant ID"/>
        </Form.Item>
        <Form.Item label="Multi-Tenant App Name" name="multiTenantAppName">
          <Input placeholder="Azure application name"/>
        </Form.Item>
      </>
  )

  const storageGCSMenuChildren = (
      <>
        <Form.Item
            label="Allowed Locations"
            name="allowedLocations"
            rules={[{required: true, message: 'Please enter allowed locations'}]}
            tooltip="Storage locations that are allowed for this catalog"
        >
          <Select
              mode="tags"
              placeholder="gs://bucketname/prefix/"
              style={{width: '100%'}}
          />
        </Form.Item>
        <Form.Item label="GCS Service Account" name="gcsServiceAccount">
          <Input placeholder="GCS service account"/>
        </Form.Item>
      </>
  )

  const storageFileMenuChildren = (
      <>
        <Form.Item
            label="Allowed Locations"
            name="allowedLocations"
            rules={[{required: true, message: 'Please enter allowed locations'}]}
            tooltip="Storage locations that are allowed for this catalog"
        >
          <Select
              mode="tags"
              placeholder="file:///path/to/directory/"
              style={{width: '100%'}}
          />
        </Form.Item>
      </>
  )

  const storageTypeItems = [
    {
      key: 'S3',
      label: 'AWS S3',
      children: storageS3MenuChildren,
    },
    {
      key: 'AZURE',
      label: 'Azure',
      children: storageAzureMenuChildren,
    },
    {
      key: 'GCS',
      label: 'Google Cloud Storage',
      children: storageGCSMenuChildren,
    },
    {
      key: 'FILE',
      label: 'File (Testing Only)',
      children: storageFileMenuChildren,
    },
  ]

  return (
      <Modal
          title={
            <Space>
              <DatabaseOutlined/>
              Create New Catalog
            </Space>
          }
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={800}
          destroyOnHidden
          centered
          styles={{body: {maxHeight: '70vh', overflowY: 'auto'}}}
      >
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onFinishFailed={(errorInfo) => {
              console.log('Form validation failed:', errorInfo);
              message.error('Please fill in all required fields');
            }}
            autoComplete="off"
            initialValues={{
              type: 'INTERNAL',
              storageType: 'S3',
              connectionType: 'ICEBERG_REST',
              authenticationType: 'IMPLICIT',
            }}
        >
          <Form.Item
              label="Catalog Type"
              name="type"
              rules={[{required: true, message: 'Please select a catalog type'}]}
          >
            <Radio.Group onChange={(e) => setCatalogType(e.target.value)}>
              <Radio.Button value="INTERNAL">Internal</Radio.Button>
              <Radio.Button value="EXTERNAL">External</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
              label="Catalog Name"
              name="name"
              rules={[
                {required: true, message: 'Please enter a catalog name'},
                {
                  pattern: /^(?!\s*[s|S][y|Y][s|S][t|T][e|E][m|M]$).*$/,
                  message: 'Catalog name cannot be "system"',
                },
                {min: 1, max: 256, message: 'Name must be between 1 and 256 characters'},
              ]}
          >
            <Input
                prefix={<DatabaseOutlined/>}
                placeholder="Enter catalog name (e.g., my_catalog)"
            />
          </Form.Item>

          <Form.Item
              label="Default Base Location"
              name="defaultBaseLocation"
              rules={[
                {required: true, message: 'Please enter a default base location'},
              ]}
              tooltip={(<>
                The default base location for the catalog. This is the location where all the data
                for the catalog will be stored.
              </>)}
          >
            <Input
                prefix={<CloudOutlined/>}
                placeholder="s3://bucketname/prefix/"
            />
          </Form.Item>

          <Divider orientation="left">Storage Configuration</Divider>

          <Form.Item name="storageType" hidden noStyle>
            <Input/>
          </Form.Item>

          <Tabs
              type="card"
              activeKey={storageType}
              onChange={(key) => {
                setStorageType(key as 'S3' | 'AZURE' | 'GCS' | 'FILE');
                form.setFieldValue('storageType', key);
              }}
              items={storageTypeItems}
          />

          {catalogType === 'EXTERNAL' && (
              <>
                <Divider orientation="left">Connection Configuration</Divider>

                <Form.Item
                    label="Connection Type"
                    name="connectionType"
                    rules={[{required: true, message: 'Please select a connection type'}]}
                >
                  <Select onChange={(value) => setConnectionType(value)}>
                    <Select.Option value="ICEBERG_REST">Iceberg REST</Select.Option>
                    <Select.Option value="HADOOP">Hadoop</Select.Option>
                    <Select.Option value="HIVE">Hive</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item label="URI" name="uri">
                  <Input placeholder="https://catalog.example.com"/>
                </Form.Item>

                {connectionType === 'ICEBERG_REST' && (
                    <Form.Item label="Remote Catalog Name" name="remoteCatalogName">
                      <Input placeholder="Remote catalog instance name"/>
                    </Form.Item>
                )}

                {(connectionType === 'HADOOP' || connectionType === 'HIVE') && (
                    <Form.Item label="Warehouse" name="warehouse">
                      <Input placeholder="Warehouse location"/>
                    </Form.Item>
                )}

                <Form.Item
                    label="Authentication Type"
                    name="authenticationType"
                    rules={[{required: true, message: 'Please select an authentication type'}]}
                >
                  <Select onChange={(value) => setAuthenticationType(value)}>
                    <Select.Option value="IMPLICIT">Implicit</Select.Option>
                    <Select.Option value="OAUTH">OAuth</Select.Option>
                    <Select.Option value="BEARER">Bearer Token</Select.Option>
                    <Select.Option value="SIGV4">AWS SigV4</Select.Option>
                  </Select>
                </Form.Item>

                {authenticationType === 'OAUTH' && (
                    <>
                      <Form.Item label="Token URI" name="tokenUri">
                        <Input placeholder="https://auth.example.com/token"/>
                      </Form.Item>
                      <Form.Item label="Client ID" name="clientId">
                        <Input placeholder="OAuth client ID"/>
                      </Form.Item>
                      <Form.Item label="Client Secret" name="clientSecret">
                        <Input.Password placeholder="OAuth client secret"/>
                      </Form.Item>
                      <Form.Item label="Scopes" name="scopes">
                        <Input placeholder="scope1, scope2"/>
                      </Form.Item>
                    </>
                )}

                {authenticationType === 'BEARER' && (
                    <Form.Item label="Bearer Token" name="bearerToken">
                      <Input.Password placeholder="Bearer token"/>
                    </Form.Item>
                )}

                {authenticationType === 'SIGV4' && (
                    <>
                      <Form.Item
                          label="Role ARN"
                          name="roleArn"
                          rules={[{required: true, message: 'Role ARN is required for SigV4'}]}
                      >
                        <Input placeholder="arn:aws:iam::123456789001:role/my-role"/>
                      </Form.Item>
                      <Form.Item
                          label="Signing Region"
                          name="signingRegion"
                          rules={[{
                            required: true,
                            message: 'Signing region is required for SigV4'
                          }]}
                      >
                        <Input placeholder="us-west-2"/>
                      </Form.Item>
                      <Form.Item label="External ID" name="externalId">
                        <Input placeholder="Optional external ID"/>
                      </Form.Item>
                      <Form.Item label="Role Session Name" name="roleSessionName">
                        <Input placeholder="polaris-remote-catalog-access"/>
                      </Form.Item>
                      <Form.Item label="Signing Name" name="signingName">
                        <Input placeholder="execute-api"/>
                      </Form.Item>
                    </>
                )}
              </>
          )}

          <Divider orientation="left">
            <Text type="secondary">Additional Properties (Optional)</Text>
          </Divider>

          <Form.List name="properties">
            {(fields, {add, remove}) => (
                <>
                  {fields.map(({key, name, ...restField}) => (
                      <Space key={key} style={{display: 'flex', marginBottom: 8}} align="baseline">
                        <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{required: true, message: 'Missing property key'}]}
                        >
                          <Input placeholder="Property key"/>
                        </Form.Item>
                        <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{required: true, message: 'Missing property value'}]}
                        >
                          <Input placeholder="Property value"/>
                        </Form.Item>
                        <DeleteOutlined onClick={() => remove(name)} style={{color: '#ff4d4f'}}/>
                      </Space>
                  ))}
                  <Form.Item>
                    <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined/>}
                    >
                      Add Property
                    </Button>
                  </Form.Item>
                </>
            )}
          </Form.List>

          <Form.Item>
            <Flex justify="flex-end">
              <Space>
                <Button onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Create Catalog
                </Button>
              </Space>
            </Flex>
          </Form.Item>
        </Form>
      </Modal>
  );
}

