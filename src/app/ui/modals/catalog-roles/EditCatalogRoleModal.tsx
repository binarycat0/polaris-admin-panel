'use client'
import {Button, Divider, Form, Input, message, Modal, Space} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined, TeamOutlined} from '@ant-design/icons'
import {useEffect, useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface EditCatalogRoleModalProps {
  visible: boolean;
  catalogName: string | null;
  catalogRoleName: string | null;
  currentCatalogRole: {
    name: string;
    entityVersion: number;
    properties: Record<string, string>;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CatalogRoleFormValues {
  properties: { key: string; value: string }[];
}

export default function EditCatalogRoleModal({
                                                visible,
                                                catalogName,
                                                catalogRoleName,
                                                currentCatalogRole,
                                                onClose,
                                                onSuccess
                                              }: EditCatalogRoleModalProps) {
  const [form] = Form.useForm<CatalogRoleFormValues>();
  const [loading, setLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  useEffect(() => {
    if (visible && currentCatalogRole) {
      const propertiesArray = Object.entries(currentCatalogRole.properties || {}).map(([key, value]) => ({
        key,
        value
      }));
      
      form.setFieldsValue({
        properties: propertiesArray.length > 0 ? propertiesArray : undefined
      });
    }
  }, [visible, currentCatalogRole, form]);

  const handleSubmit = async (values: CatalogRoleFormValues) => {
    if (!catalogName || !catalogRoleName || !currentCatalogRole) {
      message.error('No catalog role selected');
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
        currentEntityVersion: currentCatalogRole.entityVersion,
        properties: properties,
      };

      console.log('Updating catalog role:', catalogName, catalogRoleName, payload);

      const data = await authenticatedFetch(
          `/api/catalogs/${encodeURIComponent(catalogName)}/catalog-roles/${encodeURIComponent(catalogRoleName)}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
      );

      if (!data) {
        return;
      }

      console.log('Catalog role updated successfully:', data);

      message.success(`Catalog role "${catalogRoleName}" updated successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating catalog role:', error);
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
              Edit Catalog Role
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
              label="Catalog Name"
              tooltip="Catalog name cannot be changed"
          >
            <Input
                prefix={<TeamOutlined/>}
                value={catalogName || ''}
                disabled
            />
          </Form.Item>

          <Form.Item
              label="Catalog Role Name"
              tooltip="Catalog role name cannot be changed"
          >
            <Input
                prefix={<TeamOutlined/>}
                value={catalogRoleName || ''}
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
                Update Catalog Role
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

