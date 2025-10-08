'use client'

import {useCallback, useEffect, useState} from 'react';
import {Spin} from 'antd';
import styles from './page.module.css';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import Principals, {Principal} from '@/app/ui/principals';
import PrincipalRolesModal, {PrincipalRoleItem} from '@/app/ui/principal-roles-modal';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrincipalName, setSelectedPrincipalName] = useState<string | null>(null);
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRoleItem[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
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

  const getPrincipalRoles = useCallback(async (principalName: string): Promise<PrincipalRoleItem[]> => {
    try {
      const data = await authenticatedFetch(`/api/principals/${encodeURIComponent(principalName)}/principal-roles`);

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

  const handleViewRoles = async (principalName: string) => {
    setSelectedPrincipalName(principalName);
    setModalVisible(true);
    setRolesLoading(true);
    setPrincipalRoles([]);

    try {
      const roles = await getPrincipalRoles(principalName);
      setPrincipalRoles(roles);
    } finally {
      setRolesLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPrincipalName(null);
    setPrincipalRoles([]);
  };

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

          <Principals
            principals={principals}
            loading={loading}
            onViewRoles={handleViewRoles}
          />

          <PrincipalRolesModal
            visible={modalVisible}
            principalName={selectedPrincipalName}
            roles={principalRoles}
            loading={rolesLoading}
            onClose={handleCloseModal}
          />
        </div>
      </div>
  );
}