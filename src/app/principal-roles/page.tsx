'use client'

import {useCallback, useEffect, useState} from 'react';
import {Spin} from 'antd';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import PrincipalRolesList, {PrincipalRoleItem} from '@/app/ui/principal-roles-list';
import PrincipalsModal, {PrincipalItem} from '@/app/ui/principals-modal';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRoleItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPrincipalRoleName, setSelectedPrincipalRoleName] = useState<string | null>(null);
  const [principals, setPrincipals] = useState<PrincipalItem[]>([]);
  const [principalsLoading, setPrincipalsLoading] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getPrincipalRoles = useCallback(async (): Promise<PrincipalRoleItem[]> => {
    try {
      const data = await authenticatedFetch('/api/principal-roles');

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Principal Roles API Response:', data);

      // Handle the response structure { roles: [...] }
      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as {
        roles: unknown
      }).roles)) {
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

  const getPrincipals = useCallback(async (principalRoleName: string): Promise<PrincipalItem[]> => {
    try {
      const data = await authenticatedFetch(`/api/principal-role-principals/${encodeURIComponent(principalRoleName)}`);

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Principals API Response:', data);

      // Handle the response structure { principals: [...] }
      if (data && typeof data === 'object' && 'principals' in data && Array.isArray((data as {
        principals: unknown
      }).principals)) {
        return (data as { principals: PrincipalItem[] }).principals;
      } else {
        console.error('Unexpected principals response structure:', data);
        return [];
      }
    } catch {
      // Error handling is done in authenticatedFetch
      return [];
    }
  }, [authenticatedFetch]);

  const handleViewPrincipals = async (principalRoleName: string) => {
    setSelectedPrincipalRoleName(principalRoleName);
    setModalVisible(true);
    setPrincipalsLoading(true);
    setPrincipals([]);

    try {
      const principalsData = await getPrincipals(principalRoleName);
      setPrincipals(principalsData);
    } finally {
      setPrincipalsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedPrincipalRoleName(null);
    setPrincipals([]);
  };

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
    return <Spin size="large"/>;
  }

  return (
      <>
        <PrincipalRolesList
            roles={principalRoles}
            loading={loading}
            onViewPrincipals={handleViewPrincipals}
        />

        <PrincipalsModal
            visible={modalVisible}
            principalRoleName={selectedPrincipalRoleName}
            principals={principals}
            loading={principalsLoading}
            onClose={handleCloseModal}
        />
      </>
  );
}