'use client'
import {Form, Input, message, Modal, Select, Space} from 'antd'
import {FolderOutlined, PlusOutlined, TeamOutlined} from '@ant-design/icons'
import {useEffect, useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'
import {
  CatalogPrivileges,
  NamespacePrivileges,
  TablePrivileges,
  ViewPrivileges,
  PolicyPrivileges,
  CatalogPrivilegeDescriptions,
  NamespacePrivilegeDescriptions,
  TablePrivilegeDescriptions,
  ViewPrivilegeDescriptions,
  PolicyPrivilegeDescriptions,
} from '@/app/privileges/constants'

interface AddPrivilegeModalProps {
  visible: boolean;
  catalogName: string | null;
  catalogRoleName: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface PrivilegeFormValues {
  type: 'catalog' | 'namespace' | 'table' | 'view' | 'policy';
  privilege: string;
}

type GrantType = 'catalog' | 'namespace' | 'table' | 'view' | 'policy';

const privilegesByType: Record<GrantType, Record<string, string>> = {
  catalog: CatalogPrivileges,
  namespace: NamespacePrivileges,
  table: TablePrivileges,
  view: ViewPrivileges,
  policy: PolicyPrivileges,
};

const privilegeDescriptionsByType: Record<GrantType, Record<string, string>> = {
  catalog: CatalogPrivilegeDescriptions,
  namespace: NamespacePrivilegeDescriptions,
  table: TablePrivilegeDescriptions,
  view: ViewPrivilegeDescriptions,
  policy: PolicyPrivilegeDescriptions,
};

export default function AddPrivilegeModal({
                                             visible,
                                             catalogName,
                                             catalogRoleName,
                                             onClose,
                                             onSuccess
                                           }: AddPrivilegeModalProps) {
  const [form] = Form.useForm<PrivilegeFormValues>();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<GrantType>('catalog');
  const {authenticatedFetch} = useAuthenticatedFetch();

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedType('catalog');
    }
  }, [visible, form]);

  const handleTypeChange = (value: GrantType) => {
    setSelectedType(value);
    // Clear the privilege field when type changes
    form.setFieldsValue({privilege: undefined});
  };

  const handleSubmit = async (values: PrivilegeFormValues) => {
    if (!catalogName || !catalogRoleName) {
      message.error('No catalog or catalog role selected');
      return;
    }

    console.log('Form submitted with values:', values);
    setLoading(true);

    try {
      // Build the grant object based on the type
      const grant: Record<string, unknown> = {
        type: values.type,
        privilege: values.privilege,
      };

      const payload = {
        grant,
      };

      console.log('Sending request with payload:', payload);

      const data = await authenticatedFetch(
          `/api/grants/${encodeURIComponent(catalogName)}/${encodeURIComponent(catalogRoleName)}`,
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

      message.success(`Privilege "${values.privilege}" added successfully!`);
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding privilege:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType('catalog');
    onClose();
  };

  // Get available privileges for the selected type
  const availablePrivileges = privilegesByType[selectedType] || {};
  const privilegeDescriptions = privilegeDescriptionsByType[selectedType] || {};

  const privilegeOptions = Object.entries(availablePrivileges).map(([key, value]) => ({
    value: value,
    label: value,
    description: privilegeDescriptions[key] || '',
  }));

  return (
      <Modal
          title={
            <Space>
              <PlusOutlined/>
              Add Privilege to Catalog Role
            </Space>
          }
          open={visible}
          onCancel={handleCancel}
          footer={null}
          width={600}
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
              tooltip="The catalog role to add the privilege to"
          >
            <Input
                prefix={<TeamOutlined/>}
                value={catalogRoleName || ''}
                disabled
            />
          </Form.Item>

          <Form.Item
              label="Privilege Type"
              name="type"
              rules={[
                {required: true, message: 'Please select a privilege type'},
              ]}
              tooltip="Select the type of resource for this privilege"
              initialValue="catalog"
          >
            <Select
                placeholder="Select privilege type"
                onChange={handleTypeChange}
                options={[
                  {value: 'catalog', label: 'Catalog'},
                  {value: 'namespace', label: 'Namespace'},
                  {value: 'table', label: 'Table'},
                  {value: 'view', label: 'View'},
                  {value: 'policy', label: 'Policy'},
                ]}
            />
          </Form.Item>

          <Form.Item
              label="Privilege"
              name="privilege"
              rules={[
                {required: true, message: 'Please select a privilege'},
              ]}
              tooltip="Select the specific privilege to grant"
          >
            <Select
                showSearch
                placeholder="Select a privilege"
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={privilegeOptions}
                optionRender={(option) => (
                    <Space direction="vertical" style={{padding: '4px 0'}}>
                      <div style={{fontWeight: 500}}>{option.data.label}</div>
                      {option.data.description && (
                          <div style={{fontSize: '12px', color: '#666'}}>
                            {option.data.description}
                          </div>
                      )}
                    </Space>
                )}
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
                {loading ? 'Adding...' : 'Add Privilege'}
              </button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

