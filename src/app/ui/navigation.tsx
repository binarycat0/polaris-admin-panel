'use client'

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Layout, Menu, Typography, message } from 'antd';
import { DatabaseOutlined, TeamOutlined, HomeOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { checkAuthStatus, clearAuthData, type AuthStatus } from '@/utils/auth';

const { Sider } = Layout;
const { Title } = Typography;

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    isExpired: false
  });

  useEffect(() => {
    const status = checkAuthStatus();
    setAuthStatus(status);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const newStatus = checkAuthStatus();
        setAuthStatus(newStatus);
      }
    };

    const handleFocus = () => {
      const newStatus = checkAuthStatus();
      setAuthStatus(newStatus);
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
    if (pathname === '/principals') return 'principals';
    return 'home';
  };

  const handleSignOut = () => {
    clearAuthData();
    // Update auth status immediately after clearing data
    setAuthStatus({
      isAuthenticated: false,
      isExpired: false
    });
    message.success('Successfully signed out');
    router.push('/');
  };

  const handleMenuClick = ({ key }: { key: string }) => {
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
      case 'principals':
        router.push('/principals');
        break;
      case 'signout':
        handleSignOut();
        break;
    }
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    ...(!authStatus.isAuthenticated || authStatus.isExpired ? [
      {
        key: 'signin',
        icon: <LoginOutlined />,
        label: 'Sign In',
      },
    ] : []),
    // Show main navigation when authenticated and not expired
    ...(authStatus.isAuthenticated && !authStatus.isExpired ? [
      {
        key: 'catalogs',
        icon: <DatabaseOutlined />,
        label: 'Catalogs',
      },
      {
        key: 'principals',
        icon: <TeamOutlined />,
        label: 'Principals',
      },
    ] : []),
  ];

  return (
    <Sider
      width={250}
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
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            Polaris Admin
          </Title>
        </Link>
      </div>

      {/* Main navigation menu */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </div>

      {/* SignOut button at the bottom - only show when authenticated */}
      {authStatus.isAuthenticated && !authStatus.isExpired && (
        <div style={{ marginTop: 'auto' }}>
          <Menu
            theme="dark"
            mode="inline"
            items={[
              {
                key: 'signout',
                icon: <LogoutOutlined />,
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
