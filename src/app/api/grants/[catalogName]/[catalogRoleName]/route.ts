import {NextRequest, NextResponse} from 'next/server';
import {apiManagementCatalogRolesGrantsUrl} from "@/app/constants";
import {getRealmHeadersFromRequest} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
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

    const {catalogName, catalogRoleName} = await params;

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(apiManagementCatalogRolesGrantsUrl(catalogName, catalogRoleName), {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Grants proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
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

    const {catalogName, catalogRoleName} = await params;
    const body = await request.json();

    console.log(`Adding grant to catalog role: ${catalogName}/${catalogRoleName}`);
    console.log(`Request body:`, body);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(apiManagementCatalogRolesGrantsUrl(catalogName, catalogRoleName), {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Add grant proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
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

    const {catalogName, catalogRoleName} = await params;
    const body = await request.json();

    console.log(`Removing grant from catalog role: ${catalogName}/${catalogRoleName}`);
    console.log(`Request body:`, body);

    const realmHeaders = getRealmHeadersFromRequest(request);

    const response = await fetch(apiManagementCatalogRolesGrantsUrl(catalogName, catalogRoleName), {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        ...realmHeaders,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, {status: response.status});
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Remove grant proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}
