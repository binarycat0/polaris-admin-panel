'use client'

import {Button, Flex, Space, Typography} from 'antd';
import {useEffect, useState} from "react";
import {type AuthStatus, checkAuthStatus} from "@/utils/auth";

const {Title} = Typography;

export default function Home() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isAuthenticated: false,
    isExpired: false
  });

  useEffect(() => {
    // Check authentication status when component mounts
    const status = checkAuthStatus();
    setAuthStatus(status);

    // Also check when the page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const newStatus = checkAuthStatus();
        setAuthStatus(newStatus);
      }
    };

    // Check when window gains focus (user returns from signin page)
    const handleFocus = () => {
      const newStatus = checkAuthStatus();
      setAuthStatus(newStatus);
    };

    const handleAuthStateChange = () => {
      const newStatus = checkAuthStatus();
      setAuthStatus(newStatus);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('auth-state-changed', handleAuthStateChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, []);

  return (
      <Flex id="home-page" justify="center" align="center" style={{height: '100%'}}>
        <Space direction="vertical" align="center">
          <Title level={1}>Apache Polaris Management Panel</Title>
          {
              !authStatus.isAuthenticated && (
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
