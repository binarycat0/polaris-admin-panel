'use client'

import {useCallback, useEffect, useState} from 'react';
import {Button, Flex, message, Space, Spin, Typography} from 'antd';
import {UserAddOutlined, UserOutlined} from '@ant-design/icons';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import Principals, {Principal, PrincipalRoleItem} from '@/app/ui/principals';
import CreatePrincipalModal from '@/app/ui/create-principal-modal';
import AssignPrincipalRoleModal from '@/app/ui/assign-principal-role-modal';

const {Title} = Typography;

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPrincipal = localStorage.getItem('expanded_principal');
      return savedPrincipal ? [savedPrincipal] : [];
    }
    return [];
  });
  const [principalRoles, setPrincipalRoles] = useState<Record<string, PrincipalRoleItem[]>>({});
  const [rolesLoading, setRolesLoading] = useState<Record<string, boolean>>({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [assignRoleModalVisible, setAssignRoleModalVisible] = useState(false);
  const [selectedPrincipalForRole, setSelectedPrincipalForRole] = useState<string | null>(null);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getPrincipals = useCallback(async (): Promise<Principal[]> => {
    try {
      const data = await authenticatedFetch('/api/principals');

      if (!data) {
        return [];
      }

      console.log('Principals API Response:', data);

      if (data && typeof data === 'object' && 'principals' in data && Array.isArray((data as {
        principals: unknown
      }).principals)) {
        return (data as { principals: Principal[] }).principals;
      } else {
        console.error('Unexpected principals response structure:', data);
        return [];
      }
    } catch {
      return [];
    }
  }, [authenticatedFetch]);

  const getPrincipalRoles = useCallback(async (principalName: string): Promise<PrincipalRoleItem[]> => {
    try {
      const data = await authenticatedFetch(`/api/principals/${encodeURIComponent(principalName)}/principal-roles`);

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

  const handleRowClick = async (principalName: string) => {
    const isExpanded = expandedRowKeys.includes(principalName);

    if (isExpanded) {
      setExpandedRowKeys([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('expanded_principal');
      }
    } else {
      setExpandedRowKeys([principalName]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('expanded_principal', principalName);
      }

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

  const handleCreateSuccess = () => {
    handleRefresh();
  };

  const handleResetCredentials = async (principalName: string) => {
    console.log('Credentials reset for principal:', principalName);
    await handleRefresh();
  };

  const handleDeletePrincipal = async (principalName: string) => {
    try {
      await authenticatedFetch(`/api/principals/${encodeURIComponent(principalName)}`, {
        method: 'DELETE',
      });

      message.success(`Principal "${principalName}" deleted successfully!`);
      await handleRefresh();
    } catch (error) {
      console.error('Error deleting principal:', error);
      throw error; // Re-throw to let the modal handle the error display
    }
  };

  const handleAddRole = (principalName: string) => {
    setSelectedPrincipalForRole(principalName);
    setAssignRoleModalVisible(true);
  };

  const handleAssignRoleSuccess = async () => {
    if (selectedPrincipalForRole) {
      // Refresh the principal roles for the selected principal
      setRolesLoading(prev => ({...prev, [selectedPrincipalForRole]: true}));
      try {
        const roles = await getPrincipalRoles(selectedPrincipalForRole);
        setPrincipalRoles(prev => ({...prev, [selectedPrincipalForRole]: roles}));
      } finally {
        setRolesLoading(prev => ({...prev, [selectedPrincipalForRole]: false}));
      }
    }
  };

  const handleDeletePrincipalRole = async (principalName: string, roleName: string) => {
    try {
      await authenticatedFetch(
          `/api/principals/${encodeURIComponent(principalName)}/principal-roles/${encodeURIComponent(roleName)}`,
          {
            method: 'DELETE',
          }
      );

      message.success(`Role "${roleName}" removed from principal "${principalName}" successfully!`);

      // Refresh the principal roles for the selected principal
      setRolesLoading(prev => ({...prev, [principalName]: true}));
      try {
        const roles = await getPrincipalRoles(principalName);
        setPrincipalRoles(prev => ({...prev, [principalName]: roles}));
      } finally {
        setRolesLoading(prev => ({...prev, [principalName]: false}));
      }
    } catch (error) {
      console.error('Error removing principal role:', error);
      throw error; // Re-throw to let the modal handle the error display
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
      <Space direction="vertical" style={{width: '100%'}}>
        <Title level={4} style={{marginBottom: 0}}>
          <Space>
            Principals
            <UserOutlined/>
          </Space>
        </Title>
        <Button
            variant="outlined"
            icon={<UserAddOutlined/>}
            onClick={() => setCreateModalVisible(true)}
        >
          New principal
        </Button>

        <Principals
            principals={principals}
            loading={loading}
            onRowClick={handleRowClick}
            onRefresh={handleRefresh}
            expandedRowKeys={expandedRowKeys}
            principalRoles={principalRoles}
            rolesLoading={rolesLoading}
            onResetCredentials={handleResetCredentials}
            onDelete={handleDeletePrincipal}
            onAddRole={handleAddRole}
            onDeletePrincipalRole={handleDeletePrincipalRole}
        />

        <CreatePrincipalModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onSuccess={handleCreateSuccess}
        />

        <AssignPrincipalRoleModal
            visible={assignRoleModalVisible}
            principalName={selectedPrincipalForRole}
            onClose={() => {
              setAssignRoleModalVisible(false);
              setSelectedPrincipalForRole(null);
            }}
            onSuccess={handleAssignRoleSuccess}
        />
      </Space>
  );
}