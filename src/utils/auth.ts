/**
 * Utility functions for authentication management
 */

export interface AuthStatus {
  isAuthenticated: boolean;
  isExpired: boolean;
  token?: string;
  tokenType?: string;
}

/**
 * Check if user is authenticated and token is valid
 * @returns AuthStatus object with authentication details
 */
export function checkAuthStatus(): AuthStatus {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      isExpired: false
    };
  }

  const accessToken = localStorage.getItem('access_token');
  const tokenType = localStorage.getItem('token_type');
  const expiresAt = localStorage.getItem('token_expires_at');

  // No token means not authenticated
  if (!accessToken) {
    return {
      isAuthenticated: false,
      isExpired: false
    };
  }

  // Check if token is expired
  if (expiresAt && Date.now() > parseInt(expiresAt)) {
    return {
      isAuthenticated: false,
      isExpired: true,
      token: accessToken,
      tokenType: tokenType || 'Bearer'
    };
  }

  // Token exists and is not expired
  return {
    isAuthenticated: true,
    isExpired: false,
    token: accessToken,
    tokenType: tokenType || 'Bearer'
  };
}

/**
 * Clear authentication data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('realm_header_name');
    localStorage.removeItem('realm_header_value');
  }
}

/**
 * Check if authentication is valid (not expired)
 * @returns boolean indicating if user has valid authentication
 */
export function isAuthenticated(): boolean {
  const authStatus = checkAuthStatus();
  return authStatus.isAuthenticated;
}

/**
 * Handle authentication failure (401 responses)
 * Clears signin data and redirects to signin page
 * @param router - Next.js router instance
 * @param message - Optional custom error message
 */
export function handleAuthFailure(router: { push: (url: string) => void }, customMessage?: string): void {
  clearAuthData();

  // Import message dynamically to avoid SSR issues
  if (typeof window !== 'undefined') {
    import('antd').then(({ message }) => {
      message.error(customMessage || 'Authentication failed. Please login again.');
    });
  }

  router.push('/signin');
}

/**
 * Get authorization headers for API requests
 * @returns Authorization header object with optional realm headers or null if not authenticated
 */
export function getAuthHeaders(): Record<string, string> | null {
  const authStatus = checkAuthStatus();

  if (!authStatus.isAuthenticated || !authStatus.token) {
    return null;
  }

  const headers: Record<string, string> = {
    Authorization: `${authStatus.tokenType} ${authStatus.token}`
  };

  // Add realm headers if they exist
  if (typeof window !== 'undefined') {
    const realmHeaderName = localStorage.getItem('realm_header_name');
    const realmHeaderValue = localStorage.getItem('realm_header_value');

    if (realmHeaderName && realmHeaderValue) {
      headers[realmHeaderName] = realmHeaderValue;
    }
  }

  return headers;
}

/**
 * Get realm headers from request for server-side API routes
 * @param request - NextRequest object
 * @returns Realm headers object or empty object if not present
 */
export function getRealmHeadersFromRequest(request: { headers: { entries: () => IterableIterator<[string, string]> } }): Record<string, string> {
  const headers: Record<string, string> = {};

  // Iterate through all headers to find realm headers
  // We'll exclude standard HTTP headers and only include custom headers that might be realm-related
  const standardHeaders = new Set([
    'authorization', 'content-type', 'accept', 'user-agent', 'host', 'connection',
    'cache-control', 'pragma', 'accept-encoding', 'accept-language', 'cookie',
    'referer', 'origin', 'x-forwarded-for', 'x-forwarded-proto', 'x-real-ip'
  ]);

  for (const [name, value] of request.headers.entries()) {
    const lowerName = name.toLowerCase();
    // Include headers that are not standard HTTP headers and might be realm-related
    if (!standardHeaders.has(lowerName) && value) {
      headers[name] = value;
    }
  }

  return headers;
}
