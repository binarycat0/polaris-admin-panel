import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalsUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ principalName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalName} = await params;
    const url = `${apiManagementPrincipalsUrl}/${encodeURIComponent(principalName)}`;

    const body = await request.json();

    console.log('Updating principal:', principalName, body);

    const response = await authenticatedFetch(url, 'PUT', authHeader, request, body);

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Principal updated successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Update principal proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ principalName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalName} = await params;
    const url = `${apiManagementPrincipalsUrl}/${encodeURIComponent(principalName)}`;

    console.log('Deleting principal:', principalName);

    const response = await authenticatedFetch(url, 'DELETE', authHeader, request);

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to delete principal',
          type: 'DeleteError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Principal deleted successfully');
    return NextResponse.json({success: true}, {status: 200});
  } catch (error) {
    console.error('Delete principal proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

