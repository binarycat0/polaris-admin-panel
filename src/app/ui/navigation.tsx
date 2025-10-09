'use client'

import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Layout, Menu} from 'antd';
import {
  DatabaseOutlined,
  HomeOutlined,
  LoginOutlined,
  TagsFilled,
  TeamOutlined
} from '@ant-design/icons';
import {type AuthStatus, checkAuthStatus} from '@/utils/auth';

const {Sider} = Layout;

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

  const getSelectedKey = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/signin') return 'login';
    if (pathname === '/catalogs') return 'catalogs';
    if (pathname === '/principals') return 'principals';
    if (pathname === '/principal-roles') return 'principal-roles';
    return 'home';
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
      case 'principals':
        router.push('/principals');
        break;
      case 'principal-roles':
        router.push('/principal-roles');
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
    ...(authStatus.isAuthenticated && !authStatus.isExpired ? [
      {
        key: 'catalogs',
        icon: <DatabaseOutlined/>,
        label: 'Catalogs',
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
      <Sider className="left-side-panel-sider" width="250">
        <Menu
            className="left-side-panel-menu"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            onClick={handleMenuClick}
        />
      </Sider>
  );
}
