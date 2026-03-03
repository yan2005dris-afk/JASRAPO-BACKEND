-- CreateTable
CREATE TABLE "clientes" (
    "cliente_id" BIGSERIAL NOT NULL,
    "comunidad_id" BIGINT,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "clientes_medidores" (
    "cliente_medidor_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "medidor_id" BIGINT,
    "fecha_asignacion" DATE NOT NULL,
    "fecha_retiro" DATE,

    CONSTRAINT "clientes_medidores_pkey" PRIMARY KEY ("cliente_medidor_id")
);

-- CreateTable
CREATE TABLE "comunidades" (
    "comunidad_id" BIGSERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "comunidades_pkey" PRIMARY KEY ("comunidad_id")
);

-- CreateTable
CREATE TABLE "convenios" (
    "convenio_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "numero_cuotas" INTEGER,
    "monto_cuota" DECIMAL(65,30),
    "estado" TEXT,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("convenio_id")
);

-- CreateTable
CREATE TABLE "detalle_factura" (
    "detalle_factura_id" BIGSERIAL NOT NULL,
    "factura_id" BIGINT,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "precio_unitario" DECIMAL(65,30) NOT NULL,
    "total" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "detalle_factura_pkey" PRIMARY KEY ("detalle_factura_id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "factura_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "lectura_id" BIGINT,
    "fecha" DATE NOT NULL,
    "mes" TEXT NOT NULL,
    "consumo" DECIMAL(65,30),
    "tarifa" DECIMAL(65,30),
    "interes_mora" DECIMAL(65,30),
    "abono" DECIMAL(65,30),
    "saldo" DECIMAL(65,30),

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("factura_id")
);

-- CreateTable
CREATE TABLE "lecturas" (
    "lectura_id" BIGSERIAL NOT NULL,
    "cliente_medidor_id" BIGINT,
    "fecha" DATE NOT NULL,
    "lectura_anterior" DECIMAL(65,30) NOT NULL,
    "lectura_actual" DECIMAL(65,30) NOT NULL,
    "consumo_calculado" DECIMAL(65,30),
    "valor_monetario" DECIMAL(65,30),
    "abono" DECIMAL(65,30),
    "saldo_pendiente" DECIMAL(65,30),

    CONSTRAINT "lecturas_pkey" PRIMARY KEY ("lectura_id")
);

-- CreateTable
CREATE TABLE "medidores" (
    "medidor_id" BIGSERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medidores_pkey" PRIMARY KEY ("medidor_id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "pago_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "factura_id" BIGINT,
    "fecha" DATE NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "metodo_pago" TEXT,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("pago_id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "solicitud_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "tipo_solicitud" TEXT NOT NULL,
    "estado" TEXT,
    "fecha_solicitud" DATE NOT NULL,
    "fecha_resolucion" DATE,

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("solicitud_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medidores_codigo_key" ON "medidores"("codigo");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_medidores" ADD CONSTRAINT "clientes_medidores_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes_medidores" ADD CONSTRAINT "clientes_medidores_medidor_id_fkey" FOREIGN KEY ("medidor_id") REFERENCES "medidores"("medidor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_factura" ADD CONSTRAINT "detalle_factura_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_lectura_id_fkey" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_cliente_medidor_id_fkey" FOREIGN KEY ("cliente_medidor_id") REFERENCES "clientes_medidores"("cliente_medidor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes" ADD CONSTRAINT "solicitudes_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;
