'use client'

import {Button, Flex, Layout, Space} from 'antd';
import {LogoutOutlined} from '@ant-design/icons';
import Navigation from './navigation';
import {useRouter} from 'next/navigation';
import {AuthStatus, checkAuthStatus, clearAuthData} from "@/utils/auth";
import {useEffect, useState} from 'react';

const {Content, Header} = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({children}: LayoutWrapperProps) {
  const router = useRouter();

  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    isExpired: false
  });

  const [realmInfo, setRealmInfo] = useState<{
    headerName: string | null;
    headerValue: string | null;
  }>({
    headerName: null,
    headerValue: null
  });

  useEffect(() => {
    const status = checkAuthStatus();
    setAuthStatus(status);

    const updateRealmInfo = () => {
      if (typeof window !== 'undefined') {
        const headerName = localStorage.getItem('realm_header_name');
        const headerValue = localStorage.getItem('realm_header_value');
        setRealmInfo({
          headerName,
          headerValue
        });
      }
    };

    updateRealmInfo();

    const handleAuthStateChange = () => {
      const newStatus = checkAuthStatus();
      setAuthStatus(newStatus);
      updateRealmInfo();
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange);

    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []);

  const isAuthenticated = authStatus.isAuthenticated && !authStatus.isExpired;

  const realmText = isAuthenticated
      ? `${realmInfo.headerName}: ${realmInfo.headerValue}`
      : 'Polaris Realm: POLARIS';

  const handleSignOut = () => {
    clearAuthData();

    setAuthStatus({
      isAuthenticated: false,
      isExpired: false
    });
    setRealmInfo({
      headerName: null,
      headerValue: null
    });
    router.push('/');
  };

  return (
      <Layout>
        <Header className="header-panel">
          <Flex justify="flex-start" align="center">
            <div className="header-panel-demo-logo"/>
          </Flex>
          <Flex justify="flex-end" align="center">
            {isAuthenticated && (
                <Space style={{color: '#ffffff90'}}>
                  {realmText}
                  <Button ghost onClick={handleSignOut}>
                    Sign Out <LogoutOutlined/>
                  </Button>
                </Space>
            )}
          </Flex>
        </Header>
        <Layout>
          <Navigation/>
          <Layout>
            <Content className="content-panel">
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
  );
}
