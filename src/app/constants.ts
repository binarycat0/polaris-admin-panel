export const apiManagementUrl = process.env.POLARIS_MANAGEMENT_API_URL || "http://localhost:8181/api/management/v1";
export const apiManagementCatalogUrl = apiManagementUrl + "/catalogs";
export const apiManagementCatalogByNameUrl = (catalogName: string) => apiManagementUrl + `/catalogs/${catalogName}`;
export const apiManagementCatalogRolesUrl = (catalogName: string) => apiManagementUrl + `/catalogs/${catalogName}/catalog-roles`;
export const apiManagementCatalogRoleUrl = (catalogName: string, catalogRoleName: string) => apiManagementUrl + `/catalogs/${catalogName}/catalog-roles/${catalogRoleName}`;
export const apiManagementCatalogRolesPrincipalRolesUrl = (catalogName: string, catalogRoleName: string) => apiManagementUrl + `/catalogs/${catalogName}/catalog-roles/${catalogRoleName}/principal-roles`;
export const apiManagementCatalogRolesGrantsUrl = (catalogName: string, catalogRoleName: string) => apiManagementUrl + `/catalogs/${catalogName}/catalog-roles/${catalogRoleName}/grants`;
export const apiManagementPrincipalsUrl = apiManagementUrl + "/principals";
export const apiManagementPrincipalRolesUrl = apiManagementUrl + "/principal-roles";
export const apiManagementPrincipalPrincipalRolesUrl = (principalName: string) => apiManagementUrl + `/principals/${principalName}/principal-roles`;
export const apiManagementPrincipalRolePrincipalsUrl = (principalRoleName: string) => apiManagementUrl + `/principal-roles/${principalRoleName}/principals`;
export const apiManagementPrincipalRoleCatalogRolesUrl = (principalRoleName: string, catalogName: string) => apiManagementUrl + `/principal-roles/${principalRoleName}/catalog-roles/${catalogName}`;
export const apiManagementPrincipalRoleCatalogRoleUrl = (principalRoleName: string, catalogName: string, catalogRoleName: string) => apiManagementUrl + `/principal-roles/${principalRoleName}/catalog-roles/${catalogName}/${catalogRoleName}`;

export const apiCatalogUrl = process.env.POLARIS_CATALOG_API_URL || "http://localhost:8181/api/catalog/v1";
export const apiCatalogAuthUrl = apiCatalogUrl + "/oauth/tokens"