import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogByNameUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";


export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
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

    const {catalogName} = await params;
    const url = apiManagementCatalogByNameUrl(catalogName);
    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({
        error: {
          message: 'Failed to delete catalog',
          type: 'DeleteError',
          code: response.status
        }
      }));
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Catalog deleted successfully');
    return new NextResponse(null, {status: 204});
  } catch (error) {
    console.error('Delete catalog proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

