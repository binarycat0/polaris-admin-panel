# [NOT OFFICIAL] Apache Polaris Catalog Management UI

[NOT OFFICIAL] This is a simple UI to manage your Apache Polaris Instance.
It is not official and is not supported by the Apache Polaris team.

A modern web interface for managing Apache Polaris catalogs, principals, and roles with an intuitive UI built with Next.js and Ant Design.

## Demo

[Watch Demo](https://github.com/binarycat0/polaris-admin-panel/releases/download/0.0.1-dev/Screen.Recording.2025-10-13.at.17.38.41.mov)

## Quick Start

### Using Docker

```bash
docker run -d \
  --name polaris-ui \
  -p 3000:3000 \
  -e POLARIS_MANAGEMENT_API_URL=http://your-polaris-host:8181/api/management/v1 \
  -e POLARIS_CATALOG_API_URL=http://your-polaris-host:8181/api/catalog/v1 \
  ghcr.io/binarycat0/apache-polaris-ui:latest
```

### Using Helm

**From GitHub Container Registry (OCI):**
```bash
helm install apache-polaris-ui oci://ghcr.io/binarycat0/apache-polaris-ui \
  --version 0.1.0 \
  --set env.POLARIS_MANAGEMENT_API_URL=http://polaris:8181/api/management/v1 \
  --set env.POLARIS_CATALOG_API_URL=http://polaris:8181/api/catalog/v1
```

**From local chart:**
```bash
git clone https://github.com/binarycat0/polaris-admin-panel.git
cd polaris-admin-panel
helm install apache-polaris-ui ./helm/apache-polaris-ui \
  --set env.POLARIS_MANAGEMENT_API_URL=http://polaris:8181/api/management/v1 \
  --set env.POLARIS_CATALOG_API_URL=http://polaris:8181/api/catalog/v1
```



## Configuration

You can configure the app through ENV variables or .env file.

| Name                       | Description             | Default                                 |
|----------------------------|-------------------------|-----------------------------------------|
| POLARIS_MANAGEMENT_API_URL | Management Endpoint URL | http://localhost:8181/api/management/v1 |
| POLARIS_CATALOG_API_URL    | Catalog Endpoint URL    | http://localhost:8181/api/catalog/v1    |

## Development

### Prerequisites

- Node.js 20 or higher
- npm, yarn, pnpm, or bun

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/binarycat0/polaris-admin-panel.git
cd polaris-admin-panel
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
POLARIS_MANAGEMENT_API_URL=http://localhost:8181/api/management/v1
POLARIS_CATALOG_API_URL=http://localhost:8181/api/catalog/v1
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Deployment

### Docker Deployment

**Using pre-built image:**
```bash
docker pull ghcr.io/binarycat0/apache-polaris-ui:latest

docker run -d \
  --name polaris-ui \
  -p 3000:3000 \
  -e POLARIS_MANAGEMENT_API_URL=http://your-polaris-host:8181/api/management/v1 \
  -e POLARIS_CATALOG_API_URL=http://your-polaris-host:8181/api/catalog/v1 \
  ghcr.io/binarycat0/apache-polaris-ui:latest
```

**Building from source:**
```bash
git clone https://github.com/binarycat0/polaris-admin-panel.git
cd polaris-admin-panel
docker build -t polaris-ui:local .

docker run -d \
  --name polaris-ui \
  -p 3000:3000 \
  -e POLARIS_MANAGEMENT_API_URL=http://your-polaris-host:8181/api/management/v1 \
  -e POLARIS_CATALOG_API_URL=http://your-polaris-host:8181/api/catalog/v1 \
  polaris-ui:local
```

### Kubernetes/Helm Deployment

**Install from GitHub Container Registry (OCI):**
```bash
helm install apache-polaris-ui oci://ghcr.io/binarycat0/apache-polaris-ui \
  --version 0.1.0 \
  --set env.POLARIS_MANAGEMENT_API_URL=http://polaris:8181/api/management/v1 \
  --set env.POLARIS_CATALOG_API_URL=http://polaris:8181/api/catalog/v1
```

**Install from local chart:**
```bash
git clone https://github.com/binarycat0/polaris-admin-panel.git
cd polaris-admin-panel

helm install apache-polaris-ui ./helm/apache-polaris-ui \
  --set env.POLARIS_MANAGEMENT_API_URL=http://polaris:8181/api/management/v1 \
  --set env.POLARIS_CATALOG_API_URL=http://polaris:8181/api/catalog/v1
```

**Customize with values file:**
```yaml
# custom-values.yaml
replicaCount: 2

env:
  POLARIS_MANAGEMENT_API_URL: "http://polaris:8181/api/management/v1"
  POLARIS_CATALOG_API_URL: "http://polaris:8181/api/catalog/v1"

resources:
  limits:
    cpu: 1000m
    memory: 1Gi
  requests:
    cpu: 200m
    memory: 256Mi
```

```bash
helm install apache-polaris-ui ./helm/apache-polaris-ui -f custom-values.yaml
```

**Upgrade:**
```bash
helm upgrade apache-polaris-ui ./helm/apache-polaris-ui -f custom-values.yaml
```

**Uninstall:**
```bash
helm uninstall apache-polaris-ui
```

### Health Check

The application exposes a health check endpoint at `/api/health`

```bash
# Docker
curl http://localhost:3000/api/health

# Kubernetes
kubectl exec -it <pod-name> -- curl http://localhost:3000/api/health
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

See [LICENSE](LICENSE) file for details.
