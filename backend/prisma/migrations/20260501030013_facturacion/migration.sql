-- CreateTable
CREATE TABLE "notas_credito" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "factura_id" BIGINT NOT NULL,
    "punto_emision_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "tipo_comprobante_id" INTEGER NOT NULL,
    "clave_acceso" TEXT,
    "secuencial" TEXT NOT NULL,
    "numero_autorizacion" TEXT,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "motivo" TEXT NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "iva" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "xml_firmado_url" TEXT,
    "xml_autorizado_url" TEXT,
    "estado_sri" "EstadoSri" NOT NULL DEFAULT 'BORRADOR',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_credito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_credito_detalle" (
    "id" BIGSERIAL NOT NULL,
    "nota_credito_id" BIGINT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL NOT NULL,
    "precio_unitario" DECIMAL NOT NULL,
    "descuento" DECIMAL NOT NULL DEFAULT 0,
    "subtotal" DECIMAL NOT NULL,
    "iva" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,

    CONSTRAINT "notas_credito_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_debito" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "factura_id" BIGINT NOT NULL,
    "punto_emision_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "tipo_comprobante_id" INTEGER NOT NULL,
    "forma_pago_id" INTEGER NOT NULL,
    "clave_acceso" TEXT,
    "secuencial" TEXT NOT NULL,
    "numero_autorizacion" TEXT,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL NOT NULL,
    "iva" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "xml_firmado_url" TEXT,
    "xml_autorizado_url" TEXT,
    "estado_sri" "EstadoSri" NOT NULL DEFAULT 'BORRADOR',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notas_debito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_debito_motivo" (
    "id" BIGSERIAL NOT NULL,
    "nota_debito_id" BIGINT NOT NULL,
    "razon" TEXT NOT NULL,
    "valor" DECIMAL NOT NULL,

    CONSTRAINT "notas_debito_motivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retenciones" (
    "id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "punto_emision_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "tipo_comprobante_id" INTEGER NOT NULL,
    "clave_acceso" TEXT,
    "secuencial" TEXT NOT NULL,
    "numero_autorizacion" TEXT,
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xml_firmado_url" TEXT,
    "xml_autorizado_url" TEXT,
    "estado_sri" "EstadoSri" NOT NULL DEFAULT 'BORRADOR',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retenciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retencion_detalle" (
    "id" BIGSERIAL NOT NULL,
    "retencion_id" BIGINT NOT NULL,
    "codigo_impuesto" TEXT NOT NULL,
    "codigo_retencion" TEXT NOT NULL,
    "base_imponible" DECIMAL NOT NULL,
    "porcentaje_retener" DECIMAL NOT NULL,
    "valor_retenido" DECIMAL NOT NULL,

    CONSTRAINT "retencion_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notas_credito_uuid_key" ON "notas_credito"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "notas_credito_clave_acceso_key" ON "notas_credito"("clave_acceso");

-- CreateIndex
CREATE INDEX "notas_credito_factura_id_idx" ON "notas_credito"("factura_id");

-- CreateIndex
CREATE INDEX "notas_credito_punto_emision_id_idx" ON "notas_credito"("punto_emision_id");

-- CreateIndex
CREATE INDEX "notas_credito_periodo_id_idx" ON "notas_credito"("periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "notas_debito_uuid_key" ON "notas_debito"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "notas_debito_clave_acceso_key" ON "notas_debito"("clave_acceso");

-- CreateIndex
CREATE INDEX "notas_debito_factura_id_idx" ON "notas_debito"("factura_id");

-- CreateIndex
CREATE INDEX "notas_debito_punto_emision_id_idx" ON "notas_debito"("punto_emision_id");

-- CreateIndex
CREATE INDEX "notas_debito_periodo_id_idx" ON "notas_debito"("periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "retenciones_uuid_key" ON "retenciones"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "retenciones_clave_acceso_key" ON "retenciones"("clave_acceso");

-- CreateIndex
CREATE INDEX "retenciones_punto_emision_id_idx" ON "retenciones"("punto_emision_id");

-- CreateIndex
CREATE INDEX "retenciones_periodo_id_idx" ON "retenciones"("periodo_id");

-- AddForeignKey
ALTER TABLE "notas_credito" ADD CONSTRAINT "notas_credito_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_credito" ADD CONSTRAINT "notas_credito_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("punto_emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_credito" ADD CONSTRAINT "notas_credito_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_credito" ADD CONSTRAINT "notas_credito_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "sri_tipo_comprobante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_credito_detalle" ADD CONSTRAINT "notas_credito_detalle_nota_credito_id_fkey" FOREIGN KEY ("nota_credito_id") REFERENCES "notas_credito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_debito" ADD CONSTRAINT "notas_debito_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_debito" ADD CONSTRAINT "notas_debito_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("punto_emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_debito" ADD CONSTRAINT "notas_debito_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_debito" ADD CONSTRAINT "notas_debito_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "sri_tipo_comprobante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_debito" ADD CONSTRAINT "notas_debito_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "sri_forma_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_debito_motivo" ADD CONSTRAINT "notas_debito_motivo_nota_debito_id_fkey" FOREIGN KEY ("nota_debito_id") REFERENCES "notas_debito"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenciones" ADD CONSTRAINT "retenciones_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("punto_emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenciones" ADD CONSTRAINT "retenciones_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenciones" ADD CONSTRAINT "retenciones_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "sri_tipo_comprobante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retencion_detalle" ADD CONSTRAINT "retencion_detalle_retencion_id_fkey" FOREIGN KEY ("retencion_id") REFERENCES "retenciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
