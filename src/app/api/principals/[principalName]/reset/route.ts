import {NextRequest, NextResponse} from 'next/server';
import {apiManagementPrincipalsUrl} from "@/app/constants";
import {authenticatedFetch, getUnauthorizedError, validateAuthHeader} from "@/utils/auth";


export async function POST(
    request: NextRequest,
    {params}: { params: Promise<{ principalName: string }> }
) {
  try {
    const authHeader = validateAuthHeader(request);

    if (!authHeader) {
      return NextResponse.json(getUnauthorizedError(), {status: 401});
    }

    const {principalName} = await params;
    const url = `${apiManagementPrincipalsUrl}/${encodeURIComponent(principalName)}/reset`;

    console.log('Resetting credentials for principal:', principalName);

    const body = await request.json().catch(() => ({}));

    console.log('Reset request body:', body);

    const response = await authenticatedFetch(url, 'POST', authHeader, request, body);

    const data = await response.json();

    if (!response.ok) {
      console.error('Backend error response:', data);
      return NextResponse.json(data, {status: response.status});
    }

    console.log('Credentials reset successfully');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Reset credentials proxy error:', error);
    return NextResponse.json(
        {error: {message: 'Internal server error', type: 'InternalServerError', code: 500}},
        {status: 500}
    );
  }
}

