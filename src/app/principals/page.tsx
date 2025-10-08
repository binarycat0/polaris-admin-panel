'use client'

import {useCallback, useEffect, useState} from 'react';
import {Spin} from 'antd';
import styles from './page.module.css';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import Principals, {Principal} from '@/app/ui/principals';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getPrincipals = useCallback(async (): Promise<Principal[]> => {
    try {
      const data = await authenticatedFetch('/api/principals');

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Principals API Response:', data);

      // Handle the response structure { principals: [...] }
      if (data && typeof data === 'object' && 'principals' in data && Array.isArray((data as { principals: unknown }).principals)) {
        return (data as { principals: Principal[] }).principals;
      } else {
        console.error('Unexpected principals response structure:', data);
        return [];
      }
    } catch {
      // Error handling is done in authenticatedFetch
      return [];
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    async function fetchPrincipals() {
      setLoading(true);
      try {
        const principalsData = await getPrincipals();
        setPrincipals(principalsData);
      } finally {
        setLoading(false);
      }
    }

    fetchPrincipals();
  }, [getPrincipals]);

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

          <Principals principals={principals} loading={loading} />
        </div>
      </div>
  );
}