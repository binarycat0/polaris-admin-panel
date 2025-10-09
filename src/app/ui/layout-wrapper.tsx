'use client'

import {Button, Flex, Layout, Typography} from 'antd';
import {LogoutOutlined} from '@ant-design/icons';
import Navigation from './navigation';
import {useRouter} from 'next/navigation';
import {AuthStatus, checkAuthStatus, clearAuthData} from "@/utils/auth";
import {useEffect, useState} from 'react';

const {Content, Header} = Layout;
const {Text} = Typography;

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
          <Flex justify="flex-start" align="middle">
            <div className="header-panel-demo-logo"/>
          </Flex>
          <Flex justify="flex-end" align="middle">
            {isAuthenticated && (
                <div style={{color: "white"}}>
                  <Text type="secondary" color="white">{realmText}</Text>
                  <Button type="text" size="middle" onClick={handleSignOut}>Sign
                    Out <LogoutOutlined/></Button>
                </div>
            )}
          </Flex>
        </Header>
        <Layout>
          <Navigation/>
          <Layout>
            <Content>
              {children}
            </Content>
          </Layout>
        </Layout>
      </Layout>
  );
}
