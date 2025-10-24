'use client'
import {Form, Input, message, Modal, Select, Space} from 'antd'
import {DeleteOutlined, TeamOutlined} from '@ant-design/icons'
import {useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface RemovePrincipalRoleModalProps {
  visible: boolean;
  principalName: string | null;
  assignedRoles: { name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}

interface RemoveRoleFormValues {
  roleName: string;
}

export default function RemovePrincipalRoleModal({
                                                   visible,
                                                   principalName,
                                                   assignedRoles,
                                                   onClose,
                                                   onSuccess
                                                 }: RemovePrincipalRoleModalProps) {
  const [form] = Form.useForm<RemoveRoleFormValues>();
  const [loading, setLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const handleSubmit = async (values: RemoveRoleFormValues) => {
    if (!principalName) {
      message.error('No principal selected');
      return;
    }

    console.log('Form submitted with values:', values);
    setLoading(true);

    try {
      console.log('Removing role from principal:', principalName, values.roleName);

      const data = await authenticatedFetch(
          `/api/principals/${encodeURIComponent(principalName)}/principal-roles/${encodeURIComponent(values.roleName)}`,
          {
            method: 'DELETE',
          }
      );

      console.log('Received response:', data);

      message.success(`Role "${values.roleName}" removed from principal "${principalName}" successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error removing principal role:', error);
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
              Remove Role from Principal
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
              label="Principal"
              tooltip="The principal to remove the role from"
          >
            <Input
                prefix={<TeamOutlined/>}
                value={principalName || ''}
                disabled
            />
          </Form.Item>

          <Form.Item
              label="Role Name"
              name="roleName"
              rules={[
                {required: true, message: 'Please select a role to remove'},
              ]}
              tooltip="Select the role to remove from this principal"
          >
            <Select
                showSearch
                placeholder="Select a role to remove"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={assignedRoles.map(role => ({
                  value: role.name,
                  label: role.name,
                }))}
                notFoundContent={assignedRoles.length === 0 ? "No roles assigned to this principal" : "No matching roles"}
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
                  disabled={loading || assignedRoles.length === 0}
                  style={{
                    padding: '4px 15px',
                    border: '1px solid #ff4d4f',
                    borderRadius: '6px',
                    background: '#ff4d4f',
                    color: 'white',
                    cursor: loading || assignedRoles.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: loading || assignedRoles.length === 0 ? 0.6 : 1,
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

