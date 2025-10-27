import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function GET(request: NextRequest) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    console.log('Fetching catalogs from:', apiManagementCatalogUrl);

    const response = await authenticatedFetch(
      apiManagementCatalogUrl,
      'GET',
      authHeader,
      request
    );

    console.log('Backend response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Catalogs proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
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

    console.log('Creating catalog:', body);

    const response = await authenticatedFetch(
      apiManagementCatalogUrl,
      'POST',
      authHeader,
      request,
      body
    );

    console.log('Backend response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create catalog proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}
