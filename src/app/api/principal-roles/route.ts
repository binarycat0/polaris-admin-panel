import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalRolesUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";


export async function GET(request: NextRequest) {
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

    console.log('Fetching principal roles from:', apiManagementPrincipalRolesUrl);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(apiManagementPrincipalRolesUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error fetching principal roles:', data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Principal roles proxy error:', error);
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

