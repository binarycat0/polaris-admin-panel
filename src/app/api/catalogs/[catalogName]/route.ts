import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogByNameUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {catalogName} = await params;
    const url = apiManagementCatalogByNameUrl(catalogName);

    const body = await request.json();

    console.log(`Updating catalog: ${catalogName}`);
    console.log(`Target URL: ${url}`);
    console.log(`Request body:`, body);

    const response = await authenticatedFetch(url, 'PUT', authHeader, request, body);

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to update catalog',
          type: 'UpdateError',
          code: response.status
        }
      }));
      console.error(`Backend API error updating catalog ${catalogName}:`, data);
      return NextResponse.json(data, {status: response.status});
    }

    const data = await response.json();
    console.log(`Response data:`, data);

    return NextResponse.json(data, {status: 200});
  } catch (error) {
    console.error('Update catalog proxy error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      message: `Failed to update catalog: ${errorMessage}`,
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

export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {catalogName} = await params;
    const url = apiManagementCatalogByNameUrl(catalogName);

    const response = await authenticatedFetch(url, 'DELETE', authHeader, request);

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to delete catalog',
          type: 'DeleteError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Catalog deleted successfully');
    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error('Delete catalog proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

