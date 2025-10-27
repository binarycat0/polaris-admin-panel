'use client'
import {Button, Divider, Form, Input, message, Modal, Space} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined} from '@ant-design/icons'
import {useEffect, useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface EditPrincipalModalProps {
  visible: boolean;
  principalName: string | null;
  currentPrincipal: {
    name: string;
    entityVersion: number;
    properties: Record<string, string>;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface PrincipalFormValues {
  properties: { key: string; value: string }[];
}

export default function EditPrincipalModal({
                                             visible,
                                             principalName,
                                             currentPrincipal,
                                             onClose,
                                             onSuccess
                                           }: EditPrincipalModalProps) {
  const [form] = Form.useForm<PrincipalFormValues>();
  const [loading, setLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  useEffect(() => {
    if (visible && currentPrincipal) {
      // Convert properties object to array format for the form
      const propertiesArray = Object.entries(currentPrincipal.properties || {}).map(([key, value]) => ({
        key,
        value
      }));
      
      form.setFieldsValue({
        properties: propertiesArray.length > 0 ? propertiesArray : undefined
      });
    }
  }, [visible, currentPrincipal, form]);

  const handleSubmit = async (values: PrincipalFormValues) => {
    if (!principalName || !currentPrincipal) {
      message.error('No principal selected');
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
        currentEntityVersion: currentPrincipal.entityVersion,
        properties: properties,
      };

      console.log('Updating principal:', principalName, payload);

      const data = await authenticatedFetch(`/api/principals/${encodeURIComponent(principalName)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!data) {
        return;
      }

      console.log('Principal updated successfully:', data);

      message.success(`Principal "${principalName}" updated successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating principal:', error);
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
              <EditOutlined/>
              Edit Principal
            </Space>
          }
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={600}
          destroyOnHidden
          centered
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
              label="Principal Name"
              tooltip="Principal name cannot be changed"
          >
            <Input
                prefix={<UserOutlined/>}
                value={principalName || ''}
                disabled
            />
          </Form.Item>

          <Divider orientation="left">Properties</Divider>

          <Form.List name="properties">
            {(fields, {add, remove}) => (
                <>
                  {fields.map(({key, name, ...restField}) => (
                      <Space key={key} style={{display: 'flex', marginBottom: 8}} align="baseline">
                        <Form.Item
                            {...restField}
                            name={[name, 'key']}
                            rules={[{required: true, message: 'Missing property key'}]}
                            style={{marginBottom: 0}}
                        >
                          <Input placeholder="Key" style={{width: 200}}/>
                        </Form.Item>
                        <Form.Item
                            {...restField}
                            name={[name, 'value']}
                            rules={[{required: true, message: 'Missing property value'}]}
                            style={{marginBottom: 0}}
                        >
                          <Input placeholder="Value" style={{width: 250}}/>
                        </Form.Item>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined/>}
                            onClick={() => remove(name)}
                        />
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
                Update Principal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

