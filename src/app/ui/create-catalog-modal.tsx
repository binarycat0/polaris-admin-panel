'use client'
import {Modal, Form, Input, Button, Space, Typography, Divider, message} from 'antd'
import {DatabaseOutlined, CloudOutlined, PlusOutlined, DeleteOutlined} from '@ant-design/icons'
import {useState} from 'react'

const {Text} = Typography;

interface CreateCatalogModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CatalogFormValues {
  name: string;
  defaultBaseLocation: string;
  allowedLocations: string;
  properties: { key: string; value: string }[];
}

export default function CreateCatalogModal({visible, onClose, onSuccess}: CreateCatalogModalProps) {
  const [form] = Form.useForm<CatalogFormValues>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CatalogFormValues) => {
    setLoading(true);
    try {
      // Build the properties object
      const properties: Record<string, string> = {
        'default-base-location': values.defaultBaseLocation,
      };

      // Add additional properties if provided
      if (values.properties && values.properties.length > 0) {
        values.properties.forEach(prop => {
          if (prop.key && prop.value) {
            properties[prop.key] = prop.value;
          }
        });
      }

      // Build the request payload
      const payload = {
        catalog: {
          name: values.name,
          properties,
          storageConfigInfo: {
            allowedLocations: values.allowedLocations,
          },
        },
      };

      // Get auth headers from localStorage
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
          width={700}
          destroyOnHidden
      >
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
        >
          <Form.Item
              label="Catalog Name"
              name="name"
              rules={[
                {required: true, message: 'Please enter a catalog name'},
                {
                  pattern: /^[a-zA-Z0-9_-]+$/,
                  message: 'Catalog name can only contain letters, numbers, underscores, and hyphens',
                },
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
              tooltip="For AWS: s3://bucketname/prefix/, for Azure: abfss://container@storageaccount.blob.core.windows.net/prefix/, for GCP: gs://bucketname/prefix/"
          >
            <Input
                prefix={<CloudOutlined/>}
                placeholder="s3://bucketname/prefix/ or abfss://container@account.blob.core.windows.net/prefix/"
            />
          </Form.Item>

          <Form.Item
              label="Allowed Locations"
              name="allowedLocations"
              rules={[
                {required: true, message: 'Please enter allowed locations'},
              ]}
              tooltip="Storage locations that are allowed for this catalog"
          >
            <Input
                prefix={<CloudOutlined/>}
                placeholder="s3://bucketname/prefix/ or abfss://container@account.blob.core.windows.net/prefix/"
            />
          </Form.Item>

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
                Create Catalog
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

