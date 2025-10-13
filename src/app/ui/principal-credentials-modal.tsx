'use client'
import {
  Modal,
  Space,
  Typography,
  Alert,
  List,
  Avatar
} from 'antd'
import {KeyOutlined} from '@ant-design/icons'
import type {PrincipalWithCredentials} from './types/principal'

const {Text} = Typography;

interface PrincipalCredentialsModalProps {
  visible: boolean;
  principalData: PrincipalWithCredentials | null;
  onClose: () => void;
}

export default function PrincipalCredentialsModal({
  visible,
  principalData,
  onClose
}: PrincipalCredentialsModalProps) {
  return (
    <Modal
      title={
        <Space>
          <KeyOutlined style={{ color: '#52c41a' }} />
          {principalData ? `Principal has created: "${principalData.principal.name}"` : 'Principal Created'}
        </Space>
      }
      open={visible}
      onOk={onClose}
      onCancel={onClose}
      okText="Close"
      cancelButtonProps={{ style: { display: 'none' } }}
      width={500}
      centered
      maskClosable={false}
      keyboard={false}
    >
      {principalData && (
        <div>
          <Alert
            message="Save these credentials - they won't be shown again"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <List
            itemLayout="horizontal"
            dataSource={[principalData.credentials]}
            renderItem={(credentials) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<KeyOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                  title={
                    <Text 
                      code 
                      copyable={{ 
                        text: credentials.clientId,
                        tooltips: ['Copy Client ID', 'Copied!']
                      }}
                      style={{ 
                        fontSize: 13,
                        wordBreak: 'break-all'
                      }}
                    >
                      {credentials.clientId}
                    </Text>
                  }
                  description={
                    <Text 
                      code 
                      copyable={{ 
                        text: credentials.clientSecret,
                        tooltips: ['Copy Client Secret', 'Copied!']
                      }}
                      style={{ 
                        fontSize: 12,
                        wordBreak: 'break-all'
                      }}
                    >
                      {credentials.clientSecret}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </Modal>
  );
}

