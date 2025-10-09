'use client'

import {useEffect, useState} from "react";
import styles from "./page.module.css";
import {type AuthStatus, checkAuthStatus} from "@/utils/auth";
import Link from 'next/link';

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
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              Apache Polaris Management Panel
            </h1>
            <p className={styles.subtitle}>
              Manage your Apache Polaris Instance
            </p>

            {
                !authStatus.isAuthenticated && (
                    <p className={styles.authSuccess}>
                      Please <Link href="/signin"
                                   className={styles.authLink}><b>Sign in</b></Link> to continue.
                    </p>
                )
            }
          </div>
        </main>
      </div>
  );
}
