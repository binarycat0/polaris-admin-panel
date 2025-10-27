import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogRolesUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {catalogName} = await params;
    const targetUrl = apiManagementCatalogRolesUrl(catalogName);

    const response = await authenticatedFetch(targetUrl, 'GET', authHeader, request);

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
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {catalogName} = await params;
    const targetUrl = apiManagementCatalogRolesUrl(catalogName);
    const body = await request.json();
    const response = await authenticatedFetch(targetUrl, 'POST', authHeader, request, body);

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
