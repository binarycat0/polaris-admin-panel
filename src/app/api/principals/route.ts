import {NextRequest} from 'next/server';
import {apiManagementPrincipalsUrl} from "@/app/constants";
import {handleAuthenticatedRequest} from "@/utils/auth";


export async function GET(request: NextRequest) {
  console.log('Fetching principals from:', apiManagementPrincipalsUrl);
  return handleAuthenticatedRequest(request, apiManagementPrincipalsUrl, 'GET');
}

export async function POST(request: NextRequest) {
  console.log('Creating principal');
  return handleAuthenticatedRequest(request, apiManagementPrincipalsUrl, 'POST');
}

