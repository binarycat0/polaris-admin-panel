'use client'

import {Layout, Row, theme, Typography} from 'antd';
import Navigation from './navigation';
import {AuthStatus, checkAuthStatus} from "@/utils/auth";
import {useEffect, useState} from 'react';

const {Title, Text} = Typography;
const {Content, Header} = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({children}: LayoutWrapperProps) {
  const {
    token: {colorBgContainer, borderRadiusLG},
  } = theme.useToken();

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

  return (
      <Layout style={{minHeight: '100vh'}}>
        <Navigation/>
        <Layout style={{marginLeft: 250}}>
          <Header style={{
            position: 'sticky',
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            top: 0,
            zIndex: 1000
          }}>

            {authStatus.isAuthenticated && !authStatus.isExpired && (
                <Row align="middle">
                  <Title level={5} style={{marginLeft: 24}}>
                    {realmInfo.headerName && realmInfo.headerValue
                        ? `${realmInfo.headerName}: ${realmInfo.headerValue}`
                        : 'Polaris Realm'
                    }
                  </Title>
                </Row>
            )}

          </Header>
          <Content style={{overflow: 'initial'}}>
            {children}
          </Content>
        </Layout>
      </Layout>
  );
}
