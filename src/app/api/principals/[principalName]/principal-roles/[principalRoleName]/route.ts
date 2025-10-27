import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalPrincipalRolesUrl} from "@/app/constants";
import {getRealmHeadersFromRequest, validateAuthHeader, getUnauthorizedError} from "@/utils/auth";


export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ principalName: string; principalRoleName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalName, principalRoleName} = await params;
    const url = `${apiManagementPrincipalPrincipalRolesUrl(principalName)}/${encodeURIComponent(principalRoleName)}`;

    console.log('Removing principal role from principal:', principalName, principalRoleName);

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
          message: 'Failed to remove principal role from principal',
          type: 'DeleteError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Principal role removed from principal successfully');
    return NextResponse.json({success: true}, {status: 204});
  } catch (error) {
    console.error('Remove principal role from principal proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

