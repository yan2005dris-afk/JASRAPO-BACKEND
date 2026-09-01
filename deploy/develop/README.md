# JASRAPO-BACKEND develop deployment

This is the first minimal GitOps layout for the `develop` branch. It contains PostgreSQL, RustFS, and the backend API. The backend image is published by GitHub Actions as `ghcr.io/yan2005dris-afk/jasrapo-backend:develop`.

## Manual bootstrap (intentionally not managed by Git)

`jasrapo-backend-runtime` must exist before syncing this application. Do not add a Secret manifest or credentials to Git. The following command generates random application/database/storage credentials locally and sends them directly to the cluster; review it and run it from a trusted shell:

```sh
NS=jasrapo-backend
DB_USER=appuser
DB_NAME=appdb
DB_PASSWORD="$(openssl rand -hex 24)"
STORAGE_ACCESS_KEY="$(openssl rand -hex 16)"
STORAGE_SECRET_KEY="$(openssl rand -hex 32)"
JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
JWT_REFRESH_SECRET="$(openssl rand -hex 32)"
ENCRYPTION_KEY="$(openssl rand -hex 32)"
kubectl -n "$NS" create secret generic jasrapo-backend-runtime \
  --from-literal=POSTGRES_USER="$DB_USER" \
  --from-literal=POSTGRES_PASSWORD="$DB_PASSWORD" \
  --from-literal=POSTGRES_DB="$DB_NAME" \
  --from-literal=DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@postgres-primary:5432/${DB_NAME}" \
  --from-literal=STORAGE_ACCESS_KEY="$STORAGE_ACCESS_KEY" \
  --from-literal=STORAGE_SECRET_KEY="$STORAGE_SECRET_KEY" \
  --from-literal=JWT_ACCESS_SECRET="$JWT_ACCESS_SECRET" \
  --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
  --from-literal=ENCRYPTION_KEY="$ENCRYPTION_KEY"
unset DB_PASSWORD STORAGE_ACCESS_KEY STORAGE_SECRET_KEY JWT_ACCESS_SECRET JWT_REFRESH_SECRET ENCRYPTION_KEY
```

The application source requires `DATABASE_URL`, `STORAGE_ACCESS_KEY`, and `STORAGE_SECRET_KEY` to start. The JWT and encryption keys above cover the security configuration used by this deployment; add any other application-specific settings required by the selected environment to the same existing Secret. PostgreSQL and RustFS consume their credentials from this Secret too.

`STORAGE_USE_SSL=false` and `STORAGE_SSL_VERIFY=false` are deliberate develop-only settings because this minimal RustFS service has no TLS configuration. The application refuses this posture when `NODE_ENV=production`; configure TLS and use verified HTTPS before promoting this layout.

## Storage prerequisite

Both StatefulSets request `storageClassName: local-path` explicitly. This repository does **not** install a cluster-wide provisioner. Install/configure the cluster's Local Path provisioner first, or change that field through a reviewed environment-specific manifest. The PVC requests are 20Gi for PostgreSQL and 50Gi for RustFS.

## Argo CD bootstrap

After the Secret exists and the repository is registered in Argo CD, apply the Application manifest from a workstation with access to the Argo CD control-plane namespace:

```sh
kubectl apply -f argocd/applications/jasrapo-backend-develop.yaml
```

The Application targets `develop` at `deploy/develop`, creates the `jasrapo-backend` namespace, and enables automated sync, prune, and self-heal. The backend Service is cluster-internal; no Ingress is included because no DNS hostname was supplied. Expose it intentionally through the cluster's edge routing after selecting a hostname.

The backend Pod references the out-of-band image pull Secret `ghcr-pull` because this GHCR package is private. Create that Secret before syncing; never commit a registry token.
