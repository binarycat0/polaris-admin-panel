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
 * Clears auth data and redirects to auth page
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

  router.push('/auth');
}

/**
 * Get authorization headers for API requests
 * @returns Authorization header object or null if not authenticated
 */
export function getAuthHeaders(): { Authorization: string } | null {
  const authStatus = checkAuthStatus();

  if (!authStatus.isAuthenticated || !authStatus.token) {
    return null;
  }

  return {
    Authorization: `${authStatus.tokenType} ${authStatus.token}`
  };
}
