'use client'

import {Button, Card, Flex, Form, Input, message, Space, Typography} from 'antd';
import {KeyOutlined, LockOutlined, UserOutlined} from '@ant-design/icons';
import {useState} from 'react';
import type {ValidateErrorEntity} from 'rc-field-form/lib/interface';

const {Title, Text} = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  scope: string;
  realmHeaderName: string;
  realmHeaderValue: string;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  scope?: string;
}

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const requestBody = {
        client_id: values.username,
        client_secret: values.password,
        scope: values.scope,
        realmHeaderName: values.realmHeaderName,
        realmHeaderValue: values.realmHeaderValue,
      };

      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const tokenData: OAuthTokenResponse = await response.json();

        localStorage.setItem('access_token', tokenData.access_token);
        localStorage.setItem('token_type', tokenData.token_type);

        if (tokenData.expires_in) {
          const expiresAt = Date.now() + (tokenData.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }

        if (values.realmHeaderName && values.realmHeaderValue) {
          localStorage.setItem('realm_header_name', values.realmHeaderName);
          localStorage.setItem('realm_header_value', values.realmHeaderValue);
        } else {
          localStorage.removeItem('realm_header_name');
          localStorage.removeItem('realm_header_value');
        }

        message.success('Authentication successful!');

        window.location.href = '/';

      } else {
        const errorData = await response.json().catch(() => ({}));
        message.error(errorData.error?.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      message.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo: ValidateErrorEntity<LoginFormValues>) => {
    console.log('Failed:', errorInfo);
  };

  return (
      <Flex justify="center" align="center" style={{minHeight: '100vh'}}>
        <Card>
          <Flex justify="center" align="center" vertical>
            <Title level={2}>Authentification</Title>
            <Text type="secondary">Internal Polaris Authentication</Text>
          </Flex>

          <Form
              form={form}
              name="login"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              layout="vertical"
              initialValues={{
                username: "root",
                password: "s3cr3t",
                scope: "PRINCIPAL_ROLE:ALL",
                realmHeaderName: "Polaris-Realm",
                realmHeaderValue: "POLARIS"
              }}
          >
            <Form.Item
                label="Client ID"
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'Please input your client ID!'
                  }
                ]}
            >
              <Input
                  prefix={<UserOutlined/>}
                  placeholder="Enter your Polaris client ID"
              />
            </Form.Item>

            <Form.Item
                label="Client Secret"
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'Please input your client secret!'
                  }
                ]}
            >
              <Input.Password
                  prefix={<LockOutlined/>}
                  placeholder="Enter your Polaris client secret"
              />
            </Form.Item>

            <Form.Item
                label="Scope"
                name="scope"
                rules={[
                  {
                    required: true,
                    message: 'Please input the Polaris scope!'
                  }
                ]}
            >
              <Input
                  prefix={<KeyOutlined/>}
                  placeholder="Enter Polaris scope"
              />
            </Form.Item>

            <Form.Item label="Polaris Realm" style={{marginBottom: 16}}>
              <Space.Compact style={{display: 'flex', width: '100%'}}>
                <Form.Item
                    name="realmHeaderName"
                    style={{flex: 1, marginBottom: 0}}
                >
                  <Input
                      placeholder="Header name"
                  />
                </Form.Item>
                <Form.Item
                    name="realmHeaderValue"
                    style={{flex: 1, marginBottom: 0}}
                >
                  <Input
                      placeholder="Header value"
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>

            <Form.Item>
              <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{width: '100%'}}
                  size="large"
              >
                Sign in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Flex>
  );
}