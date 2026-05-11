-- =============================================================================
-- Migración en 3 fases para reemplazar enum EstadoConvenio por tablas de catálogo
-- sin pérdida de datos ni fallo en tablas con filas existentes.
--
-- FASE 1: Crear tablas de catálogo + columnas FK nullable
-- FASE 2: Poblar FKs según el valor del enum anterior
-- FASE 3: Hacer las columnas NOT NULL, crear índices/FK y eliminar enum/columna vieja
-- =============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- FASE 1 – Tablas de catálogo + columnas FK nullable + ajuste de tipos Decimal
-- ══════════════════════════════════════════════════════════════════════════════

-- CreateTable estado_convenio
CREATE TABLE "estado_convenio" (
    "estado_convenio_id" BIGSERIAL NOT NULL,
    "codigo"             TEXT NOT NULL,
    "nombre"             TEXT NOT NULL,
    "descripcion"        TEXT,
    "activo"             BOOLEAN NOT NULL DEFAULT true,
    "orden"              INTEGER NOT NULL DEFAULT 0,
    "actualizado_en"     TIMESTAMP(3) NOT NULL,
    "creado_en"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_convenio_pkey" PRIMARY KEY ("estado_convenio_id")
);

-- CreateTable estado_cuota_convenio
CREATE TABLE "estado_cuota_convenio" (
    "estado_cuota_convenio_id" BIGSERIAL NOT NULL,
    "codigo"                   TEXT NOT NULL,
    "nombre"                   TEXT NOT NULL,
    "descripcion"              TEXT,
    "activo"                   BOOLEAN NOT NULL DEFAULT true,
    "orden"                    INTEGER NOT NULL DEFAULT 0,
    "actualizado_en"           TIMESTAMP(3) NOT NULL,
    "creado_en"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estado_cuota_convenio_pkey" PRIMARY KEY ("estado_cuota_convenio_id")
);

-- Unique + índices de catálogos
CREATE UNIQUE INDEX "estado_convenio_codigo_key"        ON "estado_convenio"("codigo");
CREATE INDEX        "estado_convenio_codigo_idx"        ON "estado_convenio"("codigo");
CREATE INDEX        "estado_convenio_activo_idx"        ON "estado_convenio"("activo");

CREATE UNIQUE INDEX "estado_cuota_convenio_codigo_key"  ON "estado_cuota_convenio"("codigo");
CREATE INDEX        "estado_cuota_convenio_codigo_idx"  ON "estado_cuota_convenio"("codigo");
CREATE INDEX        "estado_cuota_convenio_activo_idx"  ON "estado_cuota_convenio"("activo");

-- Añadir columnas FK como NULLABLE (permite poblarlas antes de hacer NOT NULL)
ALTER TABLE "convenios"      ADD COLUMN "estado_convenio_id"       BIGINT;
ALTER TABLE "cuota_convenio" ADD COLUMN "estado_cuota_convenio_id" BIGINT;

-- Ajustar tipos Decimal (seguro en cualquier momento, sin pérdida si los valores
-- ya caben en Decimal(18,2), que es un superconjunto del Decimal sin escala)
ALTER TABLE "convenios"
    ALTER COLUMN "abono_inicial"      SET DATA TYPE DECIMAL(18,2),
    ALTER COLUMN "deuda_total"        SET DATA TYPE DECIMAL(18,2),
    ALTER COLUMN "monto_pagado_actual" SET DATA TYPE DECIMAL(18,2);

ALTER TABLE "cuota_convenio"
    ALTER COLUMN "valor_cuota"            SET DATA TYPE DECIMAL(18,2),
    ALTER COLUMN "monto_pagado"           SET DEFAULT 0,
    ALTER COLUMN "monto_pagado"           SET DATA TYPE DECIMAL(18,2),
    ALTER COLUMN "dias_retraso"           SET DEFAULT 0,
    ALTER COLUMN "interes_mora_aplicado"  SET DEFAULT 0,
    ALTER COLUMN "interes_mora_aplicado"  SET DATA TYPE DECIMAL(18,2),
    ALTER COLUMN "saldo_pendiente"        SET DATA TYPE DECIMAL(18,2);

-- ══════════════════════════════════════════════════════════════════════════════
-- FASE 2 – Seed de catálogos + backfill de FKs desde el enum anterior
-- ══════════════════════════════════════════════════════════════════════════════

