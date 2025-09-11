import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogRolesPrincipalRolesUrl} from "@/app/constants";


export async function GET(
    request: NextRequest,
    {params}: { params: { catalogName: string; catalogRoleName: string } }
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

    const {catalogName, catalogRoleName} = params;

    const response = await fetch(apiManagementCatalogRolesPrincipalRolesUrl(catalogName, catalogRoleName), {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Principal roles proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}
