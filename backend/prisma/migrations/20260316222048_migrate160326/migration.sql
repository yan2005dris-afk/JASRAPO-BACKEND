-- CreateTable
CREATE TABLE "menu_permissions" (
    "rol_menus_id" SERIAL NOT NULL,
    "permissions_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_permissions_pkey" PRIMARY KEY ("rol_menus_id")
);

-- CreateTable
CREATE TABLE "menus" (
    "menus_id" SERIAL NOT NULL,
    "menus_parent_id" INTEGER,
    "icon" TEXT,
    "name" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menus_pkey" PRIMARY KEY ("menus_id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "permissions_id" SERIAL NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("permissions_id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "profile_id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "avatar" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "users_id" INTEGER NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "rol_permissions" (
    "rol_permissions_id" SERIAL NOT NULL,
    "roles_id" INTEGER NOT NULL,
    "permissions_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rol_permissions_pkey" PRIMARY KEY ("rol_permissions_id")
);

-- CreateTable
CREATE TABLE "roles_heredados" (
    "roles_heredados_id" SERIAL NOT NULL,
    "parent_role_id" INTEGER NOT NULL,
    "child_role_id" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_heredados_pkey" PRIMARY KEY ("roles_heredados_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "roles_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("roles_id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id_user_permissions" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "permissions_id" INTEGER NOT NULL,
    "allow" BOOLEAN NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id_user_permissions")
);

-- CreateTable
CREATE TABLE "users" (
    "users_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("users_id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "cliente_id" BIGSERIAL NOT NULL,
    "comunidad_id" BIGINT,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "clientes_medidores" (
    "cliente_medidor_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "medidor_id" BIGINT,
    "contrato" TEXT NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "fecha_retiro" TIMESTAMP(3),

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
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "numero_cuotas" INTEGER,
    "monto_cuota" DOUBLE PRECISION,
    "estado" TEXT,

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("convenio_id")
);

-- CreateTable
CREATE TABLE "detalle_factura" (
    "detalle_factura_id" BIGSERIAL NOT NULL,
    "factura_id" BIGINT,
    "descripcion" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "detalle_factura_pkey" PRIMARY KEY ("detalle_factura_id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "factura_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "lectura_id" BIGINT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "mes" TEXT NOT NULL,
    "consumo" DOUBLE PRECISION,
    "tarifa" DOUBLE PRECISION,
    "interes_mora" DOUBLE PRECISION,
    "abono" DOUBLE PRECISION,
    "saldo" DOUBLE PRECISION,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("factura_id")
);

-- CreateTable
CREATE TABLE "lecturas" (
    "lectura_id" BIGSERIAL NOT NULL,
    "cliente_medidor_id" BIGINT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "lectura_anterior" DOUBLE PRECISION NOT NULL,
    "lectura_actual" DOUBLE PRECISION NOT NULL,
    "consumo_calculado" DOUBLE PRECISION,
    "valor_monetario" DOUBLE PRECISION,
    "abono" DOUBLE PRECISION,
    "saldo_pendiente" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),

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
    "fecha" TIMESTAMP(3) NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "metodo_pago" TEXT,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("pago_id")
);

-- CreateTable
CREATE TABLE "solicitudes" (
    "solicitud_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT,
    "tipo_solicitud" TEXT NOT NULL,
    "estado" TEXT,
    "fecha_solicitud" TIMESTAMP(3) NOT NULL,
    "fecha_resolucion" TIMESTAMP(3),

    CONSTRAINT "solicitudes_pkey" PRIMARY KEY ("solicitud_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_users_id_key" ON "profiles"("users_id");

-- CreateIndex
CREATE INDEX "roles_heredados_parent_role_id_idx" ON "roles_heredados"("parent_role_id");

-- CreateIndex
CREATE INDEX "roles_heredados_child_role_id_idx" ON "roles_heredados"("child_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_heredados_parent_role_id_child_role_id_key" ON "roles_heredados"("parent_role_id", "child_role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cedula_key" ON "clientes"("cedula");

-- CreateIndex
CREATE INDEX "clientes_nombre_idx" ON "clientes"("nombre");

-- CreateIndex
CREATE INDEX "clientes_deleted_at_idx" ON "clientes"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_medidores_contrato_key" ON "clientes_medidores"("contrato");

-- CreateIndex
CREATE INDEX "clientes_medidores_cliente_id_idx" ON "clientes_medidores"("cliente_id");

-- CreateIndex
CREATE INDEX "clientes_medidores_fecha_retiro_idx" ON "clientes_medidores"("fecha_retiro");

-- CreateIndex
CREATE UNIQUE INDEX "medidores_codigo_key" ON "medidores"("codigo");

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_permissions_id_fkey" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("permissions_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permissions" ADD CONSTRAINT "menu_permissions_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("menus_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_menus_parent_id_fkey" FOREIGN KEY ("menus_parent_id") REFERENCES "menus"("menus_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permissions" ADD CONSTRAINT "rol_permissions_roles_id_fkey" FOREIGN KEY ("roles_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permissions" ADD CONSTRAINT "rol_permissions_permissions_id_fkey" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("permissions_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_child_role_id_fkey" FOREIGN KEY ("child_role_id") REFERENCES "roles"("roles_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("users_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissions_id_fkey" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("permissions_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("roles_id") ON DELETE SET NULL ON UPDATE CASCADE;

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
