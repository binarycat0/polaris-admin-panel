import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalRolesUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function GET(request: NextRequest) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    console.log('Fetching principal roles from:', apiManagementPrincipalRolesUrl);

    const response = await authenticatedFetch(
      apiManagementPrincipalRolesUrl,
      'GET',
      authHeader,
      request
    );

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

export async function POST(request: NextRequest) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const body = await request.json();

    const response = await authenticatedFetch(
      apiManagementPrincipalRolesUrl,
      'POST',
      authHeader,
      request,
      body
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}
