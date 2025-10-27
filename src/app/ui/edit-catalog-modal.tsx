'use client'
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tabs,
  type TabsProps,
  Typography
} from 'antd'
import {CloudOutlined, DeleteOutlined, EditOutlined, FolderOutlined, PlusOutlined} from '@ant-design/icons'
import {useEffect, useState, type ReactNode} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

const {Text} = Typography;

interface EditCatalogModalProps {
  visible: boolean;
  catalogName: string | null;
  currentCatalog: {
    name: string;
    entityVersion: number;
    properties: Record<string, string>;
    storageConfigInfo: {
      storageType: 'S3' | 'AZURE' | 'GCS' | 'FILE';
      allowedLocations?: string[];
      roleArn?: string;
      externalId?: string;
      userArn?: string;
      region?: string;
      tenantId?: string;
      multiTenantAppName?: string;
      gcsServiceAccount?: string;
      endpoint?: string;
      stsEndpoint?: string;
      stsUnavailable?: boolean;
      endpointInternal?: string;
      pathStyleAccess?: boolean;
      consentUrl?: string;
    };
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CatalogFormValues {
  properties: { key: string; value: string }[];
  storageType: 'S3' | 'AZURE' | 'GCS' | 'FILE';
  allowedLocations: string[];
  // AWS S3 fields
  roleArn?: string;
  externalId?: string;
  userArn?: string;
  region?: string;
  endpoint?: string;
  stsEndpoint?: string;
  stsUnavailable?: boolean;
  endpointInternal?: string;
  pathStyleAccess?: boolean;
  // Azure fields
  tenantId?: string;
  multiTenantAppName?: string;
  consentUrl?: string;
  // GCP fields
  gcsServiceAccount?: string;
}

interface StorageConfigInfo {
  storageType: 'S3' | 'AZURE' | 'GCS' | 'FILE';
  allowedLocations: string[];
  roleArn?: string;
  externalId?: string;
  userArn?: string;
  region?: string;
  endpoint?: string;
  stsEndpoint?: string;
  stsUnavailable?: boolean;
  endpointInternal?: string;
  pathStyleAccess?: boolean;
  tenantId?: string;
  multiTenantAppName?: string;
  consentUrl?: string;
  gcsServiceAccount?: string;
}

export default function EditCatalogModal({
                                           visible,
                                           catalogName,
                                           currentCatalog,
                                           onClose,
                                           onSuccess
                                         }: EditCatalogModalProps) {
  const [form] = Form.useForm<CatalogFormValues>();
  const [loading, setLoading] = useState(false);
  const [storageType, setStorageType] = useState<'S3' | 'AZURE' | 'GCS' | 'FILE'>('S3');
  const {authenticatedFetch} = useAuthenticatedFetch();

  useEffect(() => {
    if (visible && currentCatalog) {
      // Convert properties object to array format for the form, excluding default-base-location
      const propertiesArray = Object.entries(currentCatalog.properties || {})
          .filter(([key]) => key !== 'default-base-location')
          .map(([key, value]) => ({
            key,
            value
          }));

      const storageConfig = currentCatalog.storageConfigInfo;
      const storageTypeValue = storageConfig?.storageType || 'S3';
      setStorageType(storageTypeValue);

      form.setFieldsValue({
        properties: propertiesArray.length > 0 ? propertiesArray : undefined,
        storageType: storageTypeValue,
        allowedLocations: storageConfig?.allowedLocations || [],
        roleArn: storageConfig?.roleArn,
        externalId: storageConfig?.externalId,
        userArn: storageConfig?.userArn,
        region: storageConfig?.region,
        endpoint: storageConfig?.endpoint,
        stsEndpoint: storageConfig?.stsEndpoint,
        stsUnavailable: storageConfig?.stsUnavailable,
        endpointInternal: storageConfig?.endpointInternal,
        pathStyleAccess: storageConfig?.pathStyleAccess,
        tenantId: storageConfig?.tenantId,
        multiTenantAppName: storageConfig?.multiTenantAppName,
        consentUrl: storageConfig?.consentUrl,
        gcsServiceAccount: storageConfig?.gcsServiceAccount,
      });
    }
  }, [visible, currentCatalog, form]);

  const handleSubmit = async (values: CatalogFormValues) => {
    if (!catalogName || !currentCatalog) {
      message.error('No catalog selected');
      return;
    }

    console.log('Form submitted with values:', values);
    setLoading(true);

    try {
      const properties: Record<string, string> = {};

      if (values.properties && values.properties.length > 0) {
        values.properties.forEach(prop => {
          if (prop.key && prop.value) {
            properties[prop.key] = prop.value;
          }
        });
      }

      const storageConfigInfo: StorageConfigInfo = {
        storageType: values.storageType,
        allowedLocations: values.allowedLocations,
      };

      if (values.storageType === 'S3') {
        if (values.roleArn) storageConfigInfo.roleArn = values.roleArn;
        if (values.externalId) storageConfigInfo.externalId = values.externalId;
        if (values.userArn) storageConfigInfo.userArn = values.userArn;
        if (values.region) storageConfigInfo.region = values.region;
        if (values.endpoint) storageConfigInfo.endpoint = values.endpoint;
        if (values.stsEndpoint) storageConfigInfo.stsEndpoint = values.stsEndpoint;
        if (values.stsUnavailable !== undefined) storageConfigInfo.stsUnavailable = values.stsUnavailable;
        if (values.endpointInternal) storageConfigInfo.endpointInternal = values.endpointInternal;
        if (values.pathStyleAccess !== undefined) storageConfigInfo.pathStyleAccess = values.pathStyleAccess;
      } else if (values.storageType === 'AZURE') {
        if (values.tenantId) storageConfigInfo.tenantId = values.tenantId;
        if (values.multiTenantAppName) storageConfigInfo.multiTenantAppName = values.multiTenantAppName;
        if (values.consentUrl) storageConfigInfo.consentUrl = values.consentUrl;
      } else if (values.storageType === 'GCS') {
        if (values.gcsServiceAccount) storageConfigInfo.gcsServiceAccount = values.gcsServiceAccount;
      }

      const payload = {
        currentEntityVersion: currentCatalog.entityVersion,
        properties: properties,
        storageConfigInfo: storageConfigInfo,
      };

      console.log('Updating catalog:', catalogName, payload);

      const data = await authenticatedFetch(
          `/api/catalogs/${encodeURIComponent(catalogName)}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
      );

      if (!data) {
        return;
      }

      console.log('Catalog updated successfully:', data);

      message.success(`Catalog "${catalogName}" updated successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const storageS3MenuChildren: ReactNode = (
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
        <Form.Item label="Endpoint" name="endpoint">
          <Input placeholder="https://s3.example.com:1234"/>
        </Form.Item>
        <Form.Item label="STS Endpoint" name="stsEndpoint">
          <Input placeholder="https://sts.example.com:1234"/>
        </Form.Item>
        <Form.Item label="Endpoint Internal" name="endpointInternal">
          <Input placeholder="https://s3.internal.example.com:1234"/>
        </Form.Item>
        <Form.Item label="STS Unavailable" name="stsUnavailable" valuePropName="checked">
          <Select placeholder="Select">
            <Select.Option value={true}>True</Select.Option>
            <Select.Option value={false}>False</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Path Style Access" name="pathStyleAccess" valuePropName="checked">
          <Select placeholder="Select">
            <Select.Option value={true}>True</Select.Option>
            <Select.Option value={false}>False</Select.Option>
          </Select>
        </Form.Item>
      </>
  )

  const storageAzureMenuChildren: ReactNode = (
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
        <Form.Item label="Consent URL" name="consentUrl">
          <Input placeholder="URL to the Azure permissions request page"/>
        </Form.Item>
      </>
  )

  const storageGCSMenuChildren: ReactNode = (
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

  const storageFileMenuChildren: ReactNode = (
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

  const storageTypeItems: TabsProps['items'] = [
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
              <EditOutlined/>
              Edit Catalog
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
        >
          <Form.Item
              label="Catalog Name"
              tooltip="Catalog name cannot be changed"
          >
            <Input
                prefix={<FolderOutlined/>}
                value={catalogName || ''}
                disabled
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

          <Form.Item style={{marginBottom: 0, marginTop: 24}}>
            <Space style={{width: '100%', justifyContent: 'flex-end'}}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Update Catalog
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

