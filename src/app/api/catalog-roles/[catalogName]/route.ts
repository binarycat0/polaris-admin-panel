import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogRolesUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
          {
            error: {
              message: 'Authorization header is required',
              type: 'UnauthorizedError',
              code: 401
            }
          },
          {status: 401}
      );
    }

    const {catalogName} = await params;
    const targetUrl = apiManagementCatalogRolesUrl(catalogName);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Backend API error for catalog ${catalogName}:`, data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Catalog roles proxy error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      message: `Failed to fetch catalog roles: ${errorMessage}`,
      type: 'InternalServerError',
      code: 500,
      details: error instanceof Error ? error.stack : String(error)
    };

    return NextResponse.json(
        {error: errorDetails},
        {status: 500}
    );
  }
}

export async function POST(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
          {
            error: {
              message: 'Authorization header is required',
              type: 'UnauthorizedError',
              code: 401
            }
          },
          {status: 401}
      );
    }

    const {catalogName} = await params;
    const targetUrl = apiManagementCatalogRolesUrl(catalogName);
    const body = await request.json();
    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Backend API error creating catalog role for ${catalogName}:`, data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data, {status: 201});
  } catch (error) {
    console.error('Create catalog role proxy error:', error);

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      message: `Failed to create catalog role: ${errorMessage}`,
      type: 'InternalServerError',
      code: 500,
      details: error instanceof Error ? error.stack : String(error)
    };

    return NextResponse.json(
        {error: errorDetails},
        {status: 500}
    );
  }
}
