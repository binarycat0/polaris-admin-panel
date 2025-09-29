import { NextRequest, NextResponse } from 'next/server';
import {apiCatalogAuthUrl} from "@/app/constants";


export async function POST(request: NextRequest) {
  try {
    const { client_id, client_secret, scope, realmHeaderName, realmHeaderValue } = await request.json();

    // OAuth2 endpoints typically expect form-encoded data
    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', client_id);
    formData.append('client_secret', client_secret);
    // Polaris requires a scope parameter - use 'PRINCIPAL_ROLE:ALL' as default if not provided
    formData.append('scope', scope || 'PRINCIPAL_ROLE:ALL');

    // Prepare headers with optional realm header
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Add realm header if both name and value are provided
    if (realmHeaderName && realmHeaderValue) {
      headers[realmHeaderName] = realmHeaderValue;
    }

    const response = await fetch(apiCatalogAuthUrl, {
      method: 'POST',
      headers,
      body: formData.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'InternalServerError', code: 500 } },
      { status: 500 }
    );
  }
}
