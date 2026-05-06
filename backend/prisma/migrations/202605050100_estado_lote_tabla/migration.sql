-- Crear tabla de estados como "tabla quemada"
CREATE TABLE "estado_lote" (
    "estado_id" BIGSERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "actualizado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "estado_lote_pkey" PRIMARY KEY ("estado_id")
);

-- Insertar estados iniciales
INSERT INTO "estado_lote" ("codigo", "nombre", "orden") VALUES
('BORRADOR', 'Borrador', 1),
('DEFINITIVO', 'Definitivo', 2),
('ENVIADO', 'Enviado', 3);

-- Agregar columna FK a la tabla lote (inicialmente nullable)
ALTER TABLE "lote" ADD COLUMN "estado_id" BIGINT;

-- Migrar datos del ENUM a la nueva columna usando JOIN
UPDATE "lote" l SET "estado_id" = e."estado_id"
FROM "estado_lote" e
WHERE l."estado"::text = e."codigo";

-- Hacer la columna NOT NULL
ALTER TABLE "lote" ALTER COLUMN "estado_id" SET NOT NULL;

-- Agregar FK constraint
ALTER TABLE "lote" ADD CONSTRAINT "lote_estado_id_fkey" 
FOREIGN KEY ("estado_id") REFERENCES "estado_lote"("estado_id");