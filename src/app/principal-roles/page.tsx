'use client'

import {useCallback, useEffect, useState} from 'react';
import {Spin} from 'antd';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import PrincipalRolesList, {PrincipalItem, PrincipalRoleItem} from '@/app/ui/principal-roles-list';

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRoleItem[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(() => {
    // Restore expanded principal role from localStorage on initial load
    if (typeof window !== 'undefined') {
      const savedPrincipalRole = localStorage.getItem('expanded_principal_role');
      return savedPrincipalRole ? [savedPrincipalRole] : [];
    }
    return [];
  });
  const [principals, setPrincipals] = useState<Record<string, PrincipalItem[]>>({});
  const [principalsLoading, setPrincipalsLoading] = useState<Record<string, boolean>>({});
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

  const handleRowClick = async (principalRoleName: string) => {
    // Toggle expansion
    const isExpanded = expandedRowKeys.includes(principalRoleName);

    if (isExpanded) {
      // Collapse the row
      setExpandedRowKeys([]);
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('expanded_principal_role');
      }
    } else {
      // Expand the row (only one row at a time)
      setExpandedRowKeys([principalRoleName]);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('expanded_principal_role', principalRoleName);
      }

      // Load principals if not already loaded
      if (!principals[principalRoleName]) {
        setPrincipalsLoading(prev => ({...prev, [principalRoleName]: true}));

        try {
          const principalsData = await getPrincipals(principalRoleName);
          setPrincipals(prev => ({...prev, [principalRoleName]: principalsData}));
        } finally {
          setPrincipalsLoading(prev => ({...prev, [principalRoleName]: false}));
        }
      }
    }
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

  // Restore state from localStorage when principal roles are loaded
  useEffect(() => {
    const restoreState = async () => {
      if (principalRoles.length === 0 || loading) return;

      const savedPrincipalRole = expandedRowKeys[0];

      // Restore principals if a principal role was expanded
      if (savedPrincipalRole && !principals[savedPrincipalRole]) {
        setPrincipalsLoading(prev => ({...prev, [savedPrincipalRole]: true}));
        try {
          const principalsData = await getPrincipals(savedPrincipalRole);
          setPrincipals(prev => ({...prev, [savedPrincipalRole]: principalsData}));
        } finally {
          setPrincipalsLoading(prev => ({...prev, [savedPrincipalRole]: false}));
        }
      }
    };

    restoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [principalRoles.length, loading]);

  if (loading) {
    return <Spin size="large"/>;
  }

  return (
      <PrincipalRolesList
          roles={principalRoles}
          loading={loading}
          onRowClick={handleRowClick}
          expandedRowKeys={expandedRowKeys}
          principals={principals}
          principalsLoading={principalsLoading}
      />
  );
}