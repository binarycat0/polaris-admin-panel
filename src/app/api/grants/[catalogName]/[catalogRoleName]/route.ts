import {NextRequest} from 'next/server';
import {apiManagementCatalogRolesGrantsUrl} from "@/app/constants";
import {handleAuthenticatedRequest} from "@/utils/auth";


export async function GET(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
) {
  return handleAuthenticatedRequest(
    request,
    async () => {
      const {catalogName, catalogRoleName} = await params;
      return apiManagementCatalogRolesGrantsUrl(catalogName, catalogRoleName);
    },
    'GET'
  );
}

export async function PUT(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
) {
  return handleAuthenticatedRequest(
    request,
    async () => {
      const {catalogName, catalogRoleName} = await params;
      console.log(`Adding grant to catalog role: ${catalogName}/${catalogRoleName}`);
      return apiManagementCatalogRolesGrantsUrl(catalogName, catalogRoleName);
    },
    'PUT'
  );
}

export async function DELETE(
    request: NextRequest,
    {params}: { params: Promise<{ catalogName: string; catalogRoleName: string }> }
) {
  return handleAuthenticatedRequest(
    request,
    async () => {
      const {catalogName, catalogRoleName} = await params;
      console.log(`Removing grant from catalog role: ${catalogName}/${catalogRoleName}`);
      return apiManagementCatalogRolesGrantsUrl(catalogName, catalogRoleName);
    },
    'DELETE'
  );
}
