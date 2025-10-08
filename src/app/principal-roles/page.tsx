'use client'

import {useCallback, useEffect, useState} from 'react';
import {Spin} from 'antd';
import styles from './page.module.css';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import PrincipalRolesList, {PrincipalRoleItem} from '@/app/ui/principal-roles-list';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRoleItem[]>([]);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getPrincipalRoles = useCallback(async (): Promise<PrincipalRoleItem[]> => {
    try {
      const data = await authenticatedFetch('/api/principal-roles');

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Principal Roles API Response:', data);

      // Handle the response structure { roles: [...] }
      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as { roles: unknown }).roles)) {
        return (data as { roles: PrincipalRoleItem[] }).roles;
      } else {
        console.error('Unexpected principal roles response structure:', data);
        return [];
      }
    } catch {
      // Error handling is done in authenticatedFetch
      return [];
    }
  }, [authenticatedFetch]);

  useEffect(() => {
    async function fetchPrincipalRoles() {
      setLoading(true);
      try {
        const rolesData = await getPrincipalRoles();
        setPrincipalRoles(rolesData);
      } finally {
        setLoading(false);
      }
    }

    fetchPrincipalRoles();
  }, [getPrincipalRoles]);

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
            Principal Roles
          </h1>

          <PrincipalRolesList roles={principalRoles} loading={loading} />
        </div>
      </div>
  );
}