-- CreateTable
CREATE TABLE "ejecuciones_ordenes_trabajo" (
    "ejecucion_id" BIGSERIAL NOT NULL,
    "orden_trabajo_id" BIGINT NOT NULL,
    "estado_sellos" TEXT,
    "hay_fugas" BOOLEAN,
    "confirmacion_retiro_sello" BOOLEAN,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "ejecuciones_ordenes_trabajo_pkey" PRIMARY KEY ("ejecucion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ejecuciones_ordenes_trabajo_orden_trabajo_id_key"
    ON "ejecuciones_ordenes_trabajo"("orden_trabajo_id");

-- AddForeignKey
ALTER TABLE "ejecuciones_ordenes_trabajo"
    ADD CONSTRAINT "ejecuciones_ordenes_trabajo_orden_trabajo_id_fkey"
    FOREIGN KEY ("orden_trabajo_id")
    REFERENCES "ordenes_trabajo"("orden_trabajo_id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
