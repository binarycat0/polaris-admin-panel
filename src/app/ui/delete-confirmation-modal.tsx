'use client'
import {Alert, Button, Modal, Space, Typography} from 'antd'
import {DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons'
import {useState} from 'react'

const {Text, Paragraph} = Typography

export interface DeleteConfirmationModalProps {
  visible: boolean;
  entityType: string; // e.g., "Principal", "Catalog", "Role"
  entityName: string | null;
  onClose: () => void;
  onConfirm: (entityName: string) => Promise<void>;
  description?: string;
  warningMessage?: string;
}

export default function DeleteConfirmationModal({
                                                  visible,
                                                  entityType,
                                                  entityName,
                                                  onClose,
                                                  onConfirm,
                                                  description,
                                                  warningMessage
                                                }: DeleteConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!entityName) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      await onConfirm(entityName);
      onClose();
    } catch (error) {
      console.error(`Error deleting ${entityType.toLowerCase()}:`, error);
      setErrorMessage(
          error instanceof Error
              ? error.message
              : `Failed to delete ${entityType.toLowerCase()}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setErrorMessage(null);
    onClose();
  };

  return (
      <Modal
          title={
            <Space>
              Delete
              <Text underline>{entityName}</Text>
              {entityType}
            </Space>
          }
          open={visible}
          onCancel={handleCancel}
          centered
          footer={[
            <Button key="cancel" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>,
            <Button key="delete" type="primary" danger icon={<DeleteOutlined/>} loading={loading}
                    onClick={handleConfirm}>
              Delete
            </Button>
          ]}
      >
        <Space direction="vertical">
          {errorMessage && (
              <Alert
                  message="Error"
                  description={errorMessage}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setErrorMessage(null)}
              />
          )}

          {`Are you sure you want to delete this ${entityType.toLowerCase()}?`}

          {description}

          {warningMessage && (
              <Text>
                {warningMessage}
              </Text>
          )}

        </Space>
      </Modal>
  );
}

