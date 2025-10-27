import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalsUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function GET(request: NextRequest) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    console.log('Fetching principals from:', apiManagementPrincipalsUrl);

    const response = await authenticatedFetch(
      apiManagementPrincipalsUrl,
      'GET',
      authHeader,
      request
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Error fetching principals:', data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Principals proxy error:', error);
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

    console.log('Creating principal:', body);

    const response = await authenticatedFetch(
      apiManagementPrincipalsUrl,
      'POST',
      authHeader,
      request,
      body
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Principal created successfully with credentials');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Create principal proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

