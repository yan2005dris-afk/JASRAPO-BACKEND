-- ============================================================
-- Migration: Seed sistema_config reporteria keys
-- Created: 2026-07-02
--
-- Seeds the four keys consumed by the report-style dispatcher with
-- `valor = 'modern'`. The seed is idempotent thanks to
-- `ON CONFLICT (clave) DO NOTHING`, so re-running the migration is a
-- safe no-op and any operator UPDATE between runs is preserved.
--
-- Cache: the application layer caches these keys for 60s in a
-- module-level Map, so toggling a row via SQL takes effect within at
-- most one TTL window without a restart.
-- ============================================================

INSERT INTO sistema_config (clave, valor, descripcion)
VALUES
  ('reporte.estilo.default',            'modern', 'Estilo por defecto para todos los reportes (legacy|modern)'),
  ('reporte.estilo.payments-report',    'modern', 'Estilo del reporte "Reporte de Pagos" (legacy|modern)'),
  ('reporte.estilo.connection-history', 'modern', 'Estilo del reporte "Historial de Conexiones" (legacy|modern)'),
  ('reporte.estilo.payment-agreement',  'modern', 'Estilo del reporte "Convenio de Pago" (legacy|modern)')
ON CONFLICT (clave) DO NOTHING;
