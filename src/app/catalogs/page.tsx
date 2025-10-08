'use client'

import Catalogs, {CatalogEntity} from "@/app/ui/catalogs"
import CatalogRoles, {CatalogRole} from "@/app/ui/catalog-roles"
import PrincipalRoles, {PrincipalRole} from "@/app/ui/principal-roles"
import Grants, {Grant} from "@/app/ui/grants"
import {useEffect, useState, useCallback} from 'react'
import {Spin, Splitter, Typography} from 'antd';
import {useAuthenticatedFetch} from '@/hooks/useAuthenticatedFetch';
import styles from './page.module.css';

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

  useEffect(() => {
    const fetchCatalogs = async () => {
      setLoading(true);
      const catalogsData = await getCatalogs();
      setCatalogs(catalogsData);
      setLoading(false);
    };

    fetchCatalogs();
  }, [getCatalogs]);

  if (loading) {
    return (
        <div className={styles.loadingContainer}>
          <Spin size="large"/>
        </div>
    );
  }

  return (
      <div className={styles.contentWrapper}>
        <Splitter style={{height: 600, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
          <Splitter.Panel collapsible>
            <Typography.Title level={4}>
              Catalogs
            </Typography.Title>
            <Catalogs
                catalogs={catalogs}
                onRowClick={handleCatalogRowClick}
                selectedCatalog={selectedCatalog}
            />
          </Splitter.Panel>
          <Splitter.Panel>
            <Splitter layout="vertical">
              <Splitter.Panel>
                {selectedCatalog && (
                    <CatalogRoles
                        catalogName={selectedCatalog}
                        roles={catalogRoles}
                        loading={rolesLoading}
                        onRowClick={handleCatalogRoleRowClick}
                        selectedCatalogRole={selectedCatalogRole}
                    />
                )}
              </Splitter.Panel>
              <Splitter.Panel>
                {selectedCatalog && selectedCatalogRole && (
                    <PrincipalRoles
                        catalogName={selectedCatalog}
                        catalogRoleName={selectedCatalogRole}
                        roles={principalRoles}
                        loading={principalRolesLoading}
                    />
                )}
              </Splitter.Panel>
              <Splitter.Panel>
                {selectedCatalog && selectedCatalogRole && (
                    <Grants
                        catalogName={selectedCatalog}
                        catalogRoleName={selectedCatalogRole}
                        grants={grants}
                        loading={grantsLoading}
                    />
                )}
              </Splitter.Panel>
            </Splitter>
          </Splitter.Panel>
        </Splitter>
      </div>
  )
}