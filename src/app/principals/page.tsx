'use client'

import {useCallback, useEffect, useState} from 'react';
import {Spin} from 'antd';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import Principals, {Principal, PrincipalRoleItem} from '@/app/ui/principals';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(() => {
    // Restore expanded principal from localStorage on initial load
    if (typeof window !== 'undefined') {
      const savedPrincipal = localStorage.getItem('expanded_principal');
      return savedPrincipal ? [savedPrincipal] : [];
    }
    return [];
  });
  const [principalRoles, setPrincipalRoles] = useState<Record<string, PrincipalRoleItem[]>>({});
  const [rolesLoading, setRolesLoading] = useState<Record<string, boolean>>({});
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getPrincipals = useCallback(async (): Promise<Principal[]> => {
    try {
      const data = await authenticatedFetch('/api/principals');

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Principals API Response:', data);

      // Handle the response structure { principals: [...] }
      if (data && typeof data === 'object' && 'principals' in data && Array.isArray((data as {
        principals: unknown
      }).principals)) {
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

  const handleRowClick = async (principalName: string) => {
    // Toggle expansion
    const isExpanded = expandedRowKeys.includes(principalName);

    if (isExpanded) {
      // Collapse the row
      setExpandedRowKeys([]);
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('expanded_principal');
      }
    } else {
      // Expand the row (only one row at a time)
      setExpandedRowKeys([principalName]);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('expanded_principal', principalName);
      }

      // Load roles if not already loaded
      if (!principalRoles[principalName]) {
        setRolesLoading(prev => ({...prev, [principalName]: true}));

        try {
          const roles = await getPrincipalRoles(principalName);
          setPrincipalRoles(prev => ({...prev, [principalName]: roles}));
        } finally {
          setRolesLoading(prev => ({...prev, [principalName]: false}));
        }
      }
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const principalsData = await getPrincipals();
      setPrincipals(principalsData);
    } finally {
      setLoading(false);
    }
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

  // Restore state from localStorage when principals are loaded
  useEffect(() => {
    const restoreState = async () => {
      if (principals.length === 0 || loading) return;

      const savedPrincipal = expandedRowKeys[0];

      // Restore principal roles if a principal was expanded
      if (savedPrincipal && !principalRoles[savedPrincipal]) {
        setRolesLoading(prev => ({...prev, [savedPrincipal]: true}));
        try {
          const roles = await getPrincipalRoles(savedPrincipal);
          setPrincipalRoles(prev => ({...prev, [savedPrincipal]: roles}));
        } finally {
          setRolesLoading(prev => ({...prev, [savedPrincipal]: false}));
        }
      }
    };

    restoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principals.length, loading]);

  if (loading) {
    return (
        <Spin size="large"/>
    );
  }

  return (
      <Principals
          principals={principals}
          loading={loading}
          onRowClick={handleRowClick}
          onRefresh={handleRefresh}
          expandedRowKeys={expandedRowKeys}
          principalRoles={principalRoles}
          rolesLoading={rolesLoading}
      />
  );
}