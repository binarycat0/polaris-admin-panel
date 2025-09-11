export const apiManagementUrl = process.env.POLARIS_MANAGEMENT_API_URL || "http://localhost:8181/api/management/v1";
export const apiManagementCatalogUrl = apiManagementUrl + "/catalogs";

export const apiCatalogUrl = process.env.POLARIS_CATALOG_API_URL || "http://localhost:8181/api/catalog/v1";
export const apiCatalogAuthUrl = apiCatalogUrl + "/oauth/tokens"