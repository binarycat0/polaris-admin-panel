'use client'
import {Form, Input, message, Modal, Select, Space} from 'antd'
import {DeleteOutlined, FolderOutlined, TeamOutlined} from '@ant-design/icons'
import {useEffect, useState} from 'react'
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch'
import {Grant} from '@/app/ui/tables/Grants'

interface RemovePrivilegeModalProps {
  visible: boolean;
  catalogName: string | null;
  catalogRoleName: string | null;
  grants: Grant[];
  onClose: () => void;
  onSuccess: () => void;
}

interface RemovePrivilegeFormValues {
  type: string;
  privilege: string;
}

export default function RemovePrivilegeModal({
                                                visible,
                                                catalogName,
                                                catalogRoleName,
                                                grants,
                                                onClose,
                                                onSuccess
                                              }: RemovePrivilegeModalProps) {
  const [form] = Form.useForm<RemovePrivilegeFormValues>();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const {authenticatedFetch} = useAuthenticatedFetch();

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedType(undefined);
    }
  }, [visible, form]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    // Clear the privilege field when type changes
    form.setFieldsValue({privilege: undefined});
  };

  const handleSubmit = async (values: RemovePrivilegeFormValues) => {
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
            method: 'DELETE',
            body: JSON.stringify(payload),
          }
      );

      if (!data) {
        console.log('No data returned');
        return;
      }

      console.log('Received response:', data);

      message.success(`Privilege "${values.privilege}" removed successfully!`);
      form.resetFields();
      setSelectedType(undefined);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error removing privilege:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(undefined);
    onClose();
  };

  // Get unique types from grants
  const availableTypes = Array.from(new Set(grants.map(g => g.type).filter(Boolean))) as string[];
  
  const typeOptions = availableTypes.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  }));

  // Get privileges for the selected type
  const privilegesForSelectedType = selectedType
      ? grants.filter(g => g.type === selectedType)
      : [];

  const privilegeOptions = privilegesForSelectedType.map((grant, index) => ({
    value: grant.privilege || '',
    label: grant.privilege || '',
    key: `${grant.type}-${grant.privilege}-${index}`,
  }));

  return (
      <Modal
          title={
            <Space>
              <DeleteOutlined/>
              Remove Privilege from Catalog Role
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
              tooltip="The catalog role to remove the privilege from"
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
              tooltip="Select the type of privilege to remove"
          >
            <Select
                placeholder="Select privilege type"
                onChange={handleTypeChange}
                options={typeOptions}
                notFoundContent={grants.length === 0 ? "No privileges granted" : "No matching types"}
            />
          </Form.Item>

          <Form.Item
              label="Privilege"
              name="privilege"
              rules={[
                {required: true, message: 'Please select a privilege to remove'},
              ]}
              tooltip="Select the specific privilege to revoke"
          >
            <Select
                showSearch
                placeholder="Select a privilege to remove"
                disabled={!selectedType}
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={privilegeOptions}
                notFoundContent={
                  !selectedType
                      ? "Please select a privilege type first"
                      : privilegesForSelectedType.length === 0
                          ? "No privileges of this type"
                          : "No matching privileges"
                }
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
                  disabled={loading || grants.length === 0}
                  style={{
                    padding: '4px 15px',
                    border: '1px solid #ff4d4f',
                    borderRadius: '6px',
                    background: '#ff4d4f',
                    color: 'white',
                    cursor: loading || grants.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: loading || grants.length === 0 ? 0.6 : 1,
                  }}
              >
                {loading ? 'Removing...' : 'Remove Privilege'}
              </button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
  );
}

