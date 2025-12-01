'use client'

import {Button, Flex, Layout, Typography} from 'antd';
import {LogoutOutlined} from '@ant-design/icons';
import Navigation from './Navigation';
import {useRouter} from 'next/navigation';
import {useSession, signOut} from 'next-auth/react';
import {getRealmInfoFromSession, isSessionValid} from '@/utils/authNextAuth';

const {Content, Header} = Layout;
const {Text} = Typography;

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({children}: LayoutWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated' && isSessionValid(session);
  const realmInfo = getRealmInfoFromSession(session);

  const realmText = isAuthenticated && realmInfo.headerName && realmInfo.headerValue
      ? `${realmInfo.headerName}: ${realmInfo.headerValue}`
      : 'Polaris Realm: POLARIS';

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
      <Layout>
        <Header className="header-panel">
          <Flex justify="flex-start" align="center">
            <div className="header-panel-demo-logo"/>
          </Flex>
          <Flex justify="space-between" align="center" style={{width: '100%'}}>
            {isAuthenticated && (
                <>
                  <Text style={{color: '#ffffff90'}}>
                    {realmText}
                  </Text>
                  <Button ghost onClick={handleSignOut}>
                    Sign Out <LogoutOutlined/>
                  </Button>
                </>
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
