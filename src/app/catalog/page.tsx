'use client'

import Catalogs, {CatalogEntity} from "@/app/ui/catalogs"
import CatalogRoles, {CatalogRole} from "@/app/ui/catalog-roles"
import PrincipalRoles, {PrincipalRole} from "@/app/ui/principal-roles"
import Grants, {Grant} from "@/app/ui/grants"
import {useEffect, useState} from 'react'
import {message, Spin} from 'antd';
import {useRouter} from 'next/navigation';

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
  const router = useRouter();

  async function getCatalogs(): Promise<CatalogEntity[]> {
    const accessToken = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';

    if (!accessToken) {
      message.error('No access token found. Please authenticate first.');
      router.push('/auth');
      return [];
    }

    // Check if token is expired
    const expiresAt = localStorage.getItem('token_expires_at');
    if (expiresAt && Date.now() > parseInt(expiresAt)) {
      message.error('Access token has expired. Please authenticate again.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('token_type');
      localStorage.removeItem('token_expires_at');
      router.push('/auth');
      return [];
    }

    try {
      const res = await fetch('/api/catalogs', {
        cache: 'no-store',
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          message.error('Authentication failed. Please login again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('token_expires_at');
          router.push('/auth');
          return [];
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('API Response:', data); // Debug log to see the response structure

      // Handle different possible response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.catalogs)) {
        return data.catalogs;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.error('Unexpected API response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      message.error('Failed to fetch catalogs. Please try again.');
      return [];
    }
  }

  async function getCatalogRoles(catalogName: string): Promise<CatalogRole[]> {
    const accessToken = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';

    if (!accessToken) {
      message.error('No access token found. Please authenticate first.');
      router.push('/auth');
      return [];
    }

    try {
      const res = await fetch(`/api/catalog-roles/${catalogName}`, {
        cache: 'no-store',
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          message.error('Authentication failed. Please login again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('token_expires_at');
          router.push('/auth');
          return [];
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Catalog Roles API Response:', data);

      // Handle the response structure { roles: [...] }
      if (data && Array.isArray(data.roles)) {
        return data.roles;
      } else {
        console.error('Unexpected catalog roles response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching catalog roles:', error);
      message.error('Failed to fetch catalog roles. Please try again.');
      return [];
    }
  }

  async function getPrincipalRoles(catalogName: string, catalogRoleName: string): Promise<PrincipalRole[]> {
    const accessToken = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';

    if (!accessToken) {
      message.error('No access token found. Please authenticate first.');
      router.push('/auth');
      return [];
    }

    try {
      const res = await fetch(`/api/principal-roles/${catalogName}/${catalogRoleName}`, {
        cache: 'no-store',
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          message.error('Authentication failed. Please login again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('token_expires_at');
          router.push('/auth');
          return [];
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Principal Roles API Response:', data);

      // Handle the response structure { roles: [...] }
      if (data && Array.isArray(data.roles)) {
        return data.roles;
      } else {
        console.error('Unexpected principal roles response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching principal roles:', error);
      message.error('Failed to fetch principal roles. Please try again.');
      return [];
    }
  }

  const handleCatalogRowClick = async (catalogName: string) => {
    setSelectedCatalog(catalogName);
    setSelectedCatalogRole(null); // Clear selected catalog role
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
    const accessToken = localStorage.getItem('access_token');
    const tokenType = localStorage.getItem('token_type') || 'Bearer';

    if (!accessToken) {
      message.error('No access token found. Please authenticate first.');
      router.push('/auth');
      return [];
    }

    try {
      const res = await fetch(`/api/grants/${catalogName}/${catalogRoleName}`, {
        cache: 'no-store',
        headers: {
          'Authorization': `${tokenType} ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          message.error('Authentication failed. Please login again.');
          localStorage.removeItem('access_token');
          localStorage.removeItem('token_type');
          localStorage.removeItem('token_expires_at');
          router.push('/auth');
          return [];
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Grants API Response:', data);

      // Handle different possible response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.grants)) {
        return data.grants;
      } else if (data && Array.isArray(data.data)) {
        return data.data;
      } else {
        console.error('Unexpected grants response structure:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching grants:', error);
      message.error('Failed to fetch grants. Please try again.');
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
  }, []);

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Spin size="large"/>
      </div>
    );
  }

  return (
    <div style={{
      padding: '24px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          marginBottom: 32,
          fontSize: '28px',
          fontWeight: 600,
          color: '#262626'
        }}>
          Catalogs
        </h1>
        <Catalogs
          catalogs={catalogs}
          onRowClick={handleCatalogRowClick}
          selectedCatalog={selectedCatalog}
        />

        {selectedCatalog && (
          <CatalogRoles
            catalogName={selectedCatalog}
            roles={catalogRoles}
            loading={rolesLoading}
            onRowClick={handleCatalogRoleRowClick}
            selectedCatalogRole={selectedCatalogRole}
          />
        )}

        {selectedCatalog && selectedCatalogRole && (
          <PrincipalRoles
            catalogName={selectedCatalog}
            catalogRoleName={selectedCatalogRole}
            roles={principalRoles}
            loading={principalRolesLoading}
          />
        )}

        {selectedCatalog && selectedCatalogRole && (
          <Grants
            catalogName={selectedCatalog}
            catalogRoleName={selectedCatalogRole}
            grants={grants}
            loading={grantsLoading}
          />
        )}
      </div>
    </div>
  )
}