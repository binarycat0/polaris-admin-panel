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
  if (typeof window === 'undefined') {
    return {
      isAuthenticated: false,
      isExpired: false
    };
  }

  const accessToken = localStorage.getItem('access_token');
  const tokenType = localStorage.getItem('token_type');
  const expiresAt = localStorage.getItem('token_expires_at');

  if (!accessToken) {
    return {
      isAuthenticated: false,
      isExpired: false
    };
  }

  if (expiresAt && Date.now() > parseInt(expiresAt)) {
    return {
      isAuthenticated: false,
      isExpired: true,
      token: accessToken,
      tokenType: tokenType || 'Bearer'
    };
  }

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
    window.dispatchEvent(new CustomEvent('auth-state-changed'));
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

  const standardHeaders = new Set([
    'authorization', 'content-type', 'accept', 'user-agent', 'host', 'connection',
    'cache-control', 'pragma', 'accept-encoding', 'accept-language', 'cookie',
    'referer', 'origin', 'x-forwarded-for', 'x-forwarded-proto', 'x-real-ip'
  ]);

  for (const [name, value] of request.headers.entries()) {
    const lowerName = name.toLowerCase();
    if (!standardHeaders.has(lowerName) && value) {
      headers[name] = value;
    }
  }

  return headers;
}

/**
 * Validate authorization header from request
 * @param request - NextRequest object
 * @returns Authorization header string or null if not present
 */
export function validateAuthHeader(request: { headers: { get: (name: string) => string | null } }): string | null {
  return request.headers.get('Authorization');
}

/**
 * Get unauthorized error response data
 * @returns Error object for unauthorized requests
 */
export function getUnauthorizedError() {
  return {
    error: {
      message: 'Authorization header is required',
      type: 'UnauthorizedError',
      code: 401
    }
  };
}

/**
 * Create authenticated fetch headers
 * @param authHeader - Authorization header value
 * @param request - NextRequest object to extract realm headers from
 * @returns Headers object with Authorization, Content-Type, and realm headers
 */
export function createAuthHeaders(
  authHeader: string,
  request: { headers: { entries: () => IterableIterator<[string, string]> } }
): Record<string, string> {
  const realmHeaders = getRealmHeadersFromRequest(request);

  return {
    'Authorization': authHeader,
    'Content-Type': 'application/json',
    ...realmHeaders,
  };
}

/**
 * Make an authenticated fetch request to the backend API
 * @param url - Target URL
 * @param method - HTTP method (GET, POST, PUT, DELETE)
 * @param authHeader - Authorization header value
 * @param request - NextRequest object to extract realm headers from
 * @param body - Optional request body (will be JSON stringified)
 * @returns Fetch Response object
 */
export async function authenticatedFetch(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  authHeader: string,
  request: { headers: { entries: () => IterableIterator<[string, string]> } },
  body?: unknown
): Promise<Response> {
  const headers = createAuthHeaders(authHeader, request);

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    fetchOptions.body = JSON.stringify(body);
  }

  return fetch(url, fetchOptions);
}

/**
 * Handle an authenticated API request with automatic auth validation, body parsing, and error handling
 * This is a high-level wrapper that handles the complete request flow:
 * 1. Validates auth header
 * 2. Parses request body (if needed)
 * 3. Makes authenticated fetch
 * 4. Returns NextResponse with proper status codes
 *
 * @param request - NextRequest object
 * @param urlOrFactory - Target backend URL or async function that returns URL (for dynamic routes)
 * @param method - HTTP method
 * @param options - Optional configuration
 * @returns NextResponse with data or error
 */
export async function handleAuthenticatedRequest(
  request: {
    headers: {
      get: (name: string) => string | null;
      entries: () => IterableIterator<[string, string]>;
    };
    json: () => Promise<unknown>;
  },
  urlOrFactory: string | (() => Promise<string> | string),
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  options?: {
    parseBody?: boolean;
    bodyParser?: () => Promise<unknown>;
  }
): Promise<Response> {
  // Import NextResponse dynamically to avoid circular dependencies
  const { NextResponse } = await import('next/server');

  try {
    const authHeader = validateAuthHeader(request);
    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), { status: 401 });
    }

    const url = typeof urlOrFactory === 'function' ? await urlOrFactory() : urlOrFactory;

    let body: unknown = undefined;
    const shouldParseBody = options?.parseBody ?? (method !== 'GET');

    if (shouldParseBody) {
      if (options?.bodyParser) {
        body = await options.bodyParser();
      } else {
        body = await request.json().catch(() => undefined);
      }
    }

    const response = await authenticatedFetch(url, method, authHeader, request, body);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Authenticated request error:', error);
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          type: 'InternalServerError',
          code: 500
        }
      },
      { status: 500 }
    );
  }
}
