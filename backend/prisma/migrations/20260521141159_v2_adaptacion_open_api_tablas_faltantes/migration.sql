-- CreateTable
CREATE TABLE "sistema_config" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sistema_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_documentos_sustento" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_documentos_sustento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_formas_pago" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_formas_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_impuestos" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(300),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_impuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_motivos_traslado" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "descripcion" VARCHAR(200) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_motivos_traslado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_retenciones" (
    "id" SERIAL NOT NULL,
    "tipo" VARCHAR(10) NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL,
    "vigente_desde" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigente_hasta" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_retenciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_tarifas_impuesto" (
    "id" SERIAL NOT NULL,
    "impuesto_id" INTEGER NOT NULL,
    "codigo_porcentaje" VARCHAR(4) NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,
    "porcentaje" DECIMAL(5,2) NOT NULL,
    "vigente_desde" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigente_hasta" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalogo_tarifas_impuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalogo_tipos_identificacion" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(2) NOT NULL,
    "descripcion" VARCHAR(100) NOT NULL,
    "longitud" INTEGER,
    "regex_validacion" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_tipos_identificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sistema_config_clave_key" ON "sistema_config"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_documentos_sustento_codigo_key" ON "catalogo_documentos_sustento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_formas_pago_codigo_key" ON "catalogo_formas_pago"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_impuestos_codigo_key" ON "catalogo_impuestos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_motivos_traslado_codigo_key" ON "catalogo_motivos_traslado"("codigo");

-- CreateIndex
CREATE INDEX "catalogo_retenciones_tipo_idx" ON "catalogo_retenciones"("tipo");

-- CreateIndex
CREATE INDEX "catalogo_retenciones_codigo_idx" ON "catalogo_retenciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_retenciones_tipo_codigo_vigente_desde_key" ON "catalogo_retenciones"("tipo", "codigo", "vigente_desde");

-- CreateIndex
CREATE INDEX "catalogo_tarifas_impuesto_vigente_desde_vigente_hasta_idx" ON "catalogo_tarifas_impuesto"("vigente_desde", "vigente_hasta");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_tarifas_impuesto_impuesto_id_codigo_porcentaje_vig_key" ON "catalogo_tarifas_impuesto"("impuesto_id", "codigo_porcentaje", "vigente_desde");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_tipos_identificacion_codigo_key" ON "catalogo_tipos_identificacion"("codigo");

-- AddForeignKey
ALTER TABLE "catalogo_tarifas_impuesto" ADD CONSTRAINT "catalogo_tarifas_impuesto_impuesto_id_fkey" FOREIGN KEY ("impuesto_id") REFERENCES "catalogo_impuestos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
