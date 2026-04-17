-- CreateEnum
CREATE TYPE "AmbienteSri" AS ENUM ('PRUEBAS', 'PRODUCCION');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDIENTE_AUTORIZACION', 'EMITIDA', 'AUTORIZADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'PARCIAL', 'VENCIDO', 'EN_CONVENIO', 'CONVENIO_PAGADO');

-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('BORRADOR', 'DEFINITIVO', 'ENVIADO');

-- CreateEnum
CREATE TYPE "EstadoSri" AS ENUM ('BORRADOR', 'FIRMADO', 'ENVIADO', 'AUTORIZADO', 'RECHAZADO', 'ERROR');

-- CreateEnum
CREATE TYPE "EstadoPeriodo" AS ENUM ('ABIERTO', 'CERRADO', 'PROCESANDO');

-- CreateEnum
CREATE TYPE "EstadoPrefactura" AS ENUM ('GENERADA', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoCaja" AS ENUM ('ABIERTA', 'CERRADA', 'DESCUADRADA');

-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('CEDULA', 'RUC', 'PASAPORTE', 'CONSUMIDOR_FINAL', 'IDENTIFICACION_EXTRANJERA');

-- CreateEnum
CREATE TYPE "EstadoGenerico" AS ENUM ('ACTIVO', 'INACTIVO', 'SUSPENDIDO');

-- CreateEnum
CREATE TYPE "EstadoConvenio" AS ENUM ('VIGENTE', 'PAGADO', 'INCUMPLIDO');

-- CreateEnum
CREATE TYPE "TipoDetallePago" AS ENUM ('FACTURA', 'CUOTA_CONVENIO', 'PAGO_LIBRE');

-- CreateEnum
CREATE TYPE "EstadoMedidor" AS ENUM ('BODEGA', 'INSTALADO', 'DANADO', 'ESTIMADO', 'BAJA');

-- CreateEnum
CREATE TYPE "TipoNovedad" AS ENUM ('FUGA', 'MEDIDOR_DANADO', 'LECTURA_ERRONEA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoNovedad" AS ENUM ('PENDIENTE', 'EN_REVISION', 'RESUELTA', 'DESCARTADA');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "EstadoConciliacion" AS ENUM ('PENDIENTE', 'CONCILIADO', 'RECHAZADO');

-- CreateEnum
CREATE TYPE "TipoRubro" AS ENUM ('FIJO', 'VARIABLE', 'MULTA', 'OTRO', 'BIEN', 'SERVICIO', 'IMPUESTO');

-- CreateTable
CREATE TABLE "menu_permisos" (
    "menu_permiso_id" SERIAL NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "menu_id" INTEGER NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "menu_permisos_pkey" PRIMARY KEY ("menu_permiso_id")
);

-- CreateTable
CREATE TABLE "menus" (
    "menu_id" SERIAL NOT NULL,
    "menu_padre_id" INTEGER,
    "icono" TEXT,
    "nombre" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "menus_pkey" PRIMARY KEY ("menu_id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "permiso_id" SERIAL NOT NULL,
    "recurso" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("permiso_id")
);

-- CreateTable
CREATE TABLE "perfiles" (
    "perfil_id" SERIAL NOT NULL,
    "primer_nombre" TEXT,
    "apellido" TEXT,
    "telefono" TEXT,
    "avatar" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "perfiles_pkey" PRIMARY KEY ("perfil_id")
);

-- CreateTable
CREATE TABLE "rol_permisos" (
    "rol_permiso_id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "rol_permisos_pkey" PRIMARY KEY ("rol_permiso_id")
);

-- CreateTable
CREATE TABLE "roles_heredados" (
    "rol_heredado_id" SERIAL NOT NULL,
    "rol_padre_id" INTEGER NOT NULL,
    "rol_hijo_id" INTEGER NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "roles_heredados_pkey" PRIMARY KEY ("rol_heredado_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "rol_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("rol_id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "sesion_id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "hash_token_actualizado" TEXT NOT NULL,
    "direccion_ip" TEXT,
    "usuario_agente" TEXT,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("sesion_id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "usuario_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "contrasenia" TEXT NOT NULL,
    "rol_id" INTEGER,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "usuario_permisos" (
    "id_usuario_permiso" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "permitir" BOOLEAN NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "usuario_permisos_pkey" PRIMARY KEY ("id_usuario_permiso")
);

-- CreateTable
CREATE TABLE "empresa" (
    "empresa_id" SERIAL NOT NULL,
    "ruc" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "nombre_comercial" TEXT,
    "direccion_matriz" TEXT NOT NULL,
    "obligado_contabilidad" BOOLEAN NOT NULL DEFAULT false,
    "contribuyente_especial" TEXT,
    "agente_retencion" TEXT,
    "regimen" TEXT,
    "logotipo_url" TEXT,
    "ambiente" "AmbienteSri" NOT NULL DEFAULT 'PRUEBAS',
    "tipo_emision" TEXT NOT NULL DEFAULT '1',
    "certificado_p12" TEXT,
    "password_certificado" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("empresa_id")
);

-- CreateTable
CREATE TABLE "establecimientos" (
    "establecimiento_id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "codigo" VARCHAR(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "establecimientos_pkey" PRIMARY KEY ("establecimiento_id")
);

-- CreateTable
CREATE TABLE "factura_detalle" (
    "id" BIGSERIAL NOT NULL,
    "factura_id" BIGINT NOT NULL,
    "rubro_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL NOT NULL,
    "precio_unitario" DECIMAL NOT NULL,
    "descuento" DECIMAL NOT NULL DEFAULT 0,
    "subtotal" DECIMAL NOT NULL,
    "iva" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "grava_iva" BOOLEAN NOT NULL DEFAULT true,
    "porcentaje_iva" DECIMAL NOT NULL DEFAULT 0,
    "codigo_impuesto_sri" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factura_detalle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "factura_id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "prefactura_id" BIGINT NOT NULL,
    "punto_emision_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "tipo_comprobante_id" INTEGER NOT NULL,
    "forma_pago_id" INTEGER NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "iva" DECIMAL NOT NULL,
    "descuento_total" DECIMAL NOT NULL,
    "total_pagar" DECIMAL NOT NULL,
    "abono" DECIMAL NOT NULL DEFAULT 0,
    "saldo_pendiente" DECIMAL NOT NULL DEFAULT 0,
    "clave_acceso" VARCHAR(49),
    "secuencial" VARCHAR(9) NOT NULL,
    "numero_autorizacion" TEXT,
    "enviado_sri" BOOLEAN NOT NULL DEFAULT false,
    "fecha_enviado_sri" TIMESTAMP(3),
    "xml_firmado" TEXT,
    "xml_autorizado" TEXT,
    "pdf_url" TEXT,
    "respuesta_sri" TEXT,
    "estado_sri" "EstadoSri" NOT NULL DEFAULT 'BORRADOR',
    "estado" "EstadoFactura" NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "creado_por" TEXT,
    "actualizado_por" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("factura_id")
);

-- CreateTable
CREATE TABLE "lote_facturacion" (
    "lote_id" BIGSERIAL NOT NULL,
    "comunidad_id" INTEGER NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "estado" "EstadoLote" NOT NULL DEFAULT 'BORRADOR',
    "total_monto" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "notas" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por" INTEGER,
    "total_emisiones" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lote_facturacion_pkey" PRIMARY KEY ("lote_id")
);

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
    "xml_firmado" TEXT,
    "xml_autorizado" TEXT,
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
    "xml_firmado" TEXT,
    "xml_autorizado" TEXT,
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
CREATE TABLE "periodos_facturacion" (
    "periodo_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3) NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoPeriodo" NOT NULL DEFAULT 'ABIERTO',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periodos_facturacion_pkey" PRIMARY KEY ("periodo_id")
);

-- CreateTable
CREATE TABLE "prefactura_detalle" (
    "prefactura_detalle_id" BIGSERIAL NOT NULL,
    "prefactura_id" BIGINT NOT NULL,
    "rubro_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL NOT NULL,
    "precio_unitario" DECIMAL NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "iva" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "grava_iva" BOOLEAN NOT NULL DEFAULT true,
    "porcentaje_iva" DECIMAL NOT NULL DEFAULT 0,
    "codigo_impuesto_sri" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prefactura_detalle_pkey" PRIMARY KEY ("prefactura_detalle_id")
);

-- CreateTable
CREATE TABLE "prefacturas" (
    "prefactura_id" BIGSERIAL NOT NULL,
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "contrato_id" BIGINT NOT NULL,
    "cliente_id" BIGINT,
    "lote_id" BIGINT,
    "periodo_id" INTEGER NOT NULL,
    "punto_emision_id" INTEGER NOT NULL,
    "lectura_anterior" DECIMAL,
    "lectura_actual" DECIMAL,
    "consumo_m3" DECIMAL,
    "subtotal" DECIMAL NOT NULL,
    "iva" DECIMAL NOT NULL,
    "descuento_total" DECIMAL NOT NULL,
    "total_pagar" DECIMAL NOT NULL,
    "deuda_anterior" DECIMAL NOT NULL DEFAULT 0,
    "saldo_vencido" DECIMAL NOT NULL DEFAULT 0,
    "abono" DECIMAL NOT NULL DEFAULT 0,
    "saldo_actual" DECIMAL NOT NULL DEFAULT 0,
    "meses_atrasado" INTEGER NOT NULL DEFAULT 0,
    "estado" "EstadoPrefactura" NOT NULL DEFAULT 'GENERADA',
    "aprobada_por" TEXT,
    "fecha_aprobacion" TIMESTAMP(3),
    "motivo_rechazo" TEXT,
    "creado_por" TEXT,
    "actualizado_por" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "prefacturas_pkey" PRIMARY KEY ("prefactura_id")
);

-- CreateTable
CREATE TABLE "puntos_emision" (
    "punto_emision_id" SERIAL NOT NULL,
    "establecimiento_id" INTEGER NOT NULL,
    "codigo" VARCHAR(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "secuencial_actual" INTEGER NOT NULL DEFAULT 1,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntos_emision_pkey" PRIMARY KEY ("punto_emision_id")
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
    "xml_firmado" TEXT,
    "xml_autorizado" TEXT,
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

-- CreateTable
CREATE TABLE "sri_forma_pago" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sri_forma_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sri_impuesto" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "codigo_porcentaje" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tarifa" DECIMAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sri_impuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sri_tipo_comprobante" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sri_tipo_comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abono_cliente" (
    "abono_cliente_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT NOT NULL,
    "pago_id" BIGINT,
    "monto_abono" DECIMAL NOT NULL,
    "origen_abono" TEXT NOT NULL,
    "disponible_para_aplicar" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "abono_cliente_pkey" PRIMARY KEY ("abono_cliente_id")
);

-- CreateTable
CREATE TABLE "caja_sesion" (
    "caja_id" BIGSERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_apertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto_apertura" DECIMAL NOT NULL,
    "monto_cierre_sistema" DECIMAL,
    "monto_cierre_real" DECIMAL,
    "novedad_cierre" TEXT,
    "estado" "EstadoCaja" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caja_sesion_pkey" PRIMARY KEY ("caja_id")
);

-- CreateTable
CREATE TABLE "categoria_tarifa" (
    "categoria_tarifa_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "valor_base" DECIMAL(18,6) DEFAULT 0,
    "consumo_minimo_mensual" INTEGER DEFAULT 0,
    "valor_excedente_m3" DECIMAL(18,6) DEFAULT 0,
    "fecha_vigencia_desde" DATE,
    "fecha_vigencia_hasta" DATE,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "categoria_tarifa_pkey" PRIMARY KEY ("categoria_tarifa_id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "cliente_id" BIGSERIAL NOT NULL,
    "apellidos" TEXT NOT NULL,
    "aplica_terceraedad_discapacidad" BOOLEAN NOT NULL DEFAULT false,
    "direccion_domicilio" TEXT,
    "email" TEXT,
    "identificacion" TEXT NOT NULL,
    "es_perfil_validado" BOOLEAN NOT NULL DEFAULT false,
    "nombres" TEXT NOT NULL,
    "razon_social" TEXT,
    "telefono" TEXT,
    "telefono_secundario" TEXT,
    "tipo_identificacion" "TipoIdentificacion" NOT NULL,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "cobrador_sector" (
    "cobrador_id" BIGSERIAL NOT NULL,
    "sector_id" INTEGER,
    "usuario_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "cobrador_sector_pkey" PRIMARY KEY ("cobrador_id")
);

-- CreateTable
CREATE TABLE "comunidades" (
    "comunidad_id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "porcentaje_tasa_seguridad" DECIMAL NOT NULL,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "comunidades_pkey" PRIMARY KEY ("comunidad_id")
);

-- CreateTable
CREATE TABLE "sri_historial_comprobante" (
    "id" BIGSERIAL NOT NULL,
    "comprobante_id" BIGINT NOT NULL,
    "tipo_comprobante" TEXT NOT NULL,
    "estado_anterior" TEXT,
    "estado_nuevo" TEXT NOT NULL,
    "mensaje_sri" TEXT,
    "detalle_error" TEXT,
    "xml_asociado" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER,

    CONSTRAINT "sri_historial_comprobante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "contrato_id" BIGSERIAL NOT NULL,
    "cliente_id" BIGINT NOT NULL,
    "sector_id" INTEGER NOT NULL,
    "categoria_tarifa_id" INTEGER NOT NULL,
    "numero_guia" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "direccion_suministro" TEXT NOT NULL,
    "estado" "EstadoGenerico" NOT NULL,
    "codigo_interno" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("contrato_id")
);

-- CreateTable
CREATE TABLE "convenios" (
    "convenio_id" BIGSERIAL NOT NULL,
    "numero_cuotas" INTEGER NOT NULL,
    "abono_inicial" DECIMAL NOT NULL,
    "contrato_id" BIGINT NOT NULL,
    "deuda_total" DECIMAL NOT NULL,
    "dias_mora_actual" INTEGER NOT NULL,
    "estado_convenio" "EstadoConvenio" NOT NULL,
    "fecha_aprobacion" TIMESTAMP(3),
    "fecha_primer_pago" TIMESTAMP(3) NOT NULL,
    "fecha_proximo_pago" TIMESTAMP(3),
    "monto_pagado_actual" DECIMAL NOT NULL,
    "motivo" TEXT,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "convenios_pkey" PRIMARY KEY ("convenio_id")
);

-- CreateTable
CREATE TABLE "cuota_convenio" (
    "cuota_convenio_id" BIGSERIAL NOT NULL,
    "convenio_id" BIGINT NOT NULL,
    "numero_cuota" INTEGER NOT NULL,
    "valor_cuota" DECIMAL NOT NULL,
    "fecha_vencimiento" TIMESTAMP(3) NOT NULL,
    "estado_convenio" "EstadoConvenio" NOT NULL,
    "fecha_pago" TIMESTAMP(3),
    "monto_pagado" DECIMAL NOT NULL,
    "dias_retraso" INTEGER NOT NULL,
    "interes_mora_aplicado" DECIMAL NOT NULL,
    "pago_completo" BOOLEAN NOT NULL DEFAULT false,
    "fecha_pago_anticipado" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "cuota_convenio_pkey" PRIMARY KEY ("cuota_convenio_id")
);

-- CreateTable
CREATE TABLE "detalle_pago" (
    "detalle_pago_id" BIGSERIAL NOT NULL,
    "pago_id" BIGINT NOT NULL,
    "factura_id" BIGINT,
    "cuota_convenio_id" BIGINT,
    "tipo_pago" "TipoDetallePago" NOT NULL,
    "monto_abonado" DECIMAL NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "detalle_pago_pkey" PRIMARY KEY ("detalle_pago_id")
);

-- CreateTable
CREATE TABLE "lecturas" (
    "lectura_id" BIGSERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "lectura_anterior" DECIMAL NOT NULL,
    "lectura_actual" DECIMAL NOT NULL,
    "consumo_calculado" DECIMAL NOT NULL,
    "borrado_en" TIMESTAMP(3),
    "contrato_id" BIGINT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descripcion_anomalia" TEXT,
    "fecha_validacion" TIMESTAMP(3),
    "foto_url_minio" TEXT,
    "es_validada" BOOLEAN NOT NULL DEFAULT false,
    "lectura_inicial" BOOLEAN NOT NULL,
    "periodo_id" INTEGER NOT NULL,
    "tiene_anomalia" BOOLEAN NOT NULL DEFAULT false,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lecturas_pkey" PRIMARY KEY ("lectura_id")
);

-- CreateTable
CREATE TABLE "medidores" (
    "medidor_id" BIGSERIAL NOT NULL,
    "contrato_id" BIGINT,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "lectura_inicial_medidor" DOUBLE PRECISION NOT NULL,
    "estado" "EstadoMedidor" NOT NULL,
    "fecha_instalacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_baja" TIMESTAMP(3),
    "motivo_baja" TEXT,
    "motivo_cambio" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "medidores_pkey" PRIMARY KEY ("medidor_id")
);

-- CreateTable
CREATE TABLE "novedad_operativa" (
    "novedad_id" BIGSERIAL NOT NULL,
    "lectura_id" BIGINT NOT NULL,
    "observacion" TEXT,
    "tipo" "TipoNovedad" NOT NULL,
    "estado" "EstadoNovedad" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "novedad_operativa_pkey" PRIMARY KEY ("novedad_id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "pago_id" BIGSERIAL NOT NULL,
    "caja_id" BIGINT,
    "cambio" DECIMAL NOT NULL,
    "comprobante_url_minio" TEXT,
    "estado_conciliacion" "EstadoConciliacion" NOT NULL,
    "fecha_pago" TIMESTAMP(3) NOT NULL,
    "monto_total_recibido" DECIMAL NOT NULL,
    "numero_operacion" TEXT,
    "observaciones" TEXT,
    "referencia_banco" TEXT,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "borrado_en" TIMESTAMP(3),
    "usuario_id" INTEGER NOT NULL,
    "metodo_pago" "MetodoPago" NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("pago_id")
);

-- CreateTable
CREATE TABLE "parametro_tasa_interes" (
    "parametro_id" SERIAL NOT NULL,
    "tasa" DOUBLE PRECISION NOT NULL,
    "vigente_desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigente_hasta" TIMESTAMP(3),
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "parametro_tasa_interes_pkey" PRIMARY KEY ("parametro_id")
);

-- CreateTable
CREATE TABLE "rubros" (
    "rubro_id" SERIAL NOT NULL,
    "codigo_sri" TEXT,
    "nombre" TEXT NOT NULL DEFAULT '',
    "descripcion" TEXT NOT NULL,
    "precio_unitario" DECIMAL NOT NULL,
    "tipo_rubro" "TipoRubro" NOT NULL,
    "impuesto_id" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "rubros_pkey" PRIMARY KEY ("rubro_id")
);

-- CreateTable
CREATE TABLE "sectores" (
    "sector_id" SERIAL NOT NULL,
    "comunidad_id" INTEGER,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "borrado_en" TIMESTAMP(3),

    CONSTRAINT "sectores_pkey" PRIMARY KEY ("sector_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_permisos_menu_id_permiso_id_key" ON "menu_permisos"("menu_id", "permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "perfiles_usuario_id_key" ON "perfiles"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "rol_permisos_rol_id_permiso_id_key" ON "rol_permisos"("rol_id", "permiso_id");

-- CreateIndex
CREATE INDEX "roles_heredados_rol_padre_id_idx" ON "roles_heredados"("rol_padre_id");

-- CreateIndex
CREATE INDEX "roles_heredados_rol_hijo_id_idx" ON "roles_heredados"("rol_hijo_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_heredados_rol_padre_id_rol_hijo_id_key" ON "roles_heredados"("rol_padre_id", "rol_hijo_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_idx" ON "sesiones"("usuario_id");

-- CreateIndex
CREATE INDEX "sesiones_expira_en_idx" ON "sesiones"("expira_en");

-- CreateIndex
CREATE INDEX "sesiones_revocado_expira_en_idx" ON "sesiones"("revocado", "expira_en");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_permisos_usuario_id_permiso_id_key" ON "usuario_permisos"("usuario_id", "permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "empresa_ruc_key" ON "empresa"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "establecimientos_empresa_id_codigo_key" ON "establecimientos"("empresa_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_uuid_key" ON "facturas"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_clave_acceso_key" ON "facturas"("clave_acceso");

-- CreateIndex
CREATE INDEX "facturas_prefactura_id_idx" ON "facturas"("prefactura_id");

-- CreateIndex
CREATE INDEX "facturas_periodo_id_idx" ON "facturas"("periodo_id");

-- CreateIndex
CREATE INDEX "facturas_punto_emision_id_idx" ON "facturas"("punto_emision_id");

-- CreateIndex
CREATE INDEX "facturas_tipo_comprobante_id_idx" ON "facturas"("tipo_comprobante_id");

-- CreateIndex
CREATE INDEX "facturas_forma_pago_id_idx" ON "facturas"("forma_pago_id");

-- CreateIndex
CREATE INDEX "facturas_secuencial_idx" ON "facturas"("secuencial");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_punto_emision_id_tipo_comprobante_id_secuencial_key" ON "facturas"("punto_emision_id", "tipo_comprobante_id", "secuencial");

-- CreateIndex
CREATE INDEX "lote_facturacion_comunidad_id_idx" ON "lote_facturacion"("comunidad_id");

-- CreateIndex
CREATE INDEX "lote_facturacion_periodo_id_idx" ON "lote_facturacion"("periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "lote_facturacion_comunidad_id_periodo_id_key" ON "lote_facturacion"("comunidad_id", "periodo_id");

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
CREATE UNIQUE INDEX "periodos_facturacion_nombre_key" ON "periodos_facturacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "prefacturas_uuid_key" ON "prefacturas"("uuid");

-- CreateIndex
CREATE INDEX "prefacturas_periodo_id_idx" ON "prefacturas"("periodo_id");

-- CreateIndex
CREATE INDEX "prefacturas_contrato_id_idx" ON "prefacturas"("contrato_id");

-- CreateIndex
CREATE INDEX "prefacturas_cliente_id_idx" ON "prefacturas"("cliente_id");

-- CreateIndex
CREATE INDEX "prefacturas_punto_emision_id_idx" ON "prefacturas"("punto_emision_id");

-- CreateIndex
CREATE UNIQUE INDEX "prefacturas_contrato_id_periodo_id_key" ON "prefacturas"("contrato_id", "periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "puntos_emision_establecimiento_id_codigo_key" ON "puntos_emision"("establecimiento_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "retenciones_uuid_key" ON "retenciones"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "retenciones_clave_acceso_key" ON "retenciones"("clave_acceso");

-- CreateIndex
CREATE INDEX "retenciones_punto_emision_id_idx" ON "retenciones"("punto_emision_id");

-- CreateIndex
CREATE INDEX "retenciones_periodo_id_idx" ON "retenciones"("periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "sri_forma_pago_codigo_key" ON "sri_forma_pago"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "sri_impuesto_codigo_codigo_porcentaje_key" ON "sri_impuesto"("codigo", "codigo_porcentaje");

-- CreateIndex
CREATE UNIQUE INDEX "sri_tipo_comprobante_codigo_key" ON "sri_tipo_comprobante"("codigo");

-- CreateIndex
CREATE INDEX "abono_cliente_cliente_id_idx" ON "abono_cliente"("cliente_id");

-- CreateIndex
CREATE INDEX "abono_cliente_pago_id_idx" ON "abono_cliente"("pago_id");

-- CreateIndex
CREATE INDEX "abono_cliente_borrado_en_idx" ON "abono_cliente"("borrado_en");

-- CreateIndex
CREATE INDEX "caja_sesion_usuario_id_idx" ON "caja_sesion"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_identificacion_key" ON "clientes"("identificacion");

-- CreateIndex
CREATE INDEX "clientes_nombres_idx" ON "clientes"("nombres");

-- CreateIndex
CREATE INDEX "clientes_borrado_en_idx" ON "clientes"("borrado_en");

-- CreateIndex
CREATE UNIQUE INDEX "cobrador_sector_usuario_id_sector_id_key" ON "cobrador_sector"("usuario_id", "sector_id");

-- CreateIndex
CREATE UNIQUE INDEX "comunidades_codigo_key" ON "comunidades"("codigo");

-- CreateIndex
CREATE INDEX "sri_historial_comprobante_comprobante_id_idx" ON "sri_historial_comprobante"("comprobante_id");

-- CreateIndex
CREATE INDEX "sri_historial_comprobante_fecha_registro_idx" ON "sri_historial_comprobante"("fecha_registro");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_numero_guia_key" ON "contratos"("numero_guia");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_codigo_interno_key" ON "contratos"("codigo_interno");

-- CreateIndex
CREATE INDEX "contratos_cliente_id_idx" ON "contratos"("cliente_id");

-- CreateIndex
CREATE INDEX "contratos_sector_id_idx" ON "contratos"("sector_id");

-- CreateIndex
CREATE INDEX "contratos_categoria_tarifa_id_idx" ON "contratos"("categoria_tarifa_id");

-- CreateIndex
CREATE INDEX "convenios_contrato_id_idx" ON "convenios"("contrato_id");

-- CreateIndex
CREATE INDEX "cuota_convenio_convenio_id_idx" ON "cuota_convenio"("convenio_id");

-- CreateIndex
CREATE INDEX "detalle_pago_pago_id_idx" ON "detalle_pago"("pago_id");

-- CreateIndex
CREATE INDEX "detalle_pago_factura_id_idx" ON "detalle_pago"("factura_id");

-- CreateIndex
CREATE INDEX "detalle_pago_cuota_convenio_id_idx" ON "detalle_pago"("cuota_convenio_id");

-- CreateIndex
CREATE INDEX "lecturas_contrato_id_idx" ON "lecturas"("contrato_id");

-- CreateIndex
CREATE INDEX "lecturas_periodo_id_idx" ON "lecturas"("periodo_id");

-- CreateIndex
CREATE UNIQUE INDEX "medidores_serie_key" ON "medidores"("serie");

-- CreateIndex
CREATE INDEX "pagos_usuario_id_idx" ON "pagos"("usuario_id");

-- CreateIndex
CREATE INDEX "pagos_caja_id_idx" ON "pagos"("caja_id");

-- CreateIndex
CREATE UNIQUE INDEX "rubros_codigo_sri_key" ON "rubros"("codigo_sri");

-- CreateIndex
CREATE INDEX "rubros_impuesto_id_idx" ON "rubros"("impuesto_id");

-- AddForeignKey
ALTER TABLE "menu_permisos" ADD CONSTRAINT "menu_permisos_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("menu_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_permisos" ADD CONSTRAINT "menu_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("permiso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_menu_padre_id_fkey" FOREIGN KEY ("menu_padre_id") REFERENCES "menus"("menu_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfiles" ADD CONSTRAINT "perfiles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("permiso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_rol_hijo_id_fkey" FOREIGN KEY ("rol_hijo_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_heredados" ADD CONSTRAINT "roles_heredados_rol_padre_id_fkey" FOREIGN KEY ("rol_padre_id") REFERENCES "roles"("rol_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("rol_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permisos" ADD CONSTRAINT "usuario_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("permiso_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_permisos" ADD CONSTRAINT "usuario_permisos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "establecimientos" ADD CONSTRAINT "establecimientos_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("empresa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_detalle" ADD CONSTRAINT "factura_detalle_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_detalle" ADD CONSTRAINT "factura_detalle_rubro_id_fkey" FOREIGN KEY ("rubro_id") REFERENCES "rubros"("rubro_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefacturas"("prefactura_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("punto_emision_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "sri_tipo_comprobante"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_forma_pago_id_fkey" FOREIGN KEY ("forma_pago_id") REFERENCES "sri_forma_pago"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lote_facturacion" ADD CONSTRAINT "lote_facturacion_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_facturacion" ADD CONSTRAINT "lote_facturacion_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lote_facturacion" ADD CONSTRAINT "lote_facturacion_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_prefactura_id_fkey" FOREIGN KEY ("prefactura_id") REFERENCES "prefacturas"("prefactura_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefactura_detalle" ADD CONSTRAINT "prefactura_detalle_rubro_id_fkey" FOREIGN KEY ("rubro_id") REFERENCES "rubros"("rubro_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_lote_id_fkey" FOREIGN KEY ("lote_id") REFERENCES "lote_facturacion"("lote_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prefacturas" ADD CONSTRAINT "prefacturas_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("punto_emision_id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "puntos_emision" ADD CONSTRAINT "puntos_emision_establecimiento_id_fkey" FOREIGN KEY ("establecimiento_id") REFERENCES "establecimientos"("establecimiento_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenciones" ADD CONSTRAINT "retenciones_punto_emision_id_fkey" FOREIGN KEY ("punto_emision_id") REFERENCES "puntos_emision"("punto_emision_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenciones" ADD CONSTRAINT "retenciones_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retenciones" ADD CONSTRAINT "retenciones_tipo_comprobante_id_fkey" FOREIGN KEY ("tipo_comprobante_id") REFERENCES "sri_tipo_comprobante"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retencion_detalle" ADD CONSTRAINT "retencion_detalle_retencion_id_fkey" FOREIGN KEY ("retencion_id") REFERENCES "retenciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abono_cliente" ADD CONSTRAINT "abono_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abono_cliente" ADD CONSTRAINT "abono_cliente_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("pago_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caja_sesion" ADD CONSTRAINT "caja_sesion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobrador_sector" ADD CONSTRAINT "cobrador_sector_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("sector_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cobrador_sector" ADD CONSTRAINT "cobrador_sector_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_categoria_tarifa_id_fkey" FOREIGN KEY ("categoria_tarifa_id") REFERENCES "categoria_tarifa"("categoria_tarifa_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("cliente_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectores"("sector_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "convenios" ADD CONSTRAINT "convenios_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuota_convenio" ADD CONSTRAINT "cuota_convenio_convenio_id_fkey" FOREIGN KEY ("convenio_id") REFERENCES "convenios"("convenio_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_cuota_convenio_id_fkey" FOREIGN KEY ("cuota_convenio_id") REFERENCES "cuota_convenio"("cuota_convenio_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("factura_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detalle_pago" ADD CONSTRAINT "detalle_pago_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("pago_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_periodo_id_fkey" FOREIGN KEY ("periodo_id") REFERENCES "periodos_facturacion"("periodo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medidores" ADD CONSTRAINT "medidores_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("contrato_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "novedad_operativa" ADD CONSTRAINT "novedad_operativa_lectura_id_fkey" FOREIGN KEY ("lectura_id") REFERENCES "lecturas"("lectura_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_caja_id_fkey" FOREIGN KEY ("caja_id") REFERENCES "caja_sesion"("caja_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubros" ADD CONSTRAINT "rubros_impuesto_id_fkey" FOREIGN KEY ("impuesto_id") REFERENCES "sri_impuesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sectores" ADD CONSTRAINT "sectores_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE SET NULL ON UPDATE CASCADE;
