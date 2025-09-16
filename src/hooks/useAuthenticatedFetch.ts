/**
 * Custom hook for making authenticated API requests with automatic 401 handling
 */

import {useRouter} from 'next/navigation';
import {message} from 'antd';
import {checkAuthStatus, getAuthHeaders, handleAuthFailure} from '@/utils/auth';
import {useCallback} from 'react';

export function useAuthenticatedFetch() {
  const router = useRouter();

  /**
   * Make an authenticated API request
   * @param url - API endpoint URL
   * @param options - Fetch options (method, body, etc.)
   * @returns Promise with the response data or null if authentication failed
   */
  const authenticatedFetch = useCallback(async (
      url: string,
      options: RequestInit = {}
  ): Promise<unknown> => {
    // Check authentication status first
    const authStatus = checkAuthStatus();

    if (!authStatus.isAuthenticated) {
      if (authStatus.isExpired) {
        message.error('Your session has expired. Please authenticate again.');
      } else {
        message.error('No access token found. Please authenticate first.');
      }
      router.push('/signin');
      return null;
    }

    // Get signin headers
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

      // Handle non-ok responses
      if (!response.ok) {
        const errorText = await response.json().catch(() => {
          return {"error": {"message": "Unknown error"}}
        });
        console.error(`HTTP ${response.status} error for ${url}:`, errorText.error.message);

        // Only handle authentication failures for 401 responses
        if (response.status === 401) {
          handleAuthFailure(router, 'Authentication failed. Please login again.');
          return null;
        }

        // For other errors, show the error message but don't redirect
        message.error(errorText.error?.message || 'An unexpected error occurred. Please try again.');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      message.error('An unexpected error occurred. Please try again.');

      return null;
    }
  }, [router]);

  return {authenticatedFetch};
}
