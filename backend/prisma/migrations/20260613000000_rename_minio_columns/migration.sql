-- Rename MinIO-specific column names to generic S3-compatible names
ALTER TABLE "lecturas" RENAME COLUMN "foto_url_minio" TO "foto_url";
ALTER TABLE "lectura_anomalia" RENAME COLUMN "foto_url_minio" TO "foto_url";
ALTER TABLE "pagos" RENAME COLUMN "comprobante_url_minio" TO "comprobante_url";
