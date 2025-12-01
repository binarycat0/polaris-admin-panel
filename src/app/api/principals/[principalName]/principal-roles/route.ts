import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalPrincipalRolesUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ principalName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalName} = await params;
    const url = apiManagementPrincipalPrincipalRolesUrl(principalName);

    console.log('Fetching principal roles for principal from:', url);

    const response = await authenticatedFetch(url, 'GET', authHeader, request);

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to fetch principal roles',
          type: 'FetchError',
          code: response.status
        }
      }));
      console.error('Error fetching principal roles for principal:', data);
      return NextResponse.json(data, {status: response.status});
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Principal roles for principal proxy error:', error);
    return NextResponse.json(
        {
          error: {
            message: 'Internal server error',
            type: 'InternalServerError',
            code: 500
          }
        },
        {status: 500}
    );
  }
}

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
    const url = apiManagementPrincipalPrincipalRolesUrl(principalName);

    console.log('Assigning principal role to principal:', principalName);

    const body = await request.json();
    console.log('Request body:', body);

    const response = await authenticatedFetch(url, 'PUT', authHeader, request, body);

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to assign principal role',
          type: 'AssignError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Principal role assigned successfully');

    // Handle 204 No Content response from backend
    if (response.status === 204) {
      return new NextResponse(null, {status: 204});
    }

    return NextResponse.json({success: true}, {status: 201});
  } catch (error) {
    console.error('Assign principal role proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}
