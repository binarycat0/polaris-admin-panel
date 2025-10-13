'use client'

import {usePathname, useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';
import {Layout, Menu} from 'antd';
import {
  FolderOpenOutlined,
  HomeOutlined,
  LoginOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined
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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' || e.key === null) {
        const newStatus = checkAuthStatus();
        setAuthStatus(newStatus);
        updateRealmInfo();
      }
    };

    const handleAuthStateChange = () => {
      const newStatus = checkAuthStatus();
      setAuthStatus(newStatus);
      updateRealmInfo();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-state-changed', handleAuthStateChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []);

  const getSelectedKey = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/signin') return 'login';
    if (pathname === '/catalogs') return 'catalogs';
    if (pathname === '/principals') return 'principals';
    if (pathname === '/principal-roles') return 'principal-roles';
    if (pathname === '/privileges') return 'privileges';
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
      case 'privileges':
        router.push('/privileges');
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
        icon: <FolderOpenOutlined/>,
        label: 'Catalogs',
      },
      {
        key: 'principals',
        icon: <UserOutlined/>,
        label: 'Principals',
      },
      {
        key: 'principal-roles',
        icon: <TeamOutlined/>,
        label: 'Principal Roles',
      },
      {
        type: 'divider',
      },
      {
        key: 'privileges',
        icon: <SafetyOutlined/>,
        label: 'Privileges',
      },
    ] : []),
  ];

  return (
      <Sider className="left-side-panel-sider" width="250">
        <Menu className="left-side-panel-menu"
            mode="inline"
            items={menuItems}
            selectedKeys={[getSelectedKey()]}
            onClick={handleMenuClick}
        />
      </Sider>
  );
}
