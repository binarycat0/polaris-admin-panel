import { NextRequest, NextResponse } from 'next/server';

const POLARIS_MANAGEMENT_URL = process.env.POLARIS_MANAGEMENT_API_URL || "http://localhost:8181/api/management/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: { catalogName: string; catalogRoleName: string } }
) {
  try {
    // Get the Authorization header from the incoming request
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: { message: 'Authorization header is required', type: 'UnauthorizedError', code: 401 } },
        { status: 401 }
      );
    }

    const { catalogName, catalogRoleName } = params;
    
    const response = await fetch(`${POLARIS_MANAGEMENT_URL}/catalogs/${catalogName}/catalog-roles/${catalogRoleName}/grants`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Grants proxy error:', error);
    return NextResponse.json(
      { error: { message: 'Internal server error', type: 'InternalServerError', code: 500 } },
      { status: 500 }
    );
  }
}
