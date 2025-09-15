/**
 * Health check utilities for backend connectivity
 */

import { apiManagementUrl, apiCatalogUrl } from '@/app/constants';

export interface HealthCheckResult {
  isHealthy: boolean;
  error?: string;
  responseTime?: number;
}

/**
 * Check if the Polaris management API is reachable
 */
export async function checkManagementApiHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${apiManagementUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        isHealthy: true,
        responseTime
      };
    } else {
      return {
        isHealthy: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        responseTime
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'TimeoutError') {
      return {
        isHealthy: false,
        error: 'Request timeout - backend may be down',
        responseTime
      };
    }
    
    return {
      isHealthy: false,
      error: error.message || 'Unknown error',
      responseTime
    };
  }
}

/**
 * Check if the Polaris catalogs API is reachable
 */
export async function checkCatalogApiHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Try to reach the auth endpoint as a health check
    const response = await fetch(`${apiCatalogUrl}/oauth/tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&client_id=test&client_secret=test',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    const responseTime = Date.now() - startTime;

    // For auth endpoint, we expect 401 or 400, not 500
    if (response.status === 401 || response.status === 400) {
      return {
        isHealthy: true,
        responseTime
      };
    } else if (response.status >= 500) {
      return {
        isHealthy: false,
        error: `Server error: HTTP ${response.status}`,
        responseTime
      };
    } else {
      return {
        isHealthy: true,
        responseTime
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'TimeoutError') {
      return {
        isHealthy: false,
        error: 'Request timeout - backend may be down',
        responseTime
      };
    }
    
    return {
      isHealthy: false,
      error: error.message || 'Unknown error',
      responseTime
    };
  }
}
