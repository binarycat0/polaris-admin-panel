import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogRolesPrincipalRolesUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {catalogName, catalogRoleName} = await params;

    const response = await authenticatedFetch(
      apiManagementCatalogRolesPrincipalRolesUrl(catalogName, catalogRoleName),
      'GET',
      authHeader,
      request
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to fetch principal roles for catalog role',
          type: 'FetchError',
          code: response.status
        }
      }));
      return NextResponse.json(data, {status: response.status});
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Principal roles proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}
