import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalRoleCatalogRolesUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";

export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ principalRoleName: string; catalogName: string }> }
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

    const {principalRoleName, catalogName} = await params;
    const url = apiManagementPrincipalRoleCatalogRolesUrl(principalRoleName, catalogName);

    console.log('Assigning catalog role to principal role:', principalRoleName, catalogName);

    const body = await request.json();
    console.log('Request body:', body);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to assign catalog role',
          type: 'AssignError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Catalog role assigned successfully');
    return NextResponse.json({success: true}, {status: 201});
  } catch (error) {
    console.error('Assign catalog role proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

