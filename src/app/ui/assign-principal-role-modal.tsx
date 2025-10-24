'use client'
import {Form, Input, message, Modal, Select, Space} from 'antd'
import {TeamOutlined, UserAddOutlined} from '@ant-design/icons'
import {useEffect, useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface AssignPrincipalRoleModalProps {
  visible: boolean;
  principalName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface PrincipalRoleFormValues {
  roleName: string;
}

interface PrincipalRole {
  name: string;
  federated: boolean;
  properties: {
    [key: string]: string;
  };
  createTimestamp: number;
  lastUpdateTimestamp: number;
  entityVersion: number;
}

export default function AssignPrincipalRoleModal({
                                                   visible,
                                                   principalName,
                                                   onClose,
                                                   onSuccess
                                                 }: AssignPrincipalRoleModalProps) {
  const [form] = Form.useForm<PrincipalRoleFormValues>();
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<PrincipalRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  // Fetch available principal roles when modal opens
  useEffect(() => {
    if (visible) {
      fetchAvailableRoles();
    }
  }, [visible]);

  const fetchAvailableRoles = async () => {
    setRolesLoading(true);
    try {
      const data = await authenticatedFetch('/api/principal-roles');

      if (!data) {
        return;
      }

      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as {
        roles: unknown
      }).roles)) {
        setAvailableRoles((data as { roles: PrincipalRole[] }).roles);
      } else {
        console.error('Unexpected principal roles response structure:', data);
        setAvailableRoles([]);
      }
    } catch (error) {
      console.error('Error fetching principal roles:', error);
      message.error('Failed to load available roles');
    } finally {
      setRolesLoading(false);
    }
  };

  const handleSubmit = async (values: PrincipalRoleFormValues) => {
    if (!principalName) {
      message.error('No principal selected');
      return;
    }

    console.log('Form submitted with values:', values);
    setLoading(true);

    try {
      const payload = {
        principalRole: {
          name: values.roleName,
        },
      };

      console.log('Sending request with payload:', payload);

      const data = await authenticatedFetch(
          `/api/principals/${encodeURIComponent(principalName)}/principal-roles`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
      );

      if (!data) {
        console.log('No data returned');
        return;
      }

      console.log('Received response:', data);

      message.success(`Role "${values.roleName}" assigned to principal "${principalName}" successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning principal role:', error);
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
              <UserAddOutlined/>
              Assign Role to Principal
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
              tooltip="The principal to assign the role to"
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
                {required: true, message: 'Please select a role'},
              ]}
              tooltip="Select the role to assign to this principal"
          >
            <Select
                showSearch
                placeholder="Select a role"
                loading={rolesLoading}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availableRoles.map(role => ({
                  value: role.name,
                  label: role.name,
                }))}
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
                  disabled={loading}
                  style={{
                    padding: '4px 15px',
                    border: '1px solid #1890ff',
                    borderRadius: '6px',
                    background: '#1890ff',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
              >
                {loading ? 'Assigning...' : 'Assign Role'}
              </button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

