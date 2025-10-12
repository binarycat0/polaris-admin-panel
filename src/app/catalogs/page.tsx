'use client'

import Catalogs, {CatalogEntity} from "@/app/ui/catalogs"
import CatalogRoles, {CatalogRole} from "@/app/ui/catalog-roles"
import PrincipalRoles, {PrincipalRole} from "@/app/ui/principal-roles"
import Grants, {Grant} from "@/app/ui/grants"
import CreateCatalogModal from "@/app/ui/create-catalog-modal"
import CreateCatalogRoleModal from "@/app/ui/create-catalog-role-modal"
import {useCallback, useEffect, useState} from 'react'
import {Breadcrumb, Button, Divider, Flex, Space, Spin, Typography} from 'antd';
import {FolderAddOutlined, FolderOpenOutlined, UsergroupAddOutlined} from '@ant-design/icons';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';

const {Title} = Typography;

export default function Page() {
  const [catalogs, setCatalogs] = useState<CatalogEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(() => {
    // Restore selected catalog from localStorage on initial load
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_catalog');
    }
    return null;
  });
  const [catalogRoles, setCatalogRoles] = useState<CatalogRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedCatalogRole, setSelectedCatalogRole] = useState<string | null>(() => {
    // Restore selected catalog role from localStorage on initial load
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selected_catalog_role');
    }
    return null;
  });
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRole[]>([]);
  const [principalRolesLoading, setPrincipalRolesLoading] = useState(false);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [grantsLoading, setGrantsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createCatalogRoleModalVisible, setCreateCatalogRoleModalVisible] = useState(false);
  const {authenticatedFetch} = useAuthenticatedFetch();

  const getCatalogs = useCallback(async (): Promise<CatalogEntity[]> => {
    try {
      const data = await authenticatedFetch('/api/catalogs');

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('API Response:', data); // Debug log to see the response structure

      // Handle different possible response structures
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
      // Error handling is done in authenticatedFetch
      return [];
    }
  }, [authenticatedFetch]);

  async function getCatalogRoles(catalogName: string): Promise<CatalogRole[]> {
    try {
      const data = await authenticatedFetch(`/api/catalog-roles/${catalogName}`);

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Catalog Roles API Response:', data);

      // Handle the response structure { roles: [...] }
      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as {
        roles: unknown
      }).roles)) {
        return (data as { roles: CatalogRole[] }).roles;
      } else {
        console.error('Unexpected catalogs roles response structure:', data);
        return [];
      }
    } catch {
      // Error handling is done in authenticatedFetch
      return [];
    }
  }

  async function getPrincipalRoles(catalogName: string, catalogRoleName: string): Promise<PrincipalRole[]> {
    try {
      const data = await authenticatedFetch(`/api/principal-roles/${catalogName}/${catalogRoleName}`);

      if (!data) {
        return []; // Authentication failed, user redirected
      }

      console.log('Principal Roles API Response:', data);

      // Handle the response structure { roles: [...] }
      if (data && typeof data === 'object' && 'roles' in data && Array.isArray((data as {
        roles: unknown
      }).roles)) {
        return (data as { roles: PrincipalRole[] }).roles;
      } else {
        console.error('Unexpected principal roles response structure:', data);
        return [];
      }
    } catch {
      // Error handling is done in authenticatedFetch
      return [];
    }
  }

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
              <PrincipalRoles roles={principalRoles} loading={principalRolesLoading}/>
            </>
        )}

        {selectedCatalog && selectedCatalogRole && (
            <>
              <Divider orientation="left">Privileges</Divider>
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
      </Space>
  )
}