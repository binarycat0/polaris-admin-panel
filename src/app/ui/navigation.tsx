'use client'

import {blue} from '@ant-design/colors';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Layout, Menu, message, Typography} from 'antd';
import {
  DatabaseFilled,
  DatabaseOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  TagsFilled,
  TeamOutlined
} from '@ant-design/icons';
import {type AuthStatus, checkAuthStatus, clearAuthData} from '@/utils/auth';

const {Sider} = Layout;
const {Title, Text} = Typography;

export default function Navigation() {
  const pathname = usePathname();
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

    // Get realm information from localStorage
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

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const newStatus = checkAuthStatus();
        setAuthStatus(newStatus);
        updateRealmInfo();
      }
    };

    const handleFocus = () => {
      const newStatus = checkAuthStatus();
      setAuthStatus(newStatus);
      updateRealmInfo();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);


  // Get current selected key based on pathname
  const getSelectedKey = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/signin') return 'login';
    if (pathname === '/catalogs') return 'catalogs';
    if (pathname === '/catalog-roles') return 'catalog-roles';
    if (pathname === '/principals') return 'principals';
    if (pathname === '/principal-roles') return 'principal-roles';
    return 'home';
  };

  const handleSignOut = () => {
    clearAuthData();
    // Update auth status immediately after clearing data
    setAuthStatus({
      isAuthenticated: false,
      isExpired: false
    });
    setRealmInfo({
      headerName: null,
      headerValue: null
    });
    message.success('Successfully signed out');
    router.push('/');
  };

  const handleMenuClick = ({key}: { key: string }) => {
    switch (key) {
      case 'home':
        router.push('/');
        break;
      case 'signin':
        router.push('/signin');
        break;
      case 'catalogs':
        router.push('/catalogs');
        break;
      case 'catalog-roles':
        router.push('/catalog-roles');
        break;
      case 'principals':
        router.push('/principals');
        break;
      case 'principal-roles':
        router.push('/principal-roles');
        break;
      case 'signout':
        handleSignOut();
        break;
    }
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined/>,
      label: 'Home',
    },
    ...(!authStatus.isAuthenticated || authStatus.isExpired ? [
      {
        key: 'signin',
        icon: <LoginOutlined/>,
        label: 'Sign In',
      },
    ] : []),
    // Show main navigation when authenticated and not expired
    ...(authStatus.isAuthenticated && !authStatus.isExpired ? [
      {
        key: 'catalogs',
        icon: <DatabaseOutlined/>,
        label: 'Catalogs',
      },
      {
        key: 'catalog-roles',
        icon: <DatabaseFilled/>,
        label: 'Catalog Roles',
      },
      {
        key: 'principals',
        icon: <TeamOutlined/>,
        label: 'Principals',
      },
      {
        key: 'principal-roles',
        icon: <TagsFilled/>,
        label: 'Principal Roles',
      },
    ] : []),
  ];

  return (
      <Sider
          width="250"
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
          theme="dark"
      >
        <div style={{padding: '16px', textAlign: 'center', height: '64px'}}>
          <Link href="/" style={{textDecoration: 'none'}}>
            <Title level={4} style={{color: blue[1], margin: 0}}>
              Polaris Catalog Admin
            </Title>
          </Link>
        </div>

        <div style={{flex: 1, overflow: 'auto'}}>
          <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[getSelectedKey()]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{borderRight: 0}}
          />
        </div>

        {authStatus.isAuthenticated && !authStatus.isExpired && (
            <div style={{marginTop: 'auto'}}>
              <Menu
                  theme="dark"
                  mode="inline"
                  items={[
                    {
                      key: 'signout',
                      icon: <LogoutOutlined/>,
                      label: 'Sign Out',
                    }
                  ]}
                  onClick={handleMenuClick}
                  style={{
                    borderRight: 0,
                    borderTop: '1px solid #434343',
                    margin: 0
                  }}
              />
            </div>
        )}
      </Sider>
  );
}
