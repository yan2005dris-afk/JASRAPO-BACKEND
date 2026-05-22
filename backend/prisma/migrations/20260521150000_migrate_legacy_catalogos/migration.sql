-- Migration: Replace legacy catalog tables with new catalog tables
-- Replaces: sri_forma_pago → catalogo_formas_pago
--           sri_impuesto → catalogo_impuestos + catalogo_tarifas_impuesto
--           identificacion → catalogo_tipos_identificacion
--           preferencias_sistema → sistema_config
-- Also drops tenant_id columns from auditoria, emisores, webhook_configs
-- (removed from Prisma schema but still in DB)

BEGIN;

-- ============================================================
-- Step 1: Rename column in rubros (Prisma model: impuestoId → tarifaImpuestoId)
-- Instead of ADD + DROP, we RENAME to preserve existing data
-- ============================================================
ALTER TABLE rubros RENAME COLUMN impuesto_id TO tarifa_impuesto_id;

-- ============================================================
-- Step 2: Drop old FK constraints so we can update values and types
-- ============================================================
ALTER TABLE detalle_pago DROP CONSTRAINT IF EXISTS detalle_pago_forma_pago_id_fkey;
ALTER TABLE rubros DROP CONSTRAINT IF EXISTS rubros_impuesto_id_fkey;
ALTER TABLE clientes DROP CONSTRAINT IF EXISTS clientes_tipo_identificacion_id_fkey;

-- Nota: rubros_impuesto_id_fkey es el nombre legacy del FK que apuntaba a sri_impuesto(id).
-- Como renombramos la columna impuesto_id → tarifa_impuesto_id, el nombre del FK no cambia solo.

-- ============================================================
-- Step 3: Ensure new catalog tables have all legacy data
-- ============================================================

-- CatalogoFormasPago: insert any codes from legacy that don't exist yet
INSERT INTO catalogo_formas_pago (codigo, descripcion, activo, created_at)
SELECT sfp.codigo, sfp.nombre, sfp.activo, NOW()
FROM sri_forma_pago sfp
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_formas_pago cfp WHERE cfp.codigo = sfp.codigo
);

-- CatalogoImpuestos: insert distinct impuesto codes from legacy
INSERT INTO catalogo_impuestos (codigo, nombre, activo, created_at, updated_at)
SELECT DISTINCT si.codigo, 'IVA', TRUE, NOW(), NOW()
FROM sri_impuesto si
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_impuestos ci WHERE ci.codigo = si.codigo
);

-- CatalogoTarifasImpuesto: insert tariff details from legacy
INSERT INTO catalogo_tarifas_impuesto (impuesto_id, codigo_porcentaje, descripcion, porcentaje, vigente_desde, activo, created_at, updated_at)
SELECT ci.id, si.codigo_porcentaje, si.nombre, si.tarifa, CURRENT_DATE, si.activo, NOW(), NOW()
FROM sri_impuesto si
JOIN catalogo_impuestos ci ON ci.codigo = si.codigo
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_tarifas_impuesto cti 
  WHERE cti.impuesto_id = ci.id AND cti.codigo_porcentaje = si.codigo_porcentaje
);

-- CatalogoTiposIdentificacion: insert identification types by SRI code
INSERT INTO catalogo_tipos_identificacion (codigo, descripcion, activo, created_at)
SELECT v.codigo, v.descripcion, TRUE, NOW()
FROM (VALUES
  ('04', 'RUC'),
  ('05', 'CÉDULA'),
  ('06', 'PASAPORTE'),
  ('07', 'CONSUMIDOR FINAL'),
  ('08', 'IDENTIFICACIÓN DEL EXTERIOR')
) AS v(codigo, descripcion)
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_tipos_identificacion cti WHERE cti.codigo = v.codigo
);

-- SistemaConfig: transfer preferences
INSERT INTO sistema_config (clave, valor, descripcion, created_at, updated_at)
SELECT clave, valor, descripcion, NOW(), NOW()
FROM preferencias_sistema
WHERE NOT EXISTS (
  SELECT 1 FROM sistema_config sc WHERE sc.clave = preferencias_sistema.clave
);

-- ============================================================
-- Step 4: Update FK column values to point to new catalog entries
-- ============================================================

-- DetallePago: map forma_pago_id from old SriFormaPago IDs to new CatalogoFormasPago IDs
UPDATE detalle_pago dp
SET forma_pago_id = cfp.id
FROM sri_forma_pago sfp
JOIN catalogo_formas_pago cfp ON cfp.codigo = sfp.codigo
WHERE dp.forma_pago_id = sfp.id
  AND sfp.id IS DISTINCT FROM cfp.id;

-- Clientes: alter column type from bigint to integer
ALTER TABLE clientes ALTER COLUMN tipo_identificacion_id TYPE integer USING tipo_identificacion_id::integer;

-- Clientes: map tipo_identificacion_id from old Identificacion to new CatalogoTiposIdentificacion
UPDATE clientes c
SET tipo_identificacion_id = cti.id
FROM identificacion i
JOIN catalogo_tipos_identificacion cti ON 
  cti.codigo = CASE i.codigo
    WHEN 'CEDULA' THEN '05'
    WHEN 'RUC' THEN '04'
    WHEN 'PASAPORTE' THEN '06'
    WHEN 'CONSUMIDOR_FINAL' THEN '07'
    ELSE '08'
  END
WHERE c.tipo_identificacion_id = i.identificacion_id::integer;

-- Rubros: map tarifa_impuesto_id from old SriImpuesto IDs to new CatalogoTarifasImpuesto IDs
UPDATE rubros r
SET tarifa_impuesto_id = cti.id
FROM sri_impuesto si
JOIN catalogo_impuestos ci ON ci.codigo = si.codigo
JOIN catalogo_tarifas_impuesto cti ON cti.impuesto_id = ci.id AND cti.codigo_porcentaje = si.codigo_porcentaje
WHERE r.tarifa_impuesto_id = si.id;

-- ============================================================
-- Step 5: Drop legacy tables + stale columns
-- ============================================================

-- Drop tenant_id columns (removed from Prisma schema but column existed in DB)
DROP INDEX IF EXISTS auditoria_tenant_id_idx;
ALTER TABLE auditoria DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE emisores DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE webhook_configs DROP COLUMN IF EXISTS tenant_id;

-- Drop legacy tables
DROP TABLE IF EXISTS sri_forma_pago CASCADE;
DROP TABLE IF EXISTS sri_impuesto CASCADE;
DROP TABLE IF EXISTS identificacion CASCADE;
DROP TABLE IF EXISTS preferencias_sistema CASCADE;

-- ============================================================
-- Step 6: Add new FK constraints matching Prisma schema
-- ============================================================

ALTER TABLE detalle_pago ADD CONSTRAINT detalle_pago_forma_pago_id_fkey 
  FOREIGN KEY (forma_pago_id) REFERENCES catalogo_formas_pago(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE rubros ADD CONSTRAINT rubros_tarifa_impuesto_id_fkey 
  FOREIGN KEY (tarifa_impuesto_id) REFERENCES catalogo_tarifas_impuesto(id) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE clientes ADD CONSTRAINT clientes_tipo_identificacion_id_fkey 
  FOREIGN KEY (tipo_identificacion_id) REFERENCES catalogo_tipos_identificacion(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Step 7: Rename index to match new column name
-- ============================================================
ALTER INDEX IF EXISTS rubros_impuesto_id_idx RENAME TO rubros_tarifa_impuesto_id_idx;

COMMIT;
