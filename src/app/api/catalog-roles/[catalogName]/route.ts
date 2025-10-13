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

    console.log(`Fetching catalog roles for catalog: ${catalogName}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Authorization header present: ${!!authHeader}`);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log(`Response data:`, data);

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

    // Get the request body
    const body = await request.json();

    console.log(`Creating catalog role for catalog: ${catalogName}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Request body:`, body);

    // Get realm headers from the request
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

    console.log(`Response status: ${response.status}`);

    const data = await response.json();
    console.log(`Response data:`, data);

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
