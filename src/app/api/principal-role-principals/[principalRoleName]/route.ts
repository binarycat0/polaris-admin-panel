import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalRolePrincipalsUrl} from "@/app/constants";
import {getRealmHeadersFromRequest, validateAuthHeader, getUnauthorizedError} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ principalRoleName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalRoleName} = await params;
    const url = apiManagementPrincipalRolePrincipalsUrl(principalRoleName);

    console.log('Fetching principals for principal role from:', url);

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
      console.error('Error fetching principals for principal role:', data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Principals for principal role proxy error:', error);
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

