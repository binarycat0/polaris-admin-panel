'use client'
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Space
} from 'antd'
import {DeleteOutlined, PlusOutlined, TeamOutlined} from '@ant-design/icons'
import {useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface CreateCatalogRoleModalProps {
  visible: boolean;
  catalogName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CatalogRoleFormValues {
  name: string;
  properties: { key: string; value: string }[];
}

export default function CreateCatalogRoleModal({visible, catalogName, onClose, onSuccess}: CreateCatalogRoleModalProps) {
  const [form] = Form.useForm<CatalogRoleFormValues>();
  const [loading, setLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const handleSubmit = async (values: CatalogRoleFormValues) => {
    if (!catalogName) {
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

      const payload = {
        catalogRole: {
          name: values.name,
          properties: properties,
        },
      };

      console.log('Payload:', payload);

      const data = await authenticatedFetch(`/api/catalog-roles/${catalogName}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!data) {
        return;
      }

      console.log('Catalog role created successfully:', data);
      message.success(`Catalog role "${values.name}" created successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating catalog role:', error);
      message.error('Failed to create catalog role. Please try again.');
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
              <TeamOutlined/>
              Create New Catalog Role for {catalogName}
            </Space>
          }
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={700}
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
              label="Catalog Role Name"
              name="name"
              rules={[
                {required: true, message: 'Please enter a catalog role name'},
                {
                  pattern: /^(?!\s*[s|S][y|Y][s|S][t|T][e|E][m|M]$).*$/,
                  message: 'Catalog role name cannot be "system"',
                },
                {min: 1, max: 256, message: 'Name must be between 1 and 256 characters'},
              ]}
              tooltip="A unique identifier for the catalog role"
          >
            <Input
                prefix={<TeamOutlined/>}
                placeholder="Enter catalog role name (e.g., data-engineer)"
            />
          </Form.Item>

          <Divider orientation="left">Properties (Optional)</Divider>

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
                        <DeleteOutlined onClick={() => remove(name)}/>
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

          <Divider/>

          <Form.Item style={{marginBottom: 0}}>
            <Space style={{width: '100%', justifyContent: 'flex-end'}}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Catalog Role
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

