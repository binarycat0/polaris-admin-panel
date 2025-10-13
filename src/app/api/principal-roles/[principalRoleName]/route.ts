import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalRolesUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";


export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ principalRoleName: string }> }
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

    const {principalRoleName} = await params;
    const url = `${apiManagementPrincipalRolesUrl}/${encodeURIComponent(principalRoleName)}`;

    console.log('Deleting principal role:', principalRoleName);

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
          message: 'Failed to delete principal role',
          type: 'DeleteError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Principal role deleted successfully');
    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    console.error('Delete principal role proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

