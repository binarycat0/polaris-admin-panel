
'use client'

import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import { useAuthenticatedFetch } from '@/hooks/useAuthenticatedFetch';
import styles from './page.module.css';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const { authenticatedFetch } = useAuthenticatedFetch();

  useEffect(() => {
    // Simulate loading for now - you can add actual API calls here
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large"/>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>
          Principals
        </h1>

        <div className={styles.placeholder}>
          <h3 className={styles.placeholderTitle}>
            Principals Management
          </h3>
          <p className={styles.placeholderText}>
            Principal management functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}