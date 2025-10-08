export const apiManagementUrl = process.env.POLARIS_MANAGEMENT_API_URL || "http://localhost:8181/api/management/v1";
export const apiManagementCatalogUrl = apiManagementUrl + "/catalogs";
export const apiManagementCatalogRolesUrl = (catalogName: string) => apiManagementUrl + `/catalogs/${catalogName}/catalog-roles`;
export const apiManagementCatalogRolesPrincipalRolesUrl = (catalogName: string, catalogRoleName: string) => apiManagementUrl + `/catalogs/${catalogName}/catalog-roles/${catalogRoleName}/principal-roles`;
export const apiManagementCatalogRolesGrantsUrl = (catalogName: string, catalogRoleName: string) => apiManagementUrl + `/catalogs/${catalogName}/catalog-roles/${catalogRoleName}/grants`;
export const apiManagementPrincipalsUrl = apiManagementUrl + "/principals";
export const apiManagementPrincipalRolesUrl = apiManagementUrl + "/principal-roles";

export const apiCatalogUrl = process.env.POLARIS_CATALOG_API_URL || "http://localhost:8181/api/catalog/v1";
export const apiCatalogAuthUrl = apiCatalogUrl + "/oauth/tokens"