'use client'

import Catalogs, {CatalogEntity} from "@/app/ui/catalogs"
import CatalogRoles, {CatalogRole} from "@/app/ui/catalog-roles"
import PrincipalRolesList, {PrincipalRoleItem, PrincipalItem} from "@/app/ui/principal-roles-list"
import Grants, {Grant} from "@/app/ui/grants"
import CreateCatalogModal from "@/app/ui/create-catalog-modal"
import CreateCatalogRoleModal from "@/app/ui/create-catalog-role-modal"
import AssignCatalogRoleModal from "@/app/ui/assign-catalog-role-modal"
import RemoveCatalogRoleModal from "@/app/ui/remove-catalog-role-modal"
import AddPrivilegeModal from "@/app/ui/add-privilege-modal"
import RemovePrivilegeModal from "@/app/ui/remove-privilege-modal"
import {useCallback, useEffect, useState} from 'react'
import {Breadcrumb, Button, Divider, message, Space, Spin, Typography, Flex} from 'antd';
import {
  FolderAddOutlined,
  FolderOpenOutlined,
  MinusOutlined,
  PlusOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';

const {Title} = Typography;

export default function Page() {
  const [catalogs, setCatalogs] = useState<CatalogEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_catalog');
    }
    return null;
  });
  const [catalogRoles, setCatalogRoles] = useState<CatalogRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedCatalogRole, setSelectedCatalogRole] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_catalog_role');
    }
    return null;
  });
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRoleItem[]>([]);
  const [principalRolesLoading, setPrincipalRolesLoading] = useState(false);
  const [expandedPrincipalRoleKeys, setExpandedPrincipalRoleKeys] = useState<string[]>([]);
  const [principals, setPrincipals] = useState<Record<string, PrincipalItem[]>>({});
  const [principalsLoading, setPrincipalsLoading] = useState<Record<string, boolean>>({});
  const [grants, setGrants] = useState<Grant[]>([]);
  const [grantsLoading, setGrantsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createCatalogRoleModalVisible, setCreateCatalogRoleModalVisible] = useState(false);
  const [assignCatalogRoleModalVisible, setAssignCatalogRoleModalVisible] = useState(false);
  const [removeCatalogRoleModalVisible, setRemoveCatalogRoleModalVisible] = useState(false);
  const [addPrivilegeModalVisible, setAddPrivilegeModalVisible] = useState(false);
  const [removePrivilegeModalVisible, setRemovePrivilegeModalVisible] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getCatalogs = useCallback(async (): Promise<CatalogEntity[]> => {
    try {
      const data = await authenticatedFetch('/api/catalogs');

      if (!data) {
        return [];
      }

      console.log('API Response:', data);

      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && 'catalogs' in data && Array.isArray((data as {
        catalogs: unknown
      }).catalogs)) {
        return (data as { catalogs: CatalogEntity[] }).catalogs;
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as {
        data: unknown
      }).data)) {
        return (data as { data: CatalogEntity[] }).data;
      } else {
        console.error('Unexpected API response structure:', data);
        return [];
      }
    } catch {
      return [];
    }
  }, [authenticatedFetch]);

  async function getCatalogRoles(catalogName: string): Promise<CatalogRole[]> {
    try {
      const data = await authenticatedFetch(`/api/catalog-roles/${catalogName}`);

      if (!data) {
        return [];
      }

      console.log('Catalog Roles API Response:', data);

      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as {
        roles: unknown
      }).roles)) {
        return (data as { roles: CatalogRole[] }).roles;
      } else {
        console.error('Unexpected catalogs roles response structure:', data);
        return [];
      }
    } catch {
      return [];
    }
  }

  async function getPrincipalRoles(catalogName: string, catalogRoleName: string): Promise<PrincipalRoleItem[]> {
    try {
      const data = await authenticatedFetch(`/api/catalogs/${catalogName}/catalog-roles/${catalogRoleName}/principal-roles`);

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
  }

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

  const handleCatalogRowClick = async (catalogName: string) => {
    setSelectedCatalog(catalogName);
    // Save selected catalog to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_catalog', catalogName);
    }

    setSelectedCatalogRole(null); // Clear selected catalogs role
    // Clear selected catalog role from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selected_catalog_role');
    }

    setPrincipalRoles([]); // Clear principal roles
    setGrants([]); // Clear grants
    setRolesLoading(true);

    try {
      const roles = await getCatalogRoles(catalogName);
      setCatalogRoles(roles);
    } finally {
      setRolesLoading(false);
    }
  };

  async function getGrants(catalogName: string, catalogRoleName: string): Promise<Grant[]> {
    try {
      const data = await authenticatedFetch(`/api/grants/${catalogName}/${catalogRoleName}`);

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Grants API Response:', data);

      // Handle different possible response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data && typeof data === 'object' && 'grants' in data && Array.isArray((data as {
        grants: unknown
      }).grants)) {
        return (data as { grants: Grant[] }).grants;
      } else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as {
        data: unknown
      }).data)) {
        return (data as { data: Grant[] }).data;
      } else {
        console.error('Unexpected grants response structure:', data);
        return [];
      }
    } catch {
      // Error handling is done in authenticatedFetch
      return [];
    }
  }

  const handleCatalogRoleRowClick = async (catalogRoleName: string) => {
    if (!selectedCatalog) return;

    setSelectedCatalogRole(catalogRoleName);
    // Save selected catalog role to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_catalog_role', catalogRoleName);
    }

    // Clear expanded principal roles and principals data
    setExpandedPrincipalRoleKeys([]);
    setPrincipals({});

    setPrincipalRolesLoading(true);
    setGrantsLoading(true);

    try {
      // Fetch both principal roles and grants in parallel
      const [roles, grantsData] = await Promise.all([
        getPrincipalRoles(selectedCatalog, catalogRoleName),
        getGrants(selectedCatalog, catalogRoleName)
      ]);

      setPrincipalRoles(roles);
      setGrants(grantsData);
    } finally {
      setPrincipalRolesLoading(false);
      setGrantsLoading(false);
    }
  };

  const handlePrincipalRoleRowClick = async (principalRoleName: string) => {
    // Toggle expansion
    const isExpanded = expandedPrincipalRoleKeys.includes(principalRoleName);

    if (isExpanded) {
      // Collapse the row
      setExpandedPrincipalRoleKeys([]);
    } else {
      // Expand the row (only one row at a time)
      setExpandedPrincipalRoleKeys([principalRoleName]);

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

  const handleDeletePrincipalRole = async (principalRoleName: string) => {
    if (!selectedCatalog || !selectedCatalogRole) return;

    try {
      await authenticatedFetch(
          `/api/principal-roles/${encodeURIComponent(selectedCatalog)}/${encodeURIComponent(selectedCatalogRole)}/${encodeURIComponent(principalRoleName)}`,
          {
            method: 'DELETE',
          }
      );

      message.success(`Principal role "${principalRoleName}" removed from catalog role "${selectedCatalogRole}" successfully!`);

      // Refresh the principal roles list
      const roles = await getPrincipalRoles(selectedCatalog, selectedCatalogRole);
      setPrincipalRoles(roles);
    } catch (error) {
      console.error('Error removing principal role from catalog role:', error);
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

  const refreshCatalogs = useCallback(async () => {
    setLoading(true);
    const catalogsData = await getCatalogs();
    setCatalogs(catalogsData);
    setLoading(false);
  }, [getCatalogs]);

  useEffect(() => {
    refreshCatalogs().then(() => {
    });
  }, [refreshCatalogs]);

  // Restore state from localStorage when catalogs are loaded
  useEffect(() => {
    const restoreState = async () => {
      if (catalogs.length === 0 || loading) return;

      const savedCatalog = selectedCatalog;
      const savedCatalogRole = selectedCatalogRole;

      // Restore catalog roles if a catalog was selected
      if (savedCatalog) {
        setRolesLoading(true);
        try {
          const roles = await getCatalogRoles(savedCatalog);
          setCatalogRoles(roles);

          // Restore principal roles and grants if a catalog role was selected
          if (savedCatalogRole) {
            setPrincipalRolesLoading(true);
            setGrantsLoading(true);
            try {
              const [roles, grantsData] = await Promise.all([
                getPrincipalRoles(savedCatalog, savedCatalogRole),
                getGrants(savedCatalog, savedCatalogRole)
              ]);
              setPrincipalRoles(roles);
              setGrants(grantsData);
            } finally {
              setPrincipalRolesLoading(false);
              setGrantsLoading(false);
            }
          }
        } finally {
          setRolesLoading(false);
        }
      }
    };

    restoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogs.length, loading]);

  const handleCreateSuccess = () => {
    refreshCatalogs();
  };

  const handleCreateCatalogRoleSuccess = async () => {
    if (selectedCatalog) {
      setRolesLoading(true);
      try {
        const roles = await getCatalogRoles(selectedCatalog);
        setCatalogRoles(roles);
      } finally {
        setRolesLoading(false);
      }
    }
  };

  const handleAddCatalogRole = () => {
    setAssignCatalogRoleModalVisible(true);
  };

  const handleRemoveCatalogRole = () => {
    setRemoveCatalogRoleModalVisible(true);
  };

  const handleAssignCatalogRoleSuccess = async () => {
    if (selectedCatalog && selectedCatalogRole) {
      // Refresh the principal roles list
      setPrincipalRolesLoading(true);
      try {
        const roles = await getPrincipalRoles(selectedCatalog, selectedCatalogRole);
        setPrincipalRoles(roles);
      } finally {
        setPrincipalRolesLoading(false);
      }
    }
  };

  const handleRemoveCatalogRoleSuccess = async () => {
    if (selectedCatalog && selectedCatalogRole) {
      // Refresh the principal roles list
      setPrincipalRolesLoading(true);
      try {
        const roles = await getPrincipalRoles(selectedCatalog, selectedCatalogRole);
        setPrincipalRoles(roles);
      } finally {
        setPrincipalRolesLoading(false);
      }
    }
  };

  const handleAddPrivilege = () => {
    setAddPrivilegeModalVisible(true);
  };

  const handleRemovePrivilege = () => {
    setRemovePrivilegeModalVisible(true);
  };

  const handleAddPrivilegeSuccess = async () => {
    if (selectedCatalog && selectedCatalogRole) {
      // Refresh the grants list
      setGrantsLoading(true);
      try {
        const grantsData = await getGrants(selectedCatalog, selectedCatalogRole);
        setGrants(grantsData);
      } finally {
        setGrantsLoading(false);
      }
    }
  };

  const handleRemovePrivilegeSuccess = async () => {
    if (selectedCatalog && selectedCatalogRole) {
      // Refresh the grants list
      setGrantsLoading(true);
      try {
        const grantsData = await getGrants(selectedCatalog, selectedCatalogRole);
        setGrants(grantsData);
      } finally {
        setGrantsLoading(false);
      }
    }
  };

  if (loading) {
    return (
        <Spin size="large"/>
    );
  }

  const breadcrumbItems = [
    ...(
        selectedCatalog ? [
          {
            title: selectedCatalog,
          },
        ] : []
    ),
    ...(selectedCatalogRole ? [
      {
        title: selectedCatalogRole,
      },
    ] : []),
  ];

  return (
      <Space direction="vertical" style={{width: '100%'}}>
        <Space>
          <Title level={4} style={{marginBottom: 0}}>
            <Space>
              Catalogs
              <FolderOpenOutlined/>
            </Space>
          </Title>
          <Breadcrumb separator={">"} items={breadcrumbItems}/>
        </Space>

        <Button
            variant="outlined"
            icon={<FolderAddOutlined/>}
            onClick={() => setCreateModalVisible(true)}
        >
          New catalog
        </Button>

        <Catalogs
            catalogs={catalogs}
            onRowClick={handleCatalogRowClick}
            selectedCatalog={selectedCatalog}
        />

        {selectedCatalog && (
            <>
              <Divider orientation="left">Catalog roles</Divider>
              <Button
                  variant="outlined"
                  icon={<UsergroupAddOutlined/>}
                  onClick={() => setCreateCatalogRoleModalVisible(true)}
              >
                New catalog role
              </Button>
              <CatalogRoles
                  roles={catalogRoles}
                  loading={rolesLoading}
                  onRowClick={handleCatalogRoleRowClick}
                  selectedCatalogRole={selectedCatalogRole}
              />
            </>
        )}


        {selectedCatalog && selectedCatalogRole && (
            <>
              <Divider orientation="left">Principal Roles Assigned to Catalog Role</Divider>
              <Flex justify="flex-end" align="center" style={{width: '100%'}}>
                <Space>
                  <Button
                      type="default"
                      icon={<PlusOutlined/>}
                      onClick={handleAddCatalogRole}
                  >
                    Add Role
                  </Button>
                  <Button
                      danger
                      icon={<MinusOutlined/>}
                      onClick={handleRemoveCatalogRole}
                      disabled={principalRoles.length === 0}
                  >
                    Remove Role
                  </Button>
                </Space>
              </Flex>
              <PrincipalRolesList
                  roles={principalRoles}
                  loading={principalRolesLoading}
                  onRowClick={handlePrincipalRoleRowClick}
                  expandedRowKeys={expandedPrincipalRoleKeys}
                  principals={principals}
                  principalsLoading={principalsLoading}
                  onDelete={handleDeletePrincipalRole}
                  onDeletePrincipal={handleDeletePrincipal}
              />
            </>
        )}

        {selectedCatalog && selectedCatalogRole && (
            <>
              <Divider orientation="left">Privileges</Divider>
              <Flex justify="flex-end" align="center" style={{width: '100%'}}>
                <Space>
                  <Button
                      type="default"
                      icon={<PlusOutlined/>}
                      onClick={handleAddPrivilege}
                  >
                    Add Privilege
                  </Button>
                  <Button
                      danger
                      icon={<MinusOutlined/>}
                      onClick={handleRemovePrivilege}
                      disabled={grants.length === 0}
                  >
                    Remove Privilege
                  </Button>
                </Space>
              </Flex>
              <Grants grants={grants} loading={grantsLoading}/>
            </>
        )}

        <CreateCatalogModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onSuccess={handleCreateSuccess}
        />

        <CreateCatalogRoleModal
            visible={createCatalogRoleModalVisible}
            catalogName={selectedCatalog}
            onClose={() => setCreateCatalogRoleModalVisible(false)}
            onSuccess={handleCreateCatalogRoleSuccess}
        />

        <AssignCatalogRoleModal
            visible={assignCatalogRoleModalVisible}
            catalogName={selectedCatalog}
            catalogRoleName={selectedCatalogRole}
            onClose={() => setAssignCatalogRoleModalVisible(false)}
            onSuccess={handleAssignCatalogRoleSuccess}
        />

        <RemoveCatalogRoleModal
            visible={removeCatalogRoleModalVisible}
            catalogName={selectedCatalog}
            catalogRoleName={selectedCatalogRole}
            assignedPrincipalRoles={principalRoles}
            onClose={() => setRemoveCatalogRoleModalVisible(false)}
            onSuccess={handleRemoveCatalogRoleSuccess}
        />

        <AddPrivilegeModal
            visible={addPrivilegeModalVisible}
            catalogName={selectedCatalog}
            catalogRoleName={selectedCatalogRole}
            onClose={() => setAddPrivilegeModalVisible(false)}
            onSuccess={handleAddPrivilegeSuccess}
        />

        <RemovePrivilegeModal
            visible={removePrivilegeModalVisible}
            catalogName={selectedCatalog}
            catalogRoleName={selectedCatalogRole}
            grants={grants}
            onClose={() => setRemovePrivilegeModalVisible(false)}
            onSuccess={handleRemovePrivilegeSuccess}
        />
      </Space>
  )
}