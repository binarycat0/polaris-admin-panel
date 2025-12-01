import {NextRequest} from 'next/server';
import {apiManagementCatalogUrl} from "@/app/constants";
import {handleAuthenticatedRequest} from "@/utils/auth";


export async function GET(request: NextRequest) {
  console.log('Fetching catalogs from:', apiManagementCatalogUrl);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  return handleAuthenticatedRequest(request, apiManagementCatalogUrl, 'GET');
}

export async function POST(request: NextRequest) {
  console.log('Creating catalog at:', apiManagementCatalogUrl);
  return handleAuthenticatedRequest(request, apiManagementCatalogUrl, 'POST');
}
