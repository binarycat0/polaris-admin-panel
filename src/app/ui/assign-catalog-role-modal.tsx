'use client'
import {Form, Input, message, Modal, Select, Space} from 'antd'
import {FolderOutlined, UserAddOutlined} from '@ant-design/icons'
import {useEffect, useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'

interface AssignCatalogRoleModalProps {
  visible: boolean;
  catalogName: string | null;
  catalogRoleName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CatalogRoleFormValues {
  principalRoleName: string;
  catalogRoleName: string;
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



export default function AssignCatalogRoleModal({
                                                  visible,
                                                  catalogName,
                                                  catalogRoleName,
                                                  onClose,
                                                  onSuccess
                                                }: AssignCatalogRoleModalProps) {
  const [form] = Form.useForm<CatalogRoleFormValues>();
  const [loading, setLoading] = useState(false);
  const [availablePrincipalRoles, setAvailablePrincipalRoles] = useState<PrincipalRole[]>([]);
  const [principalRolesLoading, setPrincipalRolesLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  // Fetch available principal roles when modal opens and set the catalog role
  useEffect(() => {
    if (visible && catalogName && catalogRoleName) {
      fetchAvailablePrincipalRoles();
      // Pre-fill the catalog role name
      form.setFieldsValue({
        catalogRoleName: catalogRoleName,
      });
    }
  }, [visible, catalogName, catalogRoleName, form]);

  const fetchAvailablePrincipalRoles = async () => {
    setPrincipalRolesLoading(true);
    try {
      const data = await authenticatedFetch('/api/principal-roles');

      if (!data) {
        return;
      }

      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as {
        roles: unknown
      }).roles)) {
        setAvailablePrincipalRoles((data as { roles: PrincipalRole[] }).roles);
      } else {
        console.error('Unexpected principal roles response structure:', data);
        setAvailablePrincipalRoles([]);
      }
    } catch (error) {
      console.error('Error fetching principal roles:', error);
      message.error('Failed to load available principal roles');
    } finally {
      setPrincipalRolesLoading(false);
    }
  };



  const handleSubmit = async (values: CatalogRoleFormValues) => {
    if (!catalogName) {
      message.error('No catalog selected');
      return;
    }

    console.log('Form submitted with values:', values);
    setLoading(true);

    try {
      const payload = {
        catalogRole: {
          name: values.catalogRoleName,
        },
      };

      console.log('Sending request with payload:', payload);

      const data = await authenticatedFetch(
          `/api/principal-roles/${encodeURIComponent(values.principalRoleName)}/catalog-roles/${encodeURIComponent(catalogName)}`,
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

      message.success(`Catalog role "${values.catalogRoleName}" assigned to principal role "${values.principalRoleName}" successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning catalog role:', error);
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
              Assign Catalog Role to Principal Role
            </Space>
          }
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={500}
          destroyOnClose
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
              name="catalogRoleName"
              tooltip="The catalog role to assign to the principal role"
          >
            <Input
                value={catalogRoleName || ''}
                disabled
            />
          </Form.Item>

          <Form.Item
              label="Principal Role"
              name="principalRoleName"
              rules={[
                {required: true, message: 'Please select a principal role'},
              ]}
              tooltip="Select the principal role to assign the catalog role to"
          >
            <Select
                showSearch
                placeholder="Select a principal role"
                loading={principalRolesLoading}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={availablePrincipalRoles.map(role => ({
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

