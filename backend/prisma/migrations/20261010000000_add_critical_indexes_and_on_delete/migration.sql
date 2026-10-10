-- M8: Índices para queries críticas
-- 1. Contratos.deletedAt para acelerar filtros WHERE borrado_en IS NULL
CREATE INDEX IF NOT EXISTS "contratos_borrado_en_idx" ON "contratos"("borrado_en");

-- 2. Comprobantes.(estadoSri, fechaEmision) para dashboard SRI y reportes
CREATE INDEX IF NOT EXISTS "comprobantes_estado_sri_fecha_emision_idx" ON "comprobantes"("estado_sri", "fecha_emision");

-- 3. MailProviderDailyCount.(usageDate) para búsquedas diarias y cleanup
CREATE INDEX IF NOT EXISTS "mail_provider_daily_counts_usage_date_idx" ON "mail_provider_daily_counts"("usage_date");

-- M5 / M9: Índices para trazabilidad de auditoría en creado_por
CREATE INDEX IF NOT EXISTS "caja_movimientos_creado_por_idx" ON "caja_movimientos"("creado_por");
CREATE INDEX IF NOT EXISTS "historial_medidores_creado_por_idx" ON "historial_medidores"("creado_por");
CREATE INDEX IF NOT EXISTS "reemplazos_medidor_creado_por_idx" ON "reemplazos_medidor"("creado_por");
CREATE INDEX IF NOT EXISTS "periodos_creado_por_idx" ON "periodos"("creado_por");
