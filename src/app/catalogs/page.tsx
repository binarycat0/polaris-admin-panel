'use client'

import Catalogs, {CatalogEntity} from "@/app/ui/catalogs"
import {CatalogRole} from "@/app/ui/catalog-roles"
import {PrincipalRole} from "@/app/ui/principal-roles"
import {Grant} from "@/app/ui/grants"
import CreateCatalogModal from "@/app/ui/create-catalog-modal"
import {useCallback, useEffect, useState} from 'react'
import {Breadcrumb, Button, Flex, Space, Spin, Typography} from 'antd';
import {FolderAddOutlined, FolderOpenOutlined} from '@ant-design/icons';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';

const {Title} = Typography;

export default function Page() {
  const [catalogs, setCatalogs] = useState<CatalogEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatalog, setSelectedCatalog] = useState<string | null>(null);
  const [catalogRoles, setCatalogRoles] = useState<CatalogRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedCatalogRole, setSelectedCatalogRole] = useState<string | null>(null);
  const [principalRoles, setPrincipalRoles] = useState<PrincipalRole[]>([]);
  const [principalRolesLoading, setPrincipalRolesLoading] = useState(false);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [grantsLoading, setGrantsLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
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
    setSelectedCatalogRole(null); // Clear selected catalogs role
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

  const handleCreateSuccess = () => {
    refreshCatalogs();
  };

  if (loading) {
    return (
        <Spin size="large"/>
    );
  }

  const breadcrumbItems = [
    {
      title: 'Catalogs',
    },
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
      <>
        <Flex justify="space-between" align="center">
          <Space>
            <Button
                variant="outlined"
                icon={<FolderAddOutlined/>}
                onClick={() => setCreateModalVisible(true)}
            >
              Create new
            </Button>
            <Breadcrumb separator={">"} items={breadcrumbItems}/>
          </Space>
          <Title level={4}>
            <Space>
              Catalogs
              <FolderOpenOutlined/>
            </Space>
          </Title>
        </Flex>
        <Catalogs
            catalogs={catalogs}
            onRowClick={handleCatalogRowClick}
            selectedCatalog={selectedCatalog}
        />
        <CreateCatalogModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onSuccess={handleCreateSuccess}
        />
      </>
  )
}