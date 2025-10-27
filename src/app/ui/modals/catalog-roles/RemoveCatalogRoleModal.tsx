'use client'
import {Form, Input, message, Modal, Select, Space} from 'antd'
import {DeleteOutlined, FolderOutlined, TeamOutlined} from '@ant-design/icons'
import {useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface RemoveCatalogRoleModalProps {
  visible: boolean;
  catalogName: string | null;
  catalogRoleName: string | null;
  assignedPrincipalRoles: { name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

interface RemoveRoleFormValues {
  principalRoleName: string;
}

export default function RemoveCatalogRoleModal({
                                                  visible,
                                                  catalogName,
                                                  catalogRoleName,
                                                  assignedPrincipalRoles,
                                                  onClose,
                                                  onSuccess
                                                }: RemoveCatalogRoleModalProps) {
  const [form] = Form.useForm<RemoveRoleFormValues>();
  const [loading, setLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const handleSubmit = async (values: RemoveRoleFormValues) => {
    if (!catalogName || !catalogRoleName) {
      message.error('No catalog or catalog role selected');
      return;
    }

    console.log('Form submitted with values:', values);
    setLoading(true);

    try {
      console.log('Removing catalog role from principal role:', values.principalRoleName, catalogRoleName);

      const data = await authenticatedFetch(
          `/api/principal-roles/${encodeURIComponent(values.principalRoleName)}/catalog-roles/${encodeURIComponent(catalogName)}/${encodeURIComponent(catalogRoleName)}`,
          {
            method: 'DELETE',
          }
      );

      console.log('Received response:', data);

      message.success(`Catalog role "${catalogRoleName}" removed from principal role "${values.principalRoleName}" successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error removing catalog role:', error);
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
              <DeleteOutlined/>
              Remove Catalog Role from Principal Role
            </Space>
          }
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={500}
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
              label="Catalog"
              tooltip="The catalog containing the role"
          >
            <Input
                prefix={<FolderOutlined/>}
                value={catalogName || ''}
                disabled
            />
          </Form.Item>

          <Form.Item
              label="Catalog Role"
              tooltip="The catalog role to remove from principal role"
          >
            <Input
                prefix={<TeamOutlined/>}
                value={catalogRoleName || ''}
                disabled
            />
          </Form.Item>

          <Form.Item
              label="Principal Role"
              name="principalRoleName"
              rules={[
                {required: true, message: 'Please select a principal role to remove'},
              ]}
              tooltip="Select the principal role to remove the catalog role from"
          >
            <Select
                showSearch
                placeholder="Select a principal role to remove"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={assignedPrincipalRoles.map(role => ({
                  value: role.name,
                  label: role.name,
                }))}
                notFoundContent={assignedPrincipalRoles.length === 0 ? "No principal roles assigned to this catalog role" : "No matching roles"}
            />
          </Form.Item>

          <Form.Item style={{marginBottom: 0, marginTop: 24}}>
            <Space style={{width: '100%', justifyContent: 'flex-end'}}>
              <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '4px 15px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                  }}
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={loading || assignedPrincipalRoles.length === 0}
                  style={{
                    padding: '4px 15px',
                    border: '1px solid #ff4d4f',
                    borderRadius: '6px',
                    background: '#ff4d4f',
                    color: 'white',
                    cursor: loading || assignedPrincipalRoles.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: loading || assignedPrincipalRoles.length === 0 ? 0.6 : 1,
                  }}
              >
                {loading ? 'Removing...' : 'Remove Role'}
              </button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

