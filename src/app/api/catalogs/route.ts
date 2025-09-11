import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogUrl} from "@/app/constants";


export async function GET(request: NextRequest) {
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

    console.log('Fetching catalogs from:', apiManagementCatalogUrl);

    const response = await fetch(apiManagementCatalogUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Catalogs proxy error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      apiUrl: apiManagementCatalogUrl
    });
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}
