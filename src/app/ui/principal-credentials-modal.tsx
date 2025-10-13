'use client'
import {
  Modal,
  Space,
  Typography,
  Alert,
  List,
  Avatar,
  Button
} from 'antd'
import {KeyOutlined} from '@ant-design/icons'
import type {PrincipalWithCredentials} from './types/principal'

const {Text} = Typography;

interface PrincipalCredentialsModalProps {
  visible: boolean;
  principalData: PrincipalWithCredentials | null;
  onClose: () => void;
  title?: string;
}

export default function PrincipalCredentialsModal({
                                                    visible,
                                                    principalData,
                                                    onClose,
                                                    title
                                                  }: PrincipalCredentialsModalProps) {
  const defaultTitle = principalData ? `Principal has created: "${principalData.principal.name}"` : 'Principal Created';

  return (
      <Modal
          title={
            <Space>
              <KeyOutlined/>
              {title || defaultTitle}
            </Space>
          }
          open={visible}
          onCancel={onClose}
          width={500}
          centered
          maskClosable={false}
          keyboard={false}
          footer={[
            <Button key="close" type="primary" onClick={onClose}>
              Ok
            </Button>
          ]}
      >
        {principalData && (
            <div>
              <Alert
                  message="Save these credentials - they won't be shown again"
                  type="info"
                  showIcon
                  style={{marginBottom: 16}}
              />

              <List
                  itemLayout="horizontal"
                  dataSource={[principalData.credentials]}
                  renderItem={(credentials) => (
                      <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar icon={<KeyOutlined/>}/>}
                            title={
                              <Space>
                                <Text>
                                  Client ID:
                                </Text>
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
                              </Space>
                            }
                            description={
                              <Space>
                                <Text>
                                  Client Secret:
                                </Text>
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
                              </Space>
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

