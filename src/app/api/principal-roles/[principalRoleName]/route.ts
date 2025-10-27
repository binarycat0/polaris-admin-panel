import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalRolesUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ principalRoleName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalRoleName} = await params;
    const url = `${apiManagementPrincipalRolesUrl}/${encodeURIComponent(principalRoleName)}`;

    console.log('Updating principal role:', principalRoleName);

    const body = await request.json();
    console.log('Request body:', body);

    const response = await authenticatedFetch(url, 'PUT', authHeader, request, body);

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to update principal role',
          type: 'UpdateError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    const data = await response.json();
    console.log('Principal role updated successfully:', data);
    return NextResponse.json(data, {status: 200});
  } catch (error) {
    console.error('Update principal role proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ principalRoleName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalRoleName} = await params;
    const url = `${apiManagementPrincipalRolesUrl}/${encodeURIComponent(principalRoleName)}`;

    console.log('Deleting principal role:', principalRoleName);

    const response = await authenticatedFetch(url, 'DELETE', authHeader, request);

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

