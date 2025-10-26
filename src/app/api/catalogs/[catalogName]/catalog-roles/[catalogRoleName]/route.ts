import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogRoleUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";


export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
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

    const {catalogName, catalogRoleName} = await params;
    const targetUrl = apiManagementCatalogRoleUrl(catalogName, catalogRoleName);

    const body = await request.json();

    console.log(`Updating catalog role: ${catalogName}/${catalogRoleName}`);
    console.log(`Target URL: ${targetUrl}`);
    console.log(`Request body:`, body);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
      body: JSON.stringify(body),
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to update catalog role',
          type: 'UpdateError',
          code: response.status
        }
      }));
      console.error(`Backend API error updating catalog role ${catalogName}/${catalogRoleName}:`, data);
      return NextResponse.json(data, {status: response.status});
    }

    const data = await response.json();
    console.log(`Response data:`, data);

    return NextResponse.json(data, {status: 200});
  } catch (error) {
    console.error('Update catalog role proxy error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      message: `Failed to update catalog role: ${errorMessage}`,
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

