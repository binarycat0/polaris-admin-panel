import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalRoleCatalogRoleUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";

export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ principalRoleName: string; catalogName: string; catalogRoleName: string }> }
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

    const {principalRoleName, catalogName, catalogRoleName} = await params;
    const url = apiManagementPrincipalRoleCatalogRoleUrl(principalRoleName, catalogName, catalogRoleName);

    console.log('Revoking catalog role from principal role:', principalRoleName, catalogName, catalogRoleName);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to revoke catalog role',
          type: 'RevokeError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Catalog role revoked successfully');
    return NextResponse.json({success: true}, {status: 204});
  } catch (error) {
    console.error('Revoke catalog role proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

