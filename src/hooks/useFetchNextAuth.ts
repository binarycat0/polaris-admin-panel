/**
 * Custom hook for making authenticated API requests with NextAuth session
 * This is the NextAuth-compatible version of useAuthenticatedFetch
 */

import { useRouter } from 'next/navigation'
import { message } from 'antd'
import { useSession } from 'next-auth/react'
import { useCallback } from 'react'
import { getAuthHeadersFromSession, isSessionValid } from '@/utils/authNextAuth'

export function useFetchNextAuth() {
  const router = useRouter()
  const { data: session, status } = useSession()

  /**
   * Make an authenticated API request using NextAuth session
   * @param url - API endpoint URL
   * @param options - Fetch options (method, body, etc.)
   * @returns Promise with the response data or null if authentication failed
   */
  const authenticatedFetch = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<unknown> => {
    // Check if session is loading
    if (status === 'loading') {
      message.warning('Please wait, authenticating...')
      return null
    }

    // Check if session is valid
    if (!session || !isSessionValid(session)) {
      if (session?.error === "TokenExpired") {
        message.error('Your session has expired. Please authenticate again.')
      } else {
        message.error('No active session found. Please authenticate first.')
      }
      router.push('/signin')
      return null
    }

    const authHeaders = getAuthHeadersFromSession(session)
    if (!authHeaders) {
      message.error('Authentication failed. Please login again.')
      router.push('/signin')
      return null
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
      })

      if (!response.ok) {
        const errorText = await response.json().catch(() => {
          return { "error": { "message": "Unknown error" } }
        })
        console.error(`HTTP ${response.status} error for ${url}:`, errorText.error.message)

        if (response.status === 401) {
          message.error('Authentication failed. Please login again.')
          router.push('/signin')
          throw new Error(errorText.error?.message || 'Authentication failed')
        }

        message.error(errorText.error?.message || 'An unexpected error occurred. Please try again.')
        throw new Error(errorText.error?.message || 'Request failed')
      }

      // Handle 204 No Content responses (no body to parse)
      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error && error.message !== 'Authentication failed' && error.message !== 'Request failed') {
        console.error('Fetch error:', error)
        message.error('Network error. Please check your connection and try again.')
      }
      throw error
    }
  }, [session, status, router])

  return { authenticatedFetch, session, status }
}

