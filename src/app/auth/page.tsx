
'use client'

import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title } = Typography;

interface LoginFormValues {
  username: string; // client_id
  password: string; // client_secret
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
      // Prepare OAuth2 client credentials request
      const requestBody = {
        client_id: values.username,
        client_secret: values.password,
        scope: "PRINCIPAL_ROLE:ALL" // Polaris requires a scope parameter
      };

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const tokenData: OAuthTokenResponse = await response.json();

        // Store the access token (you might want to use a more secure storage method)
        localStorage.setItem('access_token', tokenData.access_token);
        localStorage.setItem('token_type', tokenData.token_type);

        if (tokenData.expires_in) {
          const expiresAt = Date.now() + (tokenData.expires_in * 1000);
          localStorage.setItem('token_expires_at', expiresAt.toString());
        }

        message.success('Authentication successful!');

        // Redirect to catalog page or dashboard
        window.location.href = '/catalog';

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

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>Polaris Authentication</Title>
          <p style={{ color: '#666', marginTop: 8 }}>
            Enter your OAuth2 client credentials
          </p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
          initialValues={{
            username: "root",
            password: "s3cr3t"
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
              prefix={<UserOutlined />}
              placeholder="Enter your OAuth2 client ID"
              size="large"
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
              prefix={<LockOutlined />}
              placeholder="Enter your OAuth2 client secret"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              Authenticate
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}