-- Poblar catálogo de estados de convenio (refleja los valores del enum original)
INSERT INTO "estado_convenio" ("codigo", "nombre", "descripcion", "activo", "orden", "actualizado_en")
VALUES
    ('PREPARADO',      'Preparado',         'Convenio creado, pendiente de activación',          true, 1, NOW()),
    ('PENDIENTE_ABONO','Pendiente de Abono','Convenio requiere pago del abono inicial',           true, 2, NOW()),
    ('ACTIVO',         'Activo',            'Convenio en curso con cuotas vigentes',             true, 3, NOW()),
    ('CUMPLIDO',       'Cumplido',          'Todas las cuotas han sido pagadas',                 true, 4, NOW()),
    ('ANULADO',        'Anulado',           'Convenio anulado antes de su cumplimiento',         true, 5, NOW()),
    ('VENCIDO',        'Vencido',           'Convenio con cuotas vencidas sin pago',             true, 6, NOW())
ON CONFLICT ("codigo") DO NOTHING;

-- Poblar catálogo de estados de cuota de convenio
INSERT INTO "estado_cuota_convenio" ("codigo", "nombre", "descripcion", "activo", "orden", "actualizado_en")
VALUES
    ('PENDIENTE',   'Pendiente',   'Cuota pendiente de pago',              true, 1, NOW()),
    ('PAGADA',      'Pagada',      'Cuota pagada en su totalidad',         true, 2, NOW()),
    ('VENCIDA',     'Vencida',     'Cuota vencida sin pago registrado',    true, 3, NOW()),
    ('ANULADA',     'Anulada',     'Cuota anulada junto al convenio',      true, 4, NOW()),
    ('ANTICIPADA',  'Anticipada',  'Cuota pagada de forma anticipada',     true, 5, NOW())
ON CONFLICT ("codigo") DO NOTHING;

-- Backfill: asignar estado_convenio_id a partir del valor del enum anterior
-- El enum original tenía: PREPARADO, PENDIENTE_ABONO, ACTIVO, CUMPLIDO, ANULADO, VENCIDO
UPDATE "convenios" c
SET "estado_convenio_id" = ec."estado_convenio_id"
FROM "estado_convenio" ec
WHERE ec."codigo" = c."estado_convenio"::TEXT;

-- Backfill: asignar estado_cuota_convenio_id a partir del enum anterior en cuota_convenio
UPDATE "cuota_convenio" cc
SET "estado_cuota_convenio_id" = ecc."estado_cuota_convenio_id"
FROM "estado_cuota_convenio" ecc
WHERE ecc."codigo" = cc."estado_convenio"::TEXT;

-- Guardia de seguridad: fallar explícitamente si quedaron filas sin backfill
-- (evita silenciosamente violar NOT NULL en la fase siguiente)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "convenios"      WHERE "estado_convenio_id"       IS NULL) THEN
        RAISE EXCEPTION 'Backfill incompleto: hay filas en convenios sin estado_convenio_id. Revisar valores del enum.';
    END IF;
    IF EXISTS (SELECT 1 FROM "cuota_convenio" WHERE "estado_cuota_convenio_id" IS NULL) THEN
        RAISE EXCEPTION 'Backfill incompleto: hay filas en cuota_convenio sin estado_cuota_convenio_id. Revisar valores del enum.';
    END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- FASE 3 – NOT NULL, FKs, índices y eliminación del enum/columna antigua
-- ══════════════════════════════════════════════════════════════════════════════

-- Hacer NOT NULL ahora que todas las filas tienen valor
ALTER TABLE "convenios"      ALTER COLUMN "estado_convenio_id"       SET NOT NULL;
ALTER TABLE "cuota_convenio" ALTER COLUMN "estado_cuota_convenio_id" SET NOT NULL;

-- Índices de FK en tablas principales
CREATE INDEX "convenios_estado_convenio_id_idx"            ON "convenios"("estado_convenio_id");
CREATE INDEX "cuota_convenio_estado_cuota_convenio_id_idx" ON "cuota_convenio"("estado_cuota_convenio_id");

-- Claves foráneas
ALTER TABLE "convenios"
    ADD CONSTRAINT "convenios_estado_convenio_id_fkey"
    FOREIGN KEY ("estado_convenio_id")
    REFERENCES "estado_convenio"("estado_convenio_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cuota_convenio"
    ADD CONSTRAINT "cuota_convenio_estado_cuota_convenio_id_fkey"
    FOREIGN KEY ("estado_cuota_convenio_id")
    REFERENCES "estado_cuota_convenio"("estado_cuota_convenio_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Eliminar columnas enum antiguas
ALTER TABLE "convenios"      DROP COLUMN "estado_convenio";
ALTER TABLE "cuota_convenio" DROP COLUMN "estado_convenio";

-- Eliminar el tipo enum (solo después de que ninguna tabla lo referencie)
DROP TYPE IF EXISTS "EstadoConvenio";
