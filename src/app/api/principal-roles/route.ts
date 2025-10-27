import {NextRequest} from 'next/server';
import {apiManagementPrincipalRolesUrl} from "@/app/constants";
import {handleAuthenticatedRequest} from "@/utils/auth";


export async function GET(request: NextRequest) {
  console.log('Fetching principal roles from:', apiManagementPrincipalRolesUrl);
  return handleAuthenticatedRequest(request, apiManagementPrincipalRolesUrl, 'GET');
}

export async function POST(request: NextRequest) {
  return handleAuthenticatedRequest(request, apiManagementPrincipalRolesUrl, 'POST');
}
