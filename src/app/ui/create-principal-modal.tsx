'use client'
import {
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Space,
  Switch,
  Typography
} from 'antd'
import {DeleteOutlined, PlusOutlined, UserOutlined} from '@ant-design/icons'
import {useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

const {Text} = Typography;

interface CreatePrincipalModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PrincipalFormValues {
  name: string;
  credentialRotationRequired: boolean;
  properties: { key: string; value: string }[];
}

export default function CreatePrincipalModal({visible, onClose, onSuccess}: CreatePrincipalModalProps) {
  const [form] = Form.useForm<PrincipalFormValues>();
  const [loading, setLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const handleSubmit = async (values: PrincipalFormValues) => {
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
        principal: {
          name: values.name,
          properties: properties,
        },
        credentialRotationRequired: values.credentialRotationRequired || false,
      };

      console.log('Payload:', payload);

      const data = await authenticatedFetch('/api/principals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!data) {
        // Authentication failed or error occurred, authenticatedFetch already handled it
        return;
      }

      // Show success message with credentials
      if ((data as any).credentials) {
        Modal.success({
          title: 'Principal Created Successfully!',
          width: 600,
          content: (
            <div>
              <p>Principal <strong>{values.name}</strong> has been created.</p>
              <Divider />
              <p><strong>Important:</strong> Save these credentials securely. They will not be shown again.</p>
              <div style={{marginTop: 16}}>
                <Text strong>Client ID:</Text>
                <br />
                <Text code copyable>{(data as any).credentials.clientId}</Text>
              </div>
              <div style={{marginTop: 16}}>
                <Text strong>Client Secret:</Text>
                <br />
                <Text code copyable>{(data as any).credentials.clientSecret}</Text>
              </div>
            </div>
          ),
        });
      } else {
        message.success('Principal created successfully!');
      }

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating principal:', error);
      // Error message already shown by authenticatedFetch
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
              <UserOutlined />
              Create New Principal
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
              credentialRotationRequired: false,
            }}
        >
          <Form.Item
              label="Principal Name"
              name="name"
              rules={[
                {required: true, message: 'Please enter a principal name'},
                {
                  pattern: /^(?!\s*[s|S][y|Y][s|S][t|T][e|E][m|M]$).*$/,
                  message: 'Principal name cannot be "system"',
                },
                {min: 1, max: 256, message: 'Name must be between 1 and 256 characters'},
              ]}
              tooltip="A unique identifier for the principal"
          >
            <Input
                prefix={<UserOutlined/>}
                placeholder="Enter principal name (e.g., service-account-1)"
            />
          </Form.Item>

          <Form.Item
              label="Credential Rotation Required"
              name="credentialRotationRequired"
              valuePropName="checked"
              tooltip="If enabled, the initial credentials can only be used to call rotateCredentials"
          >
            <Switch />
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

          <Divider />

          <Form.Item style={{marginBottom: 0}}>
            <Space style={{width: '100%', justifyContent: 'flex-end'}}>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Principal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

