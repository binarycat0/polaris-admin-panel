'use client'

import Catalogs, {CatalogEntity} from "@/app/ui/catalogs"
import {useEffect, useState} from 'react'
import {message, Spin} from 'antd';
import {useRouter} from 'next/navigation';

export default function Page() {
  const [catalogs, setCatalogs] = useState<CatalogEntity[]>([]);
  const [loading, setLoading] = useState(true);
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
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh'
        }}>
          <Spin size="large"/>
        </div>
    );
  }

  return (
      <div>
        <h1 style={{marginBottom: 24}}>Catalogs</h1>
        <Catalogs catalogs={catalogs}/>
      </div>
  )
}