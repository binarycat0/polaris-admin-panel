'use client'

import { Layout } from 'antd';
import Navigation from './navigation';

const { Content } = Layout;

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation />
      <Layout style={{ marginLeft: 250 }}>
        <Content style={{ overflow: 'initial' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
