# [NOT OFFICIAL][WIP] Apache Polaris Catalog Management UI

[NOT OFFICIAL] This is a simple UI to manage your Apache Polaris Instance. 
It is not official and is not supported by the Apache Polaris team. 

[WIP] It is a work in progress and is not ready for production use.

## Demo

[Watch Demo](https://github.com/binarycat0/polaris-admin-panel/releases/download/0.0.1-dev/Screen.Recording.2025-10-13.at.17.38.41.mov)

## Configuring

You can configure the app through ENV variables or .env file.

| Name                       | Description             | Default                                 |
|----------------------------|-------------------------|-----------------------------------------|
| POLARIS_MANAGEMENT_API_URL | Management Endpoint URL | http://localhost:8181/api/management/v1 |
| POLARIS_CATALOG_API_URL    | Catalog Endpoint URL    | http://localhost:8181/api/catalog/v1    |

## USAGE

First, run the server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## DEVELOPMENT

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
