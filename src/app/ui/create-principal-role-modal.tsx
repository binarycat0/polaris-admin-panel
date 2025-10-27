'use client'
import {Button, Divider, Form, Input, message, Modal, Space, Switch} from 'antd'
import {DeleteOutlined, PlusOutlined, TeamOutlined} from '@ant-design/icons'
import {useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface CreatePrincipalRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PrincipalRoleFormValues {
  name: string;
  federated: boolean;
  properties: { key: string; value: string }[];
}

export default function CreatePrincipalRoleModal({
                                                   visible,
                                                   onClose,
                                                   onSuccess
                                                 }: CreatePrincipalRoleModalProps) {
  const [form] = Form.useForm<PrincipalRoleFormValues>();
  const [loading, setLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const handleSubmit = async (values: PrincipalRoleFormValues) => {
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
        principalRole: {
          name: values.name,
          federated: values.federated ?? false,
          properties: properties,
        },
      };

      const data = await authenticatedFetch('/api/principal-roles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!data) {
        return;
      }

      message.success(`Principal role "${values.name}" created successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating principal role:', error);
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
              Create New Principal Role
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
            initialValues={{
              federated: false,
            }}
        >
          <Form.Item
              label="Principal Role Name"
              name="name"
              rules={[
                {required: true, message: 'Please enter a principal role name'},
                {
                  pattern: /^(?!\s*[s|S][y|Y][s|S][t|T][e|E][m|M]$).*$/,
                  message: 'Principal role name cannot be "system"',
                },
                {min: 1, max: 256, message: 'Name must be between 1 and 256 characters'},
              ]}
              tooltip="A unique identifier for the principal role"
          >
            <Input
                prefix={<TeamOutlined/>}
                placeholder="Enter principal role name (e.g., data-engineers)"
            />
          </Form.Item>

          <Form.Item
              label="Federated"
              name="federated"
              valuePropName="checked"
              tooltip="Whether the principal role is a federated role (managed by an external identity provider)"
          >
            <Switch/>
          </Form.Item>

          <Divider orientation="left">Properties (Optional)</Divider>

          <Form.List name="properties">
            {(fields, {add, remove}) => (
                <>
                  {fields.map(({key, name, ...restField}) => (
                      <Space key={key} style={{display: 'flex', marginBottom: 8}}
                             align="baseline">
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
                Create Principal Role
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

