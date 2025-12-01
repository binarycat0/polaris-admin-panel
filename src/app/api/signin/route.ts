import { NextRequest, NextResponse } from 'next/server';
import {apiCatalogAuthUrl} from "@/app/constants";


export async function POST(request: NextRequest) {
  try {
    const { client_id, client_secret, scope, realmHeaderName, realmHeaderValue } = await request.json();

    const formData = new URLSearchParams();
    formData.append('grant_type', 'client_credentials');
    formData.append('client_id', client_id);
    formData.append('client_secret', client_secret);
    formData.append('scope', scope || 'PRINCIPAL_ROLE:ALL');

    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (realmHeaderName && realmHeaderValue) {
      headers[realmHeaderName] = realmHeaderValue;
    }

    const response = await fetch(apiCatalogAuthUrl, {
      method: 'POST',
      headers,
      body: formData.toString(),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Authentication failed',
          type: 'AuthError',
          code: response.status
        }
      }));
      return NextResponse.json(data, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Auth proxy error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'InternalServerError', code: 500 } },
      { status: 500 }
    );
  }
}
