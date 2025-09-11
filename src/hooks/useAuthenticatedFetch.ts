/**
 * Custom hook for making authenticated API requests with automatic 401 handling
 */

import { useRouter } from 'next/navigation';
import { message } from 'antd';
import { checkAuthStatus, handleAuthFailure, getAuthHeaders } from '@/utils/auth';

export function useAuthenticatedFetch() {
  const router = useRouter();

  /**
   * Make an authenticated API request
   * @param url - API endpoint URL
   * @param options - Fetch options (method, body, etc.)
   * @returns Promise with the response data or null if authentication failed
   */
  const authenticatedFetch = async (
    url: string, 
    options: RequestInit = {}
  ): Promise<any> => {
    // Check authentication status first
    const authStatus = checkAuthStatus();
    
    if (!authStatus.isAuthenticated) {
      if (authStatus.isExpired) {
        message.error('Your session has expired. Please authenticate again.');
      } else {
        message.error('No access token found. Please authenticate first.');
      }
      router.push('/auth');
      return null;
    }

    // Get auth headers
    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      handleAuthFailure(router, 'Authentication failed. Please login again.');
      return null;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
          ...options.headers,
        },
        cache: 'no-store',
      });

      // Handle 401 responses
      if (response.status === 401) {
        handleAuthFailure(router, 'Authentication failed. Please login again.');
        return null;
      }

      // Handle other error responses
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`HTTP ${response.status} error for ${url}:`, errorText);

        if (response.status >= 500) {
          message.error('Server error occurred. Please try again later.');
        } else {
          message.error(`Request failed with status ${response.status}`);
        }

        return null; // Return null instead of throwing for non-auth errors
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);

      // Only show user-facing error if it's not already handled above
      if (error instanceof TypeError && error.message.includes('fetch')) {
        message.error('Network error. Please check your connection.');
      } else if (!error.message.includes('HTTP error')) {
        message.error('An unexpected error occurred. Please try again.');
      }

      return null; // Return null instead of throwing
    }
  };

  return { authenticatedFetch };
}
