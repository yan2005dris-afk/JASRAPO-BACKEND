# RustFS Object Storage (backend-db/rustfs-data)

## Local access
- RustFS exposes the S3 API on port 9000 and the web console on port 9001.
- Web console: http://localhost:9001
- Default credentials: controlled by `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` in `.env`

## Why RustFS
- Drop-in S3-compatible replacement for MinIO CE (archived Feb 2026)
- Apache 2.0 license — no AGPL restrictions
- Same ports and API surface, the app SDK requires no changes

## Production security
- Set strong values for `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` in `.env`
- Enable TLS via `RUSTFS_TLS_PATH` if exposing outside the local network
- Never expose port 9000/9001 to the internet without a firewall or reverse proxy
- Back up the `rustfs_data` Docker volume regularly
