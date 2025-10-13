'use client'

import {useCallback, useEffect, useState} from 'react';
import {Button, Flex, message, Space, Spin, Typography} from 'antd';
import {TeamOutlined, UsergroupAddOutlined} from '@ant-design/icons';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import PrincipalRolesList, {PrincipalItem, PrincipalRoleItem} from '@/app/ui/principal-roles-list';
import CreatePrincipalRoleModal from '@/app/ui/create-principal-role-modal';

const {Title} = Typography;

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRoleItem[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPrincipalRole = localStorage.getItem('expanded_principal_role');
      return savedPrincipalRole ? [savedPrincipalRole] : [];
    }
    return [];
  });
  const [principals, setPrincipals] = useState<Record<string, PrincipalItem[]>>({});
  const [principalsLoading, setPrincipalsLoading] = useState<Record<string, boolean>>({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getPrincipalRoles = useCallback(async (): Promise<PrincipalRoleItem[]> => {
    try {
      const data = await authenticatedFetch('/api/principal-roles');

      if (!data) {
        return [];
      }

      console.log('Principal Roles API Response:', data);

      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as {
        roles: unknown
      }).roles)) {
        return (data as { roles: PrincipalRoleItem[] }).roles;
      } else {
        console.error('Unexpected principal roles response structure:', data);
        return [];
      }
    } catch {
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

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const rolesData = await getPrincipalRoles();
      setPrincipalRoles(rolesData);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrincipalRole = async (principalRoleName: string) => {
    try {
      await authenticatedFetch(`/api/principal-roles/${encodeURIComponent(principalRoleName)}`, {
        method: 'DELETE',
      });

      message.success(`Principal role "${principalRoleName}" deleted successfully!`);
      await handleRefresh();
    } catch (error) {
      console.error('Error deleting principal role:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleDeletePrincipal = async (principalRoleName: string, principalName: string) => {
    try {
      await authenticatedFetch(
          `/api/principal-role-principals/${encodeURIComponent(principalRoleName)}/${encodeURIComponent(principalName)}`,
          {
            method: 'DELETE',
          }
      );

      message.success(`Principal "${principalName}" removed from role "${principalRoleName}" successfully!`);

      // Refresh the principals list for this role
      const principalsData = await getPrincipals(principalRoleName);
      setPrincipals(prev => ({...prev, [principalRoleName]: principalsData}));
    } catch (error) {
      console.error('Error removing principal from role:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleCreateSuccess = async () => {
    await handleRefresh();
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
      <Space direction="vertical" style={{width: '100%'}}>
        <Title level={4} style={{ marginBottom: '0px' }}>
          <Space>
            Principal Roles
            <TeamOutlined/>
          </Space>
        </Title>
        <Button
            variant="outlined"
            icon={<UsergroupAddOutlined/>}
            onClick={() => setCreateModalVisible(true)}
        >
          New principal role
        </Button>

        <PrincipalRolesList
            roles={principalRoles}
            loading={loading}
            onRowClick={handleRowClick}
            expandedRowKeys={expandedRowKeys}
            principals={principals}
            principalsLoading={principalsLoading}
            onDelete={handleDeletePrincipalRole}
            onDeletePrincipal={handleDeletePrincipal}
        />

        <CreatePrincipalRoleModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onSuccess={handleCreateSuccess}
        />
      </Space>
  );
}