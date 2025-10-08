import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalPrincipalRolesUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ principalName: string }> }
) {
  try {
    // Get the Authorization header from the incoming request
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

    const {principalName} = await params;
    const url = apiManagementPrincipalPrincipalRolesUrl(principalName);

    console.log('Fetching principal roles for principal from:', url);

    // Get realm headers from the request
    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error fetching principal roles for principal:', data);
      return NextResponse.json(data, {status: response.status});
    }

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

