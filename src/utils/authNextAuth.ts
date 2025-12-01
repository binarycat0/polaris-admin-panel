/**
 * NextAuth-compatible authentication utilities
 * These utilities work with NextAuth sessions instead of localStorage
 */

import { Session } from "next-auth"

/**
 * Get authorization headers from NextAuth session for API requests
 * @param session - NextAuth session object
 * @returns Authorization header object with optional realm headers or null if not authenticated
 */
export function getAuthHeadersFromSession(session: Session | null): Record<string, string> | null {
  if (!session?.accessToken) {
    return null
  }

  const headers: Record<string, string> = {
    Authorization: `${session.tokenType || 'Bearer'} ${session.accessToken}`
  }

  if (session.realmHeaderName && session.realmHeaderValue) {
    headers[session.realmHeaderName] = session.realmHeaderValue
  }

  return headers
}

/**
 * Check if NextAuth session is valid and not expired
 * @param session - NextAuth session object
 * @returns boolean indicating if session is valid
 */
export function isSessionValid(session: Session | null): boolean {
  if (!session || session.error === "TokenExpired") {
    return false
  }

  if (session.expiresAt && Date.now() > session.expiresAt) {
    return false
  }

  return !!session.accessToken
}

/**
 * Get realm information from NextAuth session
 * @param session - NextAuth session object
 * @returns Realm header name and value or null
 */
export function getRealmInfoFromSession(session: Session | null): {
  headerName: string | null
  headerValue: string | null
} {
  if (!session) {
    return {
      headerName: null,
      headerValue: null
    }
  }

  return {
    headerName: session.realmHeaderName || null,
    headerValue: session.realmHeaderValue || null
  }
}

