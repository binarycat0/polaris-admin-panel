'use client'

import {Button, Flex, Space, Typography} from 'antd';
import {useSession} from 'next-auth/react';
import {isSessionValid} from '@/utils/authNextAuth';

const {Title} = Typography;

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated' && isSessionValid(session);

  return (
      <Flex id="home-page" justify="space-around" align="center" style={{height: '100%'}}>
        <Space direction="vertical" align="center">
          <Title level={1}>Apache Polaris Management Panel</Title>
          {
              !isAuthenticated && (
                  <Space wrap>
                    Please
                    <Button shape="circle" size="large" type="link" href="/signin">Sign in</Button>
                    to continue.
                  </Space>
              )
          }
        </Space>
      </Flex>
  );
}
