import {NextRequest} from 'next/server';
import {apiManagementCatalogRolesUrl} from "@/app/constants";
import {handleAuthenticatedRequest} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
  return handleAuthenticatedRequest(
    request,
    async () => {
      const {catalogName} = await params;
      return apiManagementCatalogRolesUrl(catalogName);
    },
    'GET'
  );
}

export async function POST(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string }> }
) {
  return handleAuthenticatedRequest(
    request,
    async () => {
      const {catalogName} = await params;
      return apiManagementCatalogRolesUrl(catalogName);
    },
    'POST'
  );
}
