'use client'

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {checkAuthStatus, type AuthStatus} from '@/utils/auth';
import styles from './navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();
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

  // Don't show navigation on auth page
  if (pathname === '/auth') {
    return null;
  }

  return (
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          {/* Logo/Brand */}
          <Link href="/" className={styles.brand}>
            Polaris Admin
          </Link>

          {/* Navigation Links */}
          {authStatus.isAuthenticated && (
              <div className={styles.navLinks}>
                <Link
                    href="/catalogs"
                    className={`${styles.navLink} ${pathname === '/catalogs' ? styles.active : ''}`}
                >
                  Catalogs
                </Link>

                <Link
                    href="/principals"
                    className={`${styles.navLink} ${pathname === '/principals' ? styles.active : ''}`}
                >
                  Principals
                </Link>
              </div>
          )}
        </div>
      </nav>
  );
}
