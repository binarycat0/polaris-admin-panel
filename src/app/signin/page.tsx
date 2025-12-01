'use client'

import {Button, Card, Flex, Form, Input, message, Space, Tabs, Typography} from 'antd';
import {KeyOutlined, LockOutlined, UserOutlined} from '@ant-design/icons';
import {useState} from 'react';
import type {ValidateErrorEntity} from 'rc-field-form/lib/interface';
import {signIn} from 'next-auth/react';
import {useRouter} from 'next/navigation';

const {Title, Text} = Typography;

interface LoginFormValues {
  username: string;
  password: string;
  scope: string;
  realmHeaderName: string;
  realmHeaderValue: string;
}

export default function Page() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [realmHeaderName, setRealmHeaderName] = useState('Polaris-Realm');
  const [realmHeaderValue, setRealmHeaderValue] = useState('POLARIS');
  const router = useRouter();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const result = await signIn('polaris-credentials', {
        client_id: values.username,
        client_secret: values.password,
        scope: values.scope,
        realmHeaderName,
        realmHeaderValue,
        redirect: false,
      });

      if (result?.error) {
        message.error(result.error || 'Authentication failed');
      } else if (result?.ok) {
        message.success('Authentication successful!');
        router.push('/');
      } else {
        message.error('Authentication failed');
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

  const onKeycloakPasswordFinish = async (values: LoginFormValues) => {
    setLoading(true);

    try {
      const result = await signIn('keycloak-password', {
        username: values.username,
        password: values.password,
        realmHeaderName,
        realmHeaderValue,
        redirect: false,
      });

      if (result?.error) {
        message.error(result.error || 'Keycloak authentication failed');
      } else if (result?.ok) {
        message.success('Authentication successful!');
        router.push('/');
      } else {
        message.error('Keycloak authentication failed');
      }
    } catch (error) {
      console.error('Keycloak authentication error:', error);
      message.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Flex justify="center" align="center" style={{minHeight: '100vh'}}>
        <Card style={{minWidth: 450}}>
          <Flex justify="center" align="center" vertical style={{marginBottom: 24}}>
            <Title level={2}>Authentication</Title>
            <Text type="secondary">Sign in to Polaris</Text>
          </Flex>

          {/* Common Polaris Realm field for both auth types */}
          <div style={{marginBottom: 24}}>
            <div style={{marginBottom: 8, fontWeight: 500}}>Polaris Realm</div>
            <Space.Compact style={{display: 'flex', width: '100%'}}>
              <Input
                  placeholder="Header name"
                  value={realmHeaderName}
                  onChange={(e) => setRealmHeaderName(e.target.value)}
                  style={{flex: 1}}
              />
              <Input
                  placeholder="Header value"
                  value={realmHeaderValue}
                  onChange={(e) => setRealmHeaderValue(e.target.value)}
                  style={{flex: 1}}
              />
            </Space.Compact>
          </div>

          <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'credentials',
                  label: 'Polaris Credentials',
                  children: (
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
                  ),
                },
                {
                  key: 'keycloak-password',
                  label: 'Keycloak',
                  children: (
                      <Form
                          name="keycloak-password-login"
                          onFinish={onKeycloakPasswordFinish}
                          onFinishFailed={onFinishFailed}
                          autoComplete="off"
                          layout="vertical"
                          initialValues={{
                            username: "root",
                            password: "password",
                          }}
                      >
                        <Form.Item
                            label="Username"
                            name="username"
                            rules={[
                              {
                                required: true,
                                message: 'Please input your username!'
                              }
                            ]}
                        >
                          <Input
                              prefix={<UserOutlined/>}
                              placeholder="Enter your username"
                          />
                        </Form.Item>

                        <Form.Item
                            label="Password"
                            name="password"
                            rules={[
                              {
                                required: true,
                                message: 'Please input your password!'
                              }
                            ]}
                        >
                          <Input.Password
                              prefix={<LockOutlined/>}
                              placeholder="Enter your password"
                          />
                        </Form.Item>

                        <Form.Item>
                          <Button
                              type="primary"
                              htmlType="submit"
                              loading={loading}
                              style={{width: '100%'}}
                              size="large"
                          >
                            Sign in with Keycloak
                          </Button>
                        </Form.Item>
                      </Form>
                  ),
                },
              ]}
          />
        </Card>
      </Flex>
  );
}