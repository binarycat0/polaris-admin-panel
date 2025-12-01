'use client'

import {usePathname, useRouter} from 'next/navigation';
import {Layout, Menu, type MenuProps} from 'antd';
import {
  FolderOpenOutlined,
  HomeOutlined,
  LoginOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import {useSession} from 'next-auth/react';
import {isSessionValid} from '@/utils/authNextAuth';

const {Sider} = Layout;

type MenuItem = Required<MenuProps>['items'][number];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const isAuthenticated = status === 'authenticated' && isSessionValid(session);

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

  const menuItems: MenuItem[] = [
    {
      key: 'home',
      icon: <HomeOutlined/>,
      label: 'Home',
    },
    ...(!isAuthenticated ? [
      {
        key: 'signin',
        icon: <LoginOutlined/>,
        label: 'Sign In',
      },
    ] : []),
    ...(isAuthenticated ? [
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
        type: 'divider' as const,
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
