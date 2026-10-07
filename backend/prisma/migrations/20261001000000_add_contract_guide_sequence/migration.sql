-- La secuencia que antes emitía códigos institucionales de medidor ahora
-- controla el correlativo de las guías de contrato. Se conserva su valor para
-- que el contador no retroceda al desplegar el cambio.
ALTER TABLE "secuencia_medidor" RENAME TO "secuencia_contrato";
ALTER TABLE "secuencia_contrato"
    RENAME COLUMN "secuencia_medidor_id" TO "secuencia_contrato_id";
ALTER TABLE "secuencia_contrato"
    RENAME CONSTRAINT "secuencia_medidor_pkey" TO "secuencia_contrato_pkey";
ALTER SEQUENCE "secuencia_medidor_secuencia_medidor_id_seq"
    RENAME TO "secuencia_contrato_secuencia_contrato_id_seq";

ALTER TABLE "secuencia_contrato"
    DROP COLUMN "prefijo",
    ALTER COLUMN "longitud" SET DEFAULT 5,
    ALTER COLUMN "longitud" SET NOT NULL,
    ALTER COLUMN "ultimo_valor" TYPE BIGINT USING "ultimo_valor"::BIGINT,
    ADD CONSTRAINT "secuencia_contrato_nonnegative_value_check"
        CHECK ("ultimo_valor" >= 0);

UPDATE "secuencia_contrato"
SET "longitud" = 5,
    "ultimo_valor" = GREATEST(
        "ultimo_valor",
        COALESCE((SELECT MAX("contrato_id") FROM "contratos"), 0)
    ),
    "actualizado_en" = CURRENT_TIMESTAMP;
