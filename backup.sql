--
-- PostgreSQL database dump
--

\restrict kXpDYpLpRGCyAAVESa7jo7VDg4XwyaFKYcasSstdRFlppMfaC738bFma7rBjaS4

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: appuser
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO appuser;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: appuser
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AmbienteSri; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."AmbienteSri" AS ENUM (
    'PRUEBAS',
    'PRODUCCION'
);


ALTER TYPE public."AmbienteSri" OWNER TO appuser;

--
-- Name: EstadoCaja; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoCaja" AS ENUM (
    'ABIERTA',
    'CERRADA',
    'DESCUADRADA'
);


ALTER TYPE public."EstadoCaja" OWNER TO appuser;

--
-- Name: EstadoConvenio; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoConvenio" AS ENUM (
    'PREPARADO',
    'PENDIENTE_ABONO',
    'ACTIVO',
    'INCUMPLIDO',
    'FINALIZADO',
    'ANULADO'
);


ALTER TYPE public."EstadoConvenio" OWNER TO appuser;

--
-- Name: EstadoGenerico; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoGenerico" AS ENUM (
    'SOLICITUD',
    'PENDIENTE_PAGO',
    'PENDIENTE_INSTALACION',
    'ACTIVO',
    'EN_MORA',
    'ORDEN_CORTE',
    'SUSPENDIDO',
    'EN_CONVENIO',
    'RETIRADO'
);


ALTER TYPE public."EstadoGenerico" OWNER TO appuser;

--
-- Name: EstadoLectura; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoLectura" AS ENUM (
    'PENDIENTE',
    'POR_REVISION',
    'APROBADA',
    'RECHAZADA_VERIFICACION',
    'ESTIMADA',
    'PLANILLADA'
);


ALTER TYPE public."EstadoLectura" OWNER TO appuser;

--
-- Name: EstadoLote; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoLote" AS ENUM (
    'BORRADOR',
    'DEFINITIVO',
    'ENVIADO'
);


ALTER TYPE public."EstadoLote" OWNER TO appuser;

--
-- Name: EstadoMedidor; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoMedidor" AS ENUM (
    'BODEGA',
    'INSTALADO',
    'DANADO',
    'ESTIMADO',
    'BAJA'
);


ALTER TYPE public."EstadoMedidor" OWNER TO appuser;

--
-- Name: EstadoNovedad; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoNovedad" AS ENUM (
    'PENDIENTE',
    'EN_REVISION',
    'RESUELTA',
    'DESCARTADA'
);


ALTER TYPE public."EstadoNovedad" OWNER TO appuser;

--
-- Name: EstadoPago; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoPago" AS ENUM (
    'PENDIENTE',
    'PAGADO',
    'PARCIAL',
    'VENCIDO',
    'EN_CONVENIO',
    'CONVENIO_PAGADO',
    'ANULADO'
);


ALTER TYPE public."EstadoPago" OWNER TO appuser;

--
-- Name: EstadoPeriodo; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoPeriodo" AS ENUM (
    'ABIERTO',
    'CERRADO',
    'PROCESANDO'
);


ALTER TYPE public."EstadoPeriodo" OWNER TO appuser;

--
-- Name: EstadoPrefactura; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoPrefactura" AS ENUM (
    'GENERADA',
    'EN_REVISION',
    'APROBADA',
    'RECHAZADA',
    'ANULADA',
    'PAGADA'
);


ALTER TYPE public."EstadoPrefactura" OWNER TO appuser;

--
-- Name: EstadoSri; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoSri" AS ENUM (
    'BORRADOR',
    'FIRMADO',
    'ENVIADO',
    'AUTORIZADO',
    'RECHAZADO',
    'ERROR',
    'ANULADA'
);


ALTER TYPE public."EstadoSri" OWNER TO appuser;

--
-- Name: EstadoValidacionPago; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoValidacionPago" AS ENUM (
    'REPORTADO',
    'VALIDANDO',
    'APROBADO',
    'RECHAZADO',
    'CONCILIADO'
);


ALTER TYPE public."EstadoValidacionPago" OWNER TO appuser;

--
-- Name: TipoDescuento; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."TipoDescuento" AS ENUM (
    'TERCERA_EDAD',
    'DISCAPACIDAD',
    'INTERES_MORA',
    'EXENCION_TASA',
    'CONVENIO',
    'OTROS'
);


ALTER TYPE public."TipoDescuento" OWNER TO appuser;

--
-- Name: TipoDetallePago; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."TipoDetallePago" AS ENUM (
    'FACTURA',
    'CUOTA_CONVENIO',
    'PAGO_LIBRE',
    'NOTA_DEBITO',
    'SALDO_FAVOR'
);


ALTER TYPE public."TipoDetallePago" OWNER TO appuser;

--
-- Name: TipoIdentificacion; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."TipoIdentificacion" AS ENUM (
    'CEDULA',
    'RUC',
    'PASAPORTE',
    'CONSUMIDOR_FINAL',
    'IDENTIFICACION_EXTRANJERA'
);


ALTER TYPE public."TipoIdentificacion" OWNER TO appuser;

--
-- Name: TipoNovedad; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."TipoNovedad" AS ENUM (
    'FUGA',
    'MEDIDOR_DANADO',
    'LECTURA_ERRONEA',
    'OTRO'
);


ALTER TYPE public."TipoNovedad" OWNER TO appuser;

--
-- Name: TipoOrigenAbono; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."TipoOrigenAbono" AS ENUM (
    'PAGO_EXCESO',
    'AJUSTE_RECLAMO',
    'OTROS'
);


ALTER TYPE public."TipoOrigenAbono" OWNER TO appuser;

--
-- Name: TipoRubro; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."TipoRubro" AS ENUM (
    'FIJO',
    'VARIABLE',
    'MULTA',
    'OTRO',
    'BIEN',
    'SERVICIO'
);


ALTER TYPE public."TipoRubro" OWNER TO appuser;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO appuser;

--
-- Name: caja_arqueo_detalle; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.caja_arqueo_detalle (
    id integer NOT NULL,
    caja_id bigint NOT NULL,
    denominacion numeric(10,2) NOT NULL,
    cantidad integer NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    es_moneda boolean DEFAULT false NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.caja_arqueo_detalle OWNER TO appuser;

--
-- Name: caja_arqueo_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.caja_arqueo_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caja_arqueo_detalle_id_seq OWNER TO appuser;

--
-- Name: caja_arqueo_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.caja_arqueo_detalle_id_seq OWNED BY public.caja_arqueo_detalle.id;


--
-- Name: caja_sesion; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.caja_sesion (
    caja_id bigint NOT NULL,
    usuario_id integer NOT NULL,
    fecha_apertura timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    monto_apertura numeric NOT NULL,
    monto_cierre_sistema numeric,
    monto_cierre_real numeric,
    novedad_cierre text,
    estado public."EstadoCaja" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    total_cheques_declarados numeric DEFAULT 0,
    total_transferencias_declaradas numeric DEFAULT 0
);


ALTER TABLE public.caja_sesion OWNER TO appuser;

--
-- Name: caja_sesion_caja_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.caja_sesion_caja_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.caja_sesion_caja_id_seq OWNER TO appuser;

--
-- Name: caja_sesion_caja_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.caja_sesion_caja_id_seq OWNED BY public.caja_sesion.caja_id;


--
-- Name: catalogo_descuento; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.catalogo_descuento (
    catalogo_descuento_id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    tipo_descuento public."TipoDescuento" NOT NULL,
    valor numeric(12,4) NOT NULL,
    es_porcentaje boolean DEFAULT true NOT NULL,
    rubro_id integer,
    activo boolean DEFAULT true NOT NULL,
    aplica_automatico boolean DEFAULT false NOT NULL
);


ALTER TABLE public.catalogo_descuento OWNER TO appuser;

--
-- Name: catalogo_descuento_catalogo_descuento_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.catalogo_descuento_catalogo_descuento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.catalogo_descuento_catalogo_descuento_id_seq OWNER TO appuser;

--
-- Name: catalogo_descuento_catalogo_descuento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.catalogo_descuento_catalogo_descuento_id_seq OWNED BY public.catalogo_descuento.catalogo_descuento_id;


--
-- Name: categoria_tarifa; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.categoria_tarifa (
    categoria_tarifa_id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    valor_base numeric(18,6) DEFAULT 0,
    consumo_minimo_mensual integer DEFAULT 0,
    valor_excedente_m3 numeric(18,6) DEFAULT 0,
    fecha_vigencia_desde date,
    fecha_vigencia_hasta date,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.categoria_tarifa OWNER TO appuser;

--
-- Name: categoria_tarifa_categoria_tarifa_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.categoria_tarifa_categoria_tarifa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categoria_tarifa_categoria_tarifa_id_seq OWNER TO appuser;

--
-- Name: categoria_tarifa_categoria_tarifa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.categoria_tarifa_categoria_tarifa_id_seq OWNED BY public.categoria_tarifa.categoria_tarifa_id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.clientes (
    cliente_id bigint NOT NULL,
    apellidos text NOT NULL,
    direccion_domicilio text,
    email text,
    identificacion text NOT NULL,
    nombres text NOT NULL,
    razon_social text,
    telefono text,
    telefono_secundario text,
    tipo_identificacion public."TipoIdentificacion" NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone,
    activo boolean DEFAULT true NOT NULL,
    aplica_discapacidad boolean DEFAULT false NOT NULL,
    aplica_tercera_edad boolean DEFAULT false NOT NULL
);


ALTER TABLE public.clientes OWNER TO appuser;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.clientes_cliente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clientes_cliente_id_seq OWNER TO appuser;

--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.clientes_cliente_id_seq OWNED BY public.clientes.cliente_id;


--
-- Name: comunidades; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.comunidades (
    comunidad_id integer NOT NULL,
    nombre text NOT NULL,
    codigo text NOT NULL,
    porcentaje_tasa_seguridad numeric NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.comunidades OWNER TO appuser;

--
-- Name: comunidades_comunidad_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.comunidades_comunidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comunidades_comunidad_id_seq OWNER TO appuser;

--
-- Name: comunidades_comunidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.comunidades_comunidad_id_seq OWNED BY public.comunidades.comunidad_id;


--
-- Name: contratos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.contratos (
    contrato_id bigint NOT NULL,
    cliente_id bigint NOT NULL,
    sector_id integer,
    categoria_tarifa_id integer NOT NULL,
    numero_guia text NOT NULL,
    fecha_inicio timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    direccion_suministro text NOT NULL,
    estado public."EstadoGenerico" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    creado_por text,
    comunidad_id integer NOT NULL
);


ALTER TABLE public.contratos OWNER TO appuser;

--
-- Name: contratos_contrato_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.contratos_contrato_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contratos_contrato_id_seq OWNER TO appuser;

--
-- Name: contratos_contrato_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.contratos_contrato_id_seq OWNED BY public.contratos.contrato_id;


--
-- Name: convenios; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.convenios (
    convenio_id bigint NOT NULL,
    numero_cuotas integer NOT NULL,
    abono_inicial numeric NOT NULL,
    contrato_id bigint NOT NULL,
    deuda_total numeric NOT NULL,
    dias_mora_actual integer NOT NULL,
    estado_convenio public."EstadoConvenio" NOT NULL,
    fecha_aprobacion timestamp(3) without time zone,
    fecha_primer_pago timestamp(3) without time zone NOT NULL,
    fecha_proximo_pago timestamp(3) without time zone,
    monto_pagado_actual numeric NOT NULL,
    motivo text,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.convenios OWNER TO appuser;

--
-- Name: convenios_convenio_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.convenios_convenio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.convenios_convenio_id_seq OWNER TO appuser;

--
-- Name: convenios_convenio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.convenios_convenio_id_seq OWNED BY public.convenios.convenio_id;


--
-- Name: cuota_convenio; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.cuota_convenio (
    cuota_convenio_id bigint NOT NULL,
    convenio_id bigint NOT NULL,
    numero_cuota integer NOT NULL,
    valor_cuota numeric NOT NULL,
    fecha_vencimiento timestamp(3) without time zone NOT NULL,
    estado_convenio public."EstadoConvenio" NOT NULL,
    fecha_pago timestamp(3) without time zone,
    monto_pagado numeric NOT NULL,
    dias_retraso integer NOT NULL,
    interes_mora_aplicado numeric NOT NULL,
    pago_completo boolean DEFAULT false NOT NULL,
    fecha_pago_anticipado timestamp(3) without time zone,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    saldo_pendiente numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.cuota_convenio OWNER TO appuser;

--
-- Name: cuota_convenio_cuota_convenio_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.cuota_convenio_cuota_convenio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cuota_convenio_cuota_convenio_id_seq OWNER TO appuser;

--
-- Name: cuota_convenio_cuota_convenio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.cuota_convenio_cuota_convenio_id_seq OWNED BY public.cuota_convenio.cuota_convenio_id;


--
-- Name: descuento_detalle; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.descuento_detalle (
    descuento_detalle_id integer NOT NULL,
    monto_descontado numeric(12,4) NOT NULL,
    motivo text,
    autorizado_por integer,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    catalogo_descuento_id integer NOT NULL,
    es_porcentaje boolean DEFAULT true NOT NULL,
    valor_applied numeric(12,4) DEFAULT 0 NOT NULL,
    prefactura_detalle_id bigint NOT NULL
);


ALTER TABLE public.descuento_detalle OWNER TO appuser;

--
-- Name: descuento_detalle_descuento_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.descuento_detalle_descuento_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.descuento_detalle_descuento_detalle_id_seq OWNER TO appuser;

--
-- Name: descuento_detalle_descuento_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.descuento_detalle_descuento_detalle_id_seq OWNED BY public.descuento_detalle.descuento_detalle_id;


--
-- Name: detalle_pago; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.detalle_pago (
    detalle_pago_id bigint NOT NULL,
    pago_id bigint NOT NULL,
    factura_id bigint,
    cuota_convenio_id bigint,
    tipo_pago public."TipoDetallePago" NOT NULL,
    monto_abonado numeric NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone,
    fecha_transaccion timestamp(3) without time zone,
    forma_pago_id integer NOT NULL,
    referencia text,
    nota_debito_id bigint
);


ALTER TABLE public.detalle_pago OWNER TO appuser;

--
-- Name: detalle_pago_detalle_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.detalle_pago_detalle_pago_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_pago_detalle_pago_id_seq OWNER TO appuser;

--
-- Name: detalle_pago_detalle_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.detalle_pago_detalle_pago_id_seq OWNED BY public.detalle_pago.detalle_pago_id;


--
-- Name: empresa; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.empresa (
    empresa_id integer NOT NULL,
    ruc text NOT NULL,
    razon_social text NOT NULL,
    nombre_comercial text,
    direccion_matriz text NOT NULL,
    obligado_contabilidad boolean DEFAULT false NOT NULL,
    contribuyente_especial text,
    agente_retencion text,
    regimen text,
    logotipo_url text,
    ambiente public."AmbienteSri" DEFAULT 'PRUEBAS'::public."AmbienteSri" NOT NULL,
    tipo_emision text DEFAULT '1'::text NOT NULL,
    certificado_p12 text,
    password_certificado text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.empresa OWNER TO appuser;

--
-- Name: empresa_empresa_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.empresa_empresa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresa_empresa_id_seq OWNER TO appuser;

--
-- Name: empresa_empresa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.empresa_empresa_id_seq OWNED BY public.empresa.empresa_id;


--
-- Name: establecimientos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.establecimientos (
    establecimiento_id integer NOT NULL,
    empresa_id integer NOT NULL,
    codigo character varying(3) NOT NULL,
    nombre text NOT NULL,
    direccion text NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.establecimientos OWNER TO appuser;

--
-- Name: establecimientos_establecimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.establecimientos_establecimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.establecimientos_establecimiento_id_seq OWNER TO appuser;

--
-- Name: establecimientos_establecimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.establecimientos_establecimiento_id_seq OWNED BY public.establecimientos.establecimiento_id;


--
-- Name: facturas; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.facturas (
    factura_id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    prefactura_id bigint NOT NULL,
    tipo_comprobante_id integer NOT NULL,
    saldo_pendiente numeric DEFAULT 0 NOT NULL,
    clave_acceso character varying(49),
    secuencial character varying(9) NOT NULL,
    numero_autorizacion text,
    enviado_sri boolean DEFAULT false NOT NULL,
    fecha_enviado_sri timestamp(3) without time zone,
    pdf_url text,
    respuesta_sri text,
    estado_sri public."EstadoSri" DEFAULT 'BORRADOR'::public."EstadoSri" NOT NULL,
    estado_pago public."EstadoPago" DEFAULT 'PENDIENTE'::public."EstadoPago" NOT NULL,
    fecha_emision timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_vencimiento timestamp(3) without time zone NOT NULL,
    creado_por text,
    actualizado_por text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    xml_autorizado_url text,
    xml_firmado_url text,
    anulado_por text,
    fecha_anulacion timestamp(3) without time zone,
    motivo_anulacion text,
    total numeric NOT NULL
);


ALTER TABLE public.facturas OWNER TO appuser;

--
-- Name: facturas_factura_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.facturas_factura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facturas_factura_id_seq OWNER TO appuser;

--
-- Name: facturas_factura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.facturas_factura_id_seq OWNED BY public.facturas.factura_id;


--
-- Name: historial_medidores; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.historial_medidores (
    historial_id bigint NOT NULL,
    medidor_id bigint NOT NULL,
    contrato_id bigint NOT NULL,
    fecha_desde timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_hasta timestamp(3) without time zone,
    lectura_inicial_historial numeric NOT NULL,
    lectura_final_historial numeric,
    motivo text,
    observacion text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    saldo_pendiente_cambio numeric DEFAULT 0
);


ALTER TABLE public.historial_medidores OWNER TO appuser;

--
-- Name: historial_medidores_historial_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.historial_medidores_historial_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_medidores_historial_id_seq OWNER TO appuser;

--
-- Name: historial_medidores_historial_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.historial_medidores_historial_id_seq OWNED BY public.historial_medidores.historial_id;


--
-- Name: lecturas; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.lecturas (
    lectura_id bigint NOT NULL,
    fecha timestamp(3) without time zone NOT NULL,
    lectura_anterior numeric NOT NULL,
    lectura_actual numeric NOT NULL,
    consumo_calculado numeric NOT NULL,
    borrado_en timestamp(3) without time zone,
    contrato_id bigint NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_validacion timestamp(3) without time zone,
    foto_url_minio text,
    lectura_inicial boolean DEFAULT false NOT NULL,
    periodo_id integer NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    medidor_id bigint,
    estado public."EstadoLectura" DEFAULT 'PENDIENTE'::public."EstadoLectura" NOT NULL,
    descripcion_anomalia text
);


ALTER TABLE public.lecturas OWNER TO appuser;

--
-- Name: lecturas_lectura_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.lecturas_lectura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lecturas_lectura_id_seq OWNER TO appuser;

--
-- Name: lecturas_lectura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.lecturas_lectura_id_seq OWNED BY public.lecturas.lectura_id;


--
-- Name: lote_facturacion; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.lote_facturacion (
    lote_id bigint NOT NULL,
    comunidad_id integer NOT NULL,
    periodo_id integer NOT NULL,
    estado public."EstadoLote" DEFAULT 'BORRADOR'::public."EstadoLote" NOT NULL,
    total_monto numeric DEFAULT 0 NOT NULL,
    notas text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_por integer,
    total_emisiones integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.lote_facturacion OWNER TO appuser;

--
-- Name: lote_facturacion_lote_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.lote_facturacion_lote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lote_facturacion_lote_id_seq OWNER TO appuser;

--
-- Name: lote_facturacion_lote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.lote_facturacion_lote_id_seq OWNED BY public.lote_facturacion.lote_id;


--
-- Name: medidores; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.medidores (
    medidor_id bigint NOT NULL,
    contrato_id bigint,
    marca text NOT NULL,
    modelo text NOT NULL,
    serie text NOT NULL,
    estado public."EstadoMedidor" NOT NULL,
    fecha_instalacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_baja timestamp(3) without time zone,
    motivo_baja text,
    motivo_cambio text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    latitud numeric(10,8),
    longitud numeric(11,8)
);


ALTER TABLE public.medidores OWNER TO appuser;

--
-- Name: medidores_medidor_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.medidores_medidor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medidores_medidor_id_seq OWNER TO appuser;

--
-- Name: medidores_medidor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.medidores_medidor_id_seq OWNED BY public.medidores.medidor_id;


--
-- Name: menu_permisos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.menu_permisos (
    menu_permiso_id integer NOT NULL,
    permiso_id integer NOT NULL,
    menu_id integer NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.menu_permisos OWNER TO appuser;

--
-- Name: menu_permisos_menu_permiso_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.menu_permisos_menu_permiso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menu_permisos_menu_permiso_id_seq OWNER TO appuser;

--
-- Name: menu_permisos_menu_permiso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.menu_permisos_menu_permiso_id_seq OWNED BY public.menu_permisos.menu_permiso_id;


--
-- Name: menus; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.menus (
    menu_id integer NOT NULL,
    menu_padre_id integer,
    icono text,
    nombre text NOT NULL,
    ruta text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.menus OWNER TO appuser;

--
-- Name: menus_menu_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.menus_menu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.menus_menu_id_seq OWNER TO appuser;

--
-- Name: menus_menu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.menus_menu_id_seq OWNED BY public.menus.menu_id;


--
-- Name: notas_credito; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.notas_credito (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    factura_id bigint NOT NULL,
    punto_emision_id integer NOT NULL,
    periodo_id integer NOT NULL,
    tipo_comprobante_id integer NOT NULL,
    clave_acceso text,
    secuencial text NOT NULL,
    numero_autorizacion text,
    fecha_emision timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    motivo text NOT NULL,
    subtotal numeric NOT NULL,
    iva numeric NOT NULL,
    total numeric NOT NULL,
    xml_firmado_url text,
    xml_autorizado_url text,
    estado_sri public."EstadoSri" DEFAULT 'BORRADOR'::public."EstadoSri" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notas_credito OWNER TO appuser;

--
-- Name: notas_credito_detalle; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.notas_credito_detalle (
    id bigint NOT NULL,
    nota_credito_id bigint NOT NULL,
    descripcion text NOT NULL,
    cantidad numeric NOT NULL,
    precio_unitario numeric NOT NULL,
    descuento numeric DEFAULT 0 NOT NULL,
    subtotal numeric NOT NULL,
    iva numeric NOT NULL,
    total numeric NOT NULL
);


ALTER TABLE public.notas_credito_detalle OWNER TO appuser;

--
-- Name: notas_credito_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.notas_credito_detalle_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_credito_detalle_id_seq OWNER TO appuser;

--
-- Name: notas_credito_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.notas_credito_detalle_id_seq OWNED BY public.notas_credito_detalle.id;


--
-- Name: notas_credito_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.notas_credito_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_credito_id_seq OWNER TO appuser;

--
-- Name: notas_credito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.notas_credito_id_seq OWNED BY public.notas_credito.id;


--
-- Name: notas_debito; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.notas_debito (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    factura_id bigint NOT NULL,
    punto_emision_id integer NOT NULL,
    periodo_id integer NOT NULL,
    tipo_comprobante_id integer NOT NULL,
    forma_pago_id integer NOT NULL,
    clave_acceso text,
    secuencial text NOT NULL,
    numero_autorizacion text,
    fecha_emision timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    subtotal numeric NOT NULL,
    iva numeric NOT NULL,
    total numeric NOT NULL,
    xml_firmado_url text,
    xml_autorizado_url text,
    estado_sri public."EstadoSri" DEFAULT 'BORRADOR'::public."EstadoSri" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    codigo_impuesto_sri text,
    codigo_porcentaje_sri text,
    motivo text NOT NULL,
    tarifa_impuesto numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.notas_debito OWNER TO appuser;

--
-- Name: notas_debito_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.notas_debito_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notas_debito_id_seq OWNER TO appuser;

--
-- Name: notas_debito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.notas_debito_id_seq OWNED BY public.notas_debito.id;


--
-- Name: novedad_operativa; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.novedad_operativa (
    novedad_id bigint NOT NULL,
    lectura_id bigint NOT NULL,
    observacion text,
    tipo public."TipoNovedad" NOT NULL,
    estado public."EstadoNovedad" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    foto_url_minio text
);


ALTER TABLE public.novedad_operativa OWNER TO appuser;

--
-- Name: novedad_operativa_novedad_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.novedad_operativa_novedad_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.novedad_operativa_novedad_id_seq OWNER TO appuser;

--
-- Name: novedad_operativa_novedad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.novedad_operativa_novedad_id_seq OWNED BY public.novedad_operativa.novedad_id;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.pagos (
    pago_id bigint NOT NULL,
    caja_id bigint,
    comprobante_url_minio text,
    fecha_pago timestamp(3) without time zone NOT NULL,
    monto_total_recibido numeric NOT NULL,
    numero_operacion text,
    observaciones text,
    referencia_banco text,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone,
    usuario_id integer NOT NULL,
    cliente_id bigint NOT NULL,
    anulado_por text,
    estado_validacion public."EstadoValidacionPago" DEFAULT 'APROBADO'::public."EstadoValidacionPago" NOT NULL,
    fecha_anulacion timestamp(3) without time zone,
    motivo_anulacion text
);


ALTER TABLE public.pagos OWNER TO appuser;

--
-- Name: pagos_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.pagos_pago_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pagos_pago_id_seq OWNER TO appuser;

--
-- Name: pagos_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.pagos_pago_id_seq OWNED BY public.pagos.pago_id;


--
-- Name: parametro_tasa_interes; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.parametro_tasa_interes (
    parametro_id integer NOT NULL,
    tasa double precision NOT NULL,
    vigente_desde timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    vigente_hasta timestamp(3) without time zone,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.parametro_tasa_interes OWNER TO appuser;

--
-- Name: parametro_tasa_interes_parametro_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.parametro_tasa_interes_parametro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parametro_tasa_interes_parametro_id_seq OWNER TO appuser;

--
-- Name: parametro_tasa_interes_parametro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.parametro_tasa_interes_parametro_id_seq OWNED BY public.parametro_tasa_interes.parametro_id;


--
-- Name: perfiles; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.perfiles (
    perfil_id integer NOT NULL,
    primer_nombre text,
    apellido text,
    telefono text,
    avatar jsonb,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    usuario_id integer NOT NULL
);


ALTER TABLE public.perfiles OWNER TO appuser;

--
-- Name: perfiles_perfil_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.perfiles_perfil_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.perfiles_perfil_id_seq OWNER TO appuser;

--
-- Name: perfiles_perfil_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.perfiles_perfil_id_seq OWNED BY public.perfiles.perfil_id;


--
-- Name: periodos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.periodos (
    periodo_id integer NOT NULL,
    nombre text NOT NULL,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone NOT NULL,
    fecha_vencimiento timestamp(3) without time zone NOT NULL,
    estado public."EstadoPeriodo" DEFAULT 'ABIERTO'::public."EstadoPeriodo" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.periodos OWNER TO appuser;

--
-- Name: periodos_periodo_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.periodos_periodo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.periodos_periodo_id_seq OWNER TO appuser;

--
-- Name: periodos_periodo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.periodos_periodo_id_seq OWNED BY public.periodos.periodo_id;


--
-- Name: permisos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.permisos (
    permiso_id integer NOT NULL,
    recurso text NOT NULL,
    accion text NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.permisos OWNER TO appuser;

--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.permisos_permiso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permisos_permiso_id_seq OWNER TO appuser;

--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.permisos_permiso_id_seq OWNED BY public.permisos.permiso_id;


--
-- Name: prefactura_detalle; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.prefactura_detalle (
    prefactura_detalle_id bigint NOT NULL,
    prefactura_id bigint NOT NULL,
    rubro_id integer NOT NULL,
    descripcion text NOT NULL,
    cantidad numeric NOT NULL,
    precio_unitario numeric NOT NULL,
    subtotal numeric NOT NULL,
    iva numeric NOT NULL,
    total numeric NOT NULL,
    codigo_impuesto_sri text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    descuento numeric DEFAULT 0 NOT NULL,
    cuota_convenio_id bigint,
    codigo_porcentaje_sri text,
    tarifa_impuesto numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.prefactura_detalle OWNER TO appuser;

--
-- Name: prefactura_detalle_prefactura_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.prefactura_detalle_prefactura_detalle_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prefactura_detalle_prefactura_detalle_id_seq OWNER TO appuser;

--
-- Name: prefactura_detalle_prefactura_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.prefactura_detalle_prefactura_detalle_id_seq OWNED BY public.prefactura_detalle.prefactura_detalle_id;


--
-- Name: prefacturas; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.prefacturas (
    prefactura_id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    contrato_id bigint NOT NULL,
    lote_id bigint,
    periodo_id integer NOT NULL,
    punto_emision_id integer NOT NULL,
    lectura_anterior numeric,
    lectura_actual numeric,
    consumo_m3 numeric,
    subtotal numeric NOT NULL,
    iva numeric NOT NULL,
    descuento_total numeric NOT NULL,
    total_pagar numeric NOT NULL,
    deuda_anterior numeric DEFAULT 0 NOT NULL,
    saldo_vencido numeric DEFAULT 0 NOT NULL,
    abono numeric DEFAULT 0 NOT NULL,
    saldo_actual numeric DEFAULT 0 NOT NULL,
    meses_atrasado integer DEFAULT 0 NOT NULL,
    estado public."EstadoPrefactura" DEFAULT 'GENERADA'::public."EstadoPrefactura" NOT NULL,
    aprobada_por text,
    fecha_aprobacion timestamp(3) without time zone,
    motivo_rechazo text,
    creado_por text,
    actualizado_por text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    interes_mora numeric DEFAULT 0 NOT NULL,
    cliente_direccion text,
    cliente_email text,
    cliente_identificacion text,
    cliente_nombre text,
    tarifa_nombre text,
    tarifa_valor_base numeric,
    tarifa_valor_excedente numeric,
    lectura_id bigint,
    tasa_interes_usada numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.prefacturas OWNER TO appuser;

--
-- Name: prefacturas_prefactura_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.prefacturas_prefactura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prefacturas_prefactura_id_seq OWNER TO appuser;

--
-- Name: prefacturas_prefactura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.prefacturas_prefactura_id_seq OWNED BY public.prefacturas.prefactura_id;


--
-- Name: preferencias_sistema; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.preferencias_sistema (
    id integer NOT NULL,
    clave text NOT NULL,
    valor text NOT NULL,
    descripcion text,
    categoria text DEFAULT 'GENERAL'::text NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    actualizado_por text
);


ALTER TABLE public.preferencias_sistema OWNER TO appuser;

--
-- Name: preferencias_sistema_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.preferencias_sistema_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.preferencias_sistema_id_seq OWNER TO appuser;

--
-- Name: preferencias_sistema_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.preferencias_sistema_id_seq OWNED BY public.preferencias_sistema.id;


--
-- Name: puntos_emision; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.puntos_emision (
    punto_emision_id integer NOT NULL,
    establecimiento_id integer NOT NULL,
    codigo character varying(3) NOT NULL,
    nombre text NOT NULL,
    secuencial_actual integer DEFAULT 1 NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.puntos_emision OWNER TO appuser;

--
-- Name: puntos_emision_punto_emision_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.puntos_emision_punto_emision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.puntos_emision_punto_emision_id_seq OWNER TO appuser;

--
-- Name: puntos_emision_punto_emision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.puntos_emision_punto_emision_id_seq OWNED BY public.puntos_emision.punto_emision_id;


--
-- Name: retencion_detalle; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.retencion_detalle (
    id bigint NOT NULL,
    retencion_id bigint NOT NULL,
    codigo_impuesto text NOT NULL,
    codigo_retencion text NOT NULL,
    base_imponible numeric NOT NULL,
    porcentaje_retener numeric NOT NULL,
    valor_retenido numeric NOT NULL
);


ALTER TABLE public.retencion_detalle OWNER TO appuser;

--
-- Name: retencion_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.retencion_detalle_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.retencion_detalle_id_seq OWNER TO appuser;

--
-- Name: retencion_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.retencion_detalle_id_seq OWNED BY public.retencion_detalle.id;


--
-- Name: retenciones; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.retenciones (
    id bigint NOT NULL,
    uuid uuid DEFAULT gen_random_uuid() NOT NULL,
    punto_emision_id integer NOT NULL,
    periodo_id integer NOT NULL,
    tipo_comprobante_id integer NOT NULL,
    clave_acceso text,
    secuencial text NOT NULL,
    numero_autorizacion text,
    fecha_emision timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    xml_firmado_url text,
    xml_autorizado_url text,
    estado_sri public."EstadoSri" DEFAULT 'BORRADOR'::public."EstadoSri" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.retenciones OWNER TO appuser;

--
-- Name: retenciones_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.retenciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.retenciones_id_seq OWNER TO appuser;

--
-- Name: retenciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.retenciones_id_seq OWNED BY public.retenciones.id;


--
-- Name: rol_permisos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.rol_permisos (
    rol_permiso_id integer NOT NULL,
    rol_id integer NOT NULL,
    permiso_id integer NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.rol_permisos OWNER TO appuser;

--
-- Name: rol_permisos_rol_permiso_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.rol_permisos_rol_permiso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_permisos_rol_permiso_id_seq OWNER TO appuser;

--
-- Name: rol_permisos_rol_permiso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.rol_permisos_rol_permiso_id_seq OWNED BY public.rol_permisos.rol_permiso_id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.roles (
    rol_id integer NOT NULL,
    nombre text NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.roles OWNER TO appuser;

--
-- Name: roles_rol_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.roles_rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_rol_id_seq OWNER TO appuser;

--
-- Name: roles_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.roles_rol_id_seq OWNED BY public.roles.rol_id;


--
-- Name: rubros; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.rubros (
    rubro_id integer NOT NULL,
    codigo_sri text,
    nombre text DEFAULT ''::text NOT NULL,
    descripcion text NOT NULL,
    precio_unitario numeric NOT NULL,
    tipo_rubro public."TipoRubro" NOT NULL,
    impuesto_id integer NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.rubros OWNER TO appuser;

--
-- Name: rubros_rubro_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.rubros_rubro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rubros_rubro_id_seq OWNER TO appuser;

--
-- Name: rubros_rubro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.rubros_rubro_id_seq OWNED BY public.rubros.rubro_id;


--
-- Name: saldo_favor_cliente; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.saldo_favor_cliente (
    saldo_favor_id bigint NOT NULL,
    cliente_id bigint NOT NULL,
    pago_id bigint,
    monto_saldo numeric NOT NULL,
    tipo_origen public."TipoOrigenAbono" NOT NULL,
    disponible_para_aplicar boolean DEFAULT true NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.saldo_favor_cliente OWNER TO appuser;

--
-- Name: saldo_favor_cliente_saldo_favor_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.saldo_favor_cliente_saldo_favor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saldo_favor_cliente_saldo_favor_id_seq OWNER TO appuser;

--
-- Name: saldo_favor_cliente_saldo_favor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.saldo_favor_cliente_saldo_favor_id_seq OWNED BY public.saldo_favor_cliente.saldo_favor_id;


--
-- Name: sectores; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.sectores (
    sector_id integer NOT NULL,
    comunidad_id integer,
    codigo text NOT NULL,
    nombre text NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.sectores OWNER TO appuser;

--
-- Name: sectores_sector_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.sectores_sector_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sectores_sector_id_seq OWNER TO appuser;

--
-- Name: sectores_sector_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.sectores_sector_id_seq OWNED BY public.sectores.sector_id;


--
-- Name: sesiones; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.sesiones (
    sesion_id text NOT NULL,
    usuario_id integer NOT NULL,
    hash_token_actualizado text NOT NULL,
    direccion_ip text,
    usuario_agente text,
    revocado boolean DEFAULT false NOT NULL,
    expira_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sesiones OWNER TO appuser;

--
-- Name: sri_forma_pago; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.sri_forma_pago (
    id integer NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.sri_forma_pago OWNER TO appuser;

--
-- Name: sri_forma_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.sri_forma_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sri_forma_pago_id_seq OWNER TO appuser;

--
-- Name: sri_forma_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.sri_forma_pago_id_seq OWNED BY public.sri_forma_pago.id;


--
-- Name: sri_impuesto; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.sri_impuesto (
    id integer NOT NULL,
    codigo text NOT NULL,
    codigo_porcentaje text NOT NULL,
    nombre text NOT NULL,
    tarifa numeric NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sri_impuesto OWNER TO appuser;

--
-- Name: sri_impuesto_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.sri_impuesto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sri_impuesto_id_seq OWNER TO appuser;

--
-- Name: sri_impuesto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.sri_impuesto_id_seq OWNED BY public.sri_impuesto.id;


--
-- Name: sri_tipo_comprobante; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.sri_tipo_comprobante (
    id integer NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.sri_tipo_comprobante OWNER TO appuser;

--
-- Name: sri_tipo_comprobante_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.sri_tipo_comprobante_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sri_tipo_comprobante_id_seq OWNER TO appuser;

--
-- Name: sri_tipo_comprobante_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.sri_tipo_comprobante_id_seq OWNED BY public.sri_tipo_comprobante.id;


--
-- Name: usuario_permisos; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.usuario_permisos (
    id_usuario_permiso integer NOT NULL,
    usuario_id integer NOT NULL,
    permiso_id integer NOT NULL,
    permitir boolean NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.usuario_permisos OWNER TO appuser;

--
-- Name: usuario_permisos_id_usuario_permiso_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.usuario_permisos_id_usuario_permiso_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_permisos_id_usuario_permiso_seq OWNER TO appuser;

--
-- Name: usuario_permisos_id_usuario_permiso_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.usuario_permisos_id_usuario_permiso_seq OWNED BY public.usuario_permisos.id_usuario_permiso;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.usuarios (
    usuario_id integer NOT NULL,
    email text NOT NULL,
    contrasenia text NOT NULL,
    rol_id integer,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.usuarios OWNER TO appuser;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.usuarios_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_usuario_id_seq OWNER TO appuser;

--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.usuarios_usuario_id_seq OWNED BY public.usuarios.usuario_id;


--
-- Name: caja_arqueo_detalle id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.caja_arqueo_detalle ALTER COLUMN id SET DEFAULT nextval('public.caja_arqueo_detalle_id_seq'::regclass);


--
-- Name: caja_sesion caja_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.caja_sesion ALTER COLUMN caja_id SET DEFAULT nextval('public.caja_sesion_caja_id_seq'::regclass);


--
-- Name: catalogo_descuento catalogo_descuento_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.catalogo_descuento ALTER COLUMN catalogo_descuento_id SET DEFAULT nextval('public.catalogo_descuento_catalogo_descuento_id_seq'::regclass);


--
-- Name: categoria_tarifa categoria_tarifa_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.categoria_tarifa ALTER COLUMN categoria_tarifa_id SET DEFAULT nextval('public.categoria_tarifa_categoria_tarifa_id_seq'::regclass);


--
-- Name: clientes cliente_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.clientes ALTER COLUMN cliente_id SET DEFAULT nextval('public.clientes_cliente_id_seq'::regclass);


--
-- Name: comunidades comunidad_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.comunidades ALTER COLUMN comunidad_id SET DEFAULT nextval('public.comunidades_comunidad_id_seq'::regclass);


--
-- Name: contratos contrato_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.contratos ALTER COLUMN contrato_id SET DEFAULT nextval('public.contratos_contrato_id_seq'::regclass);


--
-- Name: convenios convenio_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.convenios ALTER COLUMN convenio_id SET DEFAULT nextval('public.convenios_convenio_id_seq'::regclass);


--
-- Name: cuota_convenio cuota_convenio_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.cuota_convenio ALTER COLUMN cuota_convenio_id SET DEFAULT nextval('public.cuota_convenio_cuota_convenio_id_seq'::regclass);


--
-- Name: descuento_detalle descuento_detalle_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.descuento_detalle ALTER COLUMN descuento_detalle_id SET DEFAULT nextval('public.descuento_detalle_descuento_detalle_id_seq'::regclass);


--
-- Name: detalle_pago detalle_pago_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.detalle_pago ALTER COLUMN detalle_pago_id SET DEFAULT nextval('public.detalle_pago_detalle_pago_id_seq'::regclass);


--
-- Name: empresa empresa_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.empresa ALTER COLUMN empresa_id SET DEFAULT nextval('public.empresa_empresa_id_seq'::regclass);


--
-- Name: establecimientos establecimiento_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.establecimientos ALTER COLUMN establecimiento_id SET DEFAULT nextval('public.establecimientos_establecimiento_id_seq'::regclass);


--
-- Name: facturas factura_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.facturas ALTER COLUMN factura_id SET DEFAULT nextval('public.facturas_factura_id_seq'::regclass);


--
-- Name: historial_medidores historial_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.historial_medidores ALTER COLUMN historial_id SET DEFAULT nextval('public.historial_medidores_historial_id_seq'::regclass);


--
-- Name: lecturas lectura_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lecturas ALTER COLUMN lectura_id SET DEFAULT nextval('public.lecturas_lectura_id_seq'::regclass);


--
-- Name: lote_facturacion lote_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote_facturacion ALTER COLUMN lote_id SET DEFAULT nextval('public.lote_facturacion_lote_id_seq'::regclass);


--
-- Name: medidores medidor_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.medidores ALTER COLUMN medidor_id SET DEFAULT nextval('public.medidores_medidor_id_seq'::regclass);


--
-- Name: menu_permisos menu_permiso_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.menu_permisos ALTER COLUMN menu_permiso_id SET DEFAULT nextval('public.menu_permisos_menu_permiso_id_seq'::regclass);


--
-- Name: menus menu_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.menus ALTER COLUMN menu_id SET DEFAULT nextval('public.menus_menu_id_seq'::regclass);


--
-- Name: notas_credito id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito ALTER COLUMN id SET DEFAULT nextval('public.notas_credito_id_seq'::regclass);


--
-- Name: notas_credito_detalle id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito_detalle ALTER COLUMN id SET DEFAULT nextval('public.notas_credito_detalle_id_seq'::regclass);


--
-- Name: notas_debito id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_debito ALTER COLUMN id SET DEFAULT nextval('public.notas_debito_id_seq'::regclass);


--
-- Name: novedad_operativa novedad_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.novedad_operativa ALTER COLUMN novedad_id SET DEFAULT nextval('public.novedad_operativa_novedad_id_seq'::regclass);


--
-- Name: pagos pago_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.pagos ALTER COLUMN pago_id SET DEFAULT nextval('public.pagos_pago_id_seq'::regclass);


--
-- Name: parametro_tasa_interes parametro_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.parametro_tasa_interes ALTER COLUMN parametro_id SET DEFAULT nextval('public.parametro_tasa_interes_parametro_id_seq'::regclass);


--
-- Name: perfiles perfil_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.perfiles ALTER COLUMN perfil_id SET DEFAULT nextval('public.perfiles_perfil_id_seq'::regclass);


--
-- Name: periodos periodo_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.periodos ALTER COLUMN periodo_id SET DEFAULT nextval('public.periodos_periodo_id_seq'::regclass);


--
-- Name: permisos permiso_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.permisos ALTER COLUMN permiso_id SET DEFAULT nextval('public.permisos_permiso_id_seq'::regclass);


--
-- Name: prefactura_detalle prefactura_detalle_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefactura_detalle ALTER COLUMN prefactura_detalle_id SET DEFAULT nextval('public.prefactura_detalle_prefactura_detalle_id_seq'::regclass);


--
-- Name: prefacturas prefactura_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefacturas ALTER COLUMN prefactura_id SET DEFAULT nextval('public.prefacturas_prefactura_id_seq'::regclass);


--
-- Name: preferencias_sistema id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.preferencias_sistema ALTER COLUMN id SET DEFAULT nextval('public.preferencias_sistema_id_seq'::regclass);


--
-- Name: puntos_emision punto_emision_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.puntos_emision ALTER COLUMN punto_emision_id SET DEFAULT nextval('public.puntos_emision_punto_emision_id_seq'::regclass);


--
-- Name: retencion_detalle id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retencion_detalle ALTER COLUMN id SET DEFAULT nextval('public.retencion_detalle_id_seq'::regclass);


--
-- Name: retenciones id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retenciones ALTER COLUMN id SET DEFAULT nextval('public.retenciones_id_seq'::regclass);


--
-- Name: rol_permisos rol_permiso_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.rol_permisos ALTER COLUMN rol_permiso_id SET DEFAULT nextval('public.rol_permisos_rol_permiso_id_seq'::regclass);


--
-- Name: roles rol_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.roles ALTER COLUMN rol_id SET DEFAULT nextval('public.roles_rol_id_seq'::regclass);


--
-- Name: rubros rubro_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.rubros ALTER COLUMN rubro_id SET DEFAULT nextval('public.rubros_rubro_id_seq'::regclass);


--
-- Name: saldo_favor_cliente saldo_favor_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.saldo_favor_cliente ALTER COLUMN saldo_favor_id SET DEFAULT nextval('public.saldo_favor_cliente_saldo_favor_id_seq'::regclass);


--
-- Name: sectores sector_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sectores ALTER COLUMN sector_id SET DEFAULT nextval('public.sectores_sector_id_seq'::regclass);


--
-- Name: sri_forma_pago id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sri_forma_pago ALTER COLUMN id SET DEFAULT nextval('public.sri_forma_pago_id_seq'::regclass);


--
-- Name: sri_impuesto id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sri_impuesto ALTER COLUMN id SET DEFAULT nextval('public.sri_impuesto_id_seq'::regclass);


--
-- Name: sri_tipo_comprobante id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sri_tipo_comprobante ALTER COLUMN id SET DEFAULT nextval('public.sri_tipo_comprobante_id_seq'::regclass);


--
-- Name: usuario_permisos id_usuario_permiso; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.usuario_permisos ALTER COLUMN id_usuario_permiso SET DEFAULT nextval('public.usuario_permisos_id_usuario_permiso_seq'::regclass);


--
-- Name: usuarios usuario_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuarios_usuario_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public._prisma_migrations VALUES ('63837780-b667-456e-8a79-efe158f353a0', '4940a8277e220b0e2093db33dece396dbf4878c4a985aafe933c96d3f0d9263f', '2026-05-01 21:09:05.124389+00', '20260501195819', NULL, NULL, '2026-05-01 21:09:05.116916+00', 1);
INSERT INTO public._prisma_migrations VALUES ('adfdf69c-2502-4939-a9a3-3c81c307dfb4', '752f0cd8e4bd277939400351713b7e358a947011aa142d36b9f92ce87332e072', '2026-05-01 21:09:04.523853+00', '20260417025636_init', NULL, NULL, '2026-05-01 21:09:04.048586+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b972afb4-4a0d-4960-bf92-13d622949f89', 'e509ebe467cdecdf868856f70dbb50aec36e9c37155a33bb18966b5ec6abbf84', '2026-05-01 21:09:04.754904+00', '20260417073637_multi_payment_methods_final_v2', NULL, NULL, '2026-05-01 21:09:04.733166+00', 1);
INSERT INTO public._prisma_migrations VALUES ('debb9f23-7e97-4110-82af-d4183ed4c671', '68175cf8145601fa4197fbab4aa9fc9c3423469e4839a409ed331121744446e9', '2026-05-01 21:09:04.577542+00', '20260417051611_sincronizacion', NULL, NULL, '2026-05-01 21:09:04.524823+00', 1);
INSERT INTO public._prisma_migrations VALUES ('6bb36dbd-cddf-4dc0-99f3-26852bca251b', '7eafdc21bf439acbe5de671de102db95490683a65bbdfbcfb5ddd582d37dbbe1', '2026-05-01 21:09:04.604688+00', '20260417053036_sincronizacionv', NULL, NULL, '2026-05-01 21:09:04.57874+00', 1);
INSERT INTO public._prisma_migrations VALUES ('404cdbf2-194d-4787-a8d3-4d7da51de428', 'c11ebeecaf13e75a4970fadedfb54cbe54444855c282715bbeb8043b5b440d73', '2026-05-01 21:09:04.612358+00', '20260417053150_sincronizacionv2', NULL, NULL, '2026-05-01 21:09:04.605685+00', 1);
INSERT INTO public._prisma_migrations VALUES ('9caf00ff-8c4a-4815-9b1a-45bb4da1ad45', 'e51d0bf5c496330df0d33087a17cc72d13e790356c4976a98ef5888b53f6f0e3', '2026-05-01 21:09:04.779612+00', '20260426211628_optimize_facturas_lecturas_indexes', NULL, NULL, '2026-05-01 21:09:04.756029+00', 1);
INSERT INTO public._prisma_migrations VALUES ('72105b58-ede6-4fc2-8c4c-6eacc84a178c', '26c5305da9689b72b5a9993eaa140990defb05e14ec83c33998f0ca835363ca4', '2026-05-01 21:09:04.619926+00', '20260417053522_sincronizacionv3', NULL, NULL, '2026-05-01 21:09:04.61341+00', 1);
INSERT INTO public._prisma_migrations VALUES ('68c63755-04a2-4a9e-b5f5-5449ecb59d56', '6978588ada71c239e91b4447c69d16f00de9a4999b2568480a27cc933ce2bad5', '2026-05-01 21:09:04.625581+00', '20260417055313_sincronizacionv4', NULL, NULL, '2026-05-01 21:09:04.621088+00', 1);
INSERT INTO public._prisma_migrations VALUES ('34ac4efa-1878-47f8-aab2-169b06767f48', '610e45a258bb59baa18135a1044bc67a3447a3416709ce64ed798a87bc189f14', '2026-05-01 21:43:40.703212+00', '20260501214340_fix_roles_heredados_columns', NULL, NULL, '2026-05-01 21:43:40.685483+00', 1);
INSERT INTO public._prisma_migrations VALUES ('fff73d67-43d6-4027-ab52-354359247323', '20324f14dabe15945fa47a07ad95f722aa4a9923e6dacfc5629422a91fa349fb', '2026-05-01 21:09:04.652097+00', '20260417061806_add_discounts_architecture', NULL, NULL, '2026-05-01 21:09:04.626548+00', 1);
INSERT INTO public._prisma_migrations VALUES ('1eb902ea-a1d1-449e-bae2-510f1728d875', 'bfd4ed5502eb7b7f0746a322589695b3f94ba19f516530c5d9ac50ed0ebb7503', '2026-05-01 21:09:04.841408+00', '20260501025438_cambiando_schema', NULL, NULL, '2026-05-01 21:09:04.780633+00', 1);
INSERT INTO public._prisma_migrations VALUES ('80588c44-8a33-40d0-8401-167ca4680bd2', '5ddceeeb16e28459aa9f0fe8767da787d108d3d2ee7e7e95e7618f40c42acc51', '2026-05-01 21:09:04.669632+00', '20260417063947_add_manual_discounts_catalog_final', NULL, NULL, '2026-05-01 21:09:04.653001+00', 1);
INSERT INTO public._prisma_migrations VALUES ('4f681674-6adf-4dc8-af6f-8437c2fe48a7', '26e4a1ab1ab0217331bf78768435cf3f7bd03f6f1c39ba21c22443b695f557cd', '2026-05-01 21:09:04.683439+00', '20260417065302_sync_hybrid_manual_discounts', NULL, NULL, '2026-05-01 21:09:04.670752+00', 1);
INSERT INTO public._prisma_migrations VALUES ('37c83ac2-ab87-439e-a823-37624af0b0ef', '89f00f1b3e1594baaf79b4272ba5de97ad0537639610df4ebf7eff6f12f25743', '2026-05-01 21:09:05.171566+00', '20260501202811', NULL, NULL, '2026-05-01 21:09:05.125421+00', 1);
INSERT INTO public._prisma_migrations VALUES ('a9f9b085-995d-4700-8908-80f588c4b85b', '5552bb9875d921a3608139fb92d617844b7bf974ff50222a5289e8502e2952dd', '2026-05-01 21:09:04.693627+00', '20260417065428_simplify_discounts_to_detail_only', NULL, NULL, '2026-05-01 21:09:04.684441+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b436a18e-fc8b-4d7a-8f33-2e914d49eefc', '5e838be0e5cba71305dfb15dd4786ecd28777da6eb4e10bd031545ed206eb876', '2026-05-01 21:09:04.930563+00', '20260501030013_facturacion', NULL, NULL, '2026-05-01 21:09:04.842472+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b252d17a-d3d5-4ce1-8f76-b1a19817d67a', '4fd43fe2df88eeee28e7650baf0cf01e124b9e3d2c919ae4d9cec2c8d8423aae', '2026-05-01 21:09:04.709233+00', '20260417070954_unified_billing_source_of_truth', NULL, NULL, '2026-05-01 21:09:04.694653+00', 1);
INSERT INTO public._prisma_migrations VALUES ('23a20411-4535-4d89-b0ca-53047443797d', '10e225a9154cac8d4ae4a8c7ae5494ade7b2818ce46c0cae72a93600a155d35f', '2026-05-01 21:09:04.727553+00', '20260417071843_final_minimalist_invoice_architecture', NULL, NULL, '2026-05-01 21:09:04.710252+00', 1);
INSERT INTO public._prisma_migrations VALUES ('de714025-1a3b-4998-a89b-8a5b4a676500', '3d680e9689f7f69cfd9f081cda0b6b6f4f8f3fa362b8e5c4511db96c071dd6f6', '2026-05-01 21:09:04.732196+00', '20260417072129_add_client_snapshot_to_prefactura', NULL, NULL, '2026-05-01 21:09:04.728584+00', 1);
INSERT INTO public._prisma_migrations VALUES ('2845d48c-3b44-4fb0-9ce0-c5dfdedb50e5', '5c17efbfcaec54d892f7a2e74d2aa5547d820268bcf80dedaaaf143867d287a5', '2026-05-01 21:09:05.053291+00', '20260501074016_migration_db_upgrade', NULL, NULL, '2026-05-01 21:09:04.931636+00', 1);
INSERT INTO public._prisma_migrations VALUES ('10d8b11e-c060-46ae-8f0c-7d07754f2878', '326b70a38293e44be28d6a660b0effb409ccb95766e9915c37e09052afa519c0', '2026-05-01 21:09:05.07564+00', '20260501193021_upgrade_detalle_pago', NULL, NULL, '2026-05-01 21:09:05.054293+00', 1);
INSERT INTO public._prisma_migrations VALUES ('23ad0aaa-a619-4e2d-bd60-7d09987ec9f3', 'f4ea262c27d946ea0222a907a3fd121ccd0a7593bcb37be222402653d376dcd7', '2026-05-01 21:09:13.701472+00', '20260501210913', NULL, NULL, '2026-05-01 21:09:13.626749+00', 1);
INSERT INTO public._prisma_migrations VALUES ('7e6c01a9-7534-4b04-a2b4-5532475e14d6', '720e347d513bcb309cf4ffa05fdf740168f8578850f50235cd897e2db08522a4', '2026-05-01 21:09:05.108673+00', '20260501195100', NULL, NULL, '2026-05-01 21:09:05.076643+00', 1);
INSERT INTO public._prisma_migrations VALUES ('86ecf3bb-3a85-41d3-8dea-1e103fde2547', '18017787b02488096c22ae1c8495ac3231135b30da47b79a8554ef16f210d3a1', '2026-05-01 21:09:05.115815+00', '20260501195400', NULL, NULL, '2026-05-01 21:09:05.10963+00', 1);
INSERT INTO public._prisma_migrations VALUES ('b8faa98f-56eb-41b4-927e-b04615e5b636', 'ba6b2c70b74cb3aef01f875278452d7b21cdd51aa8a6fb624966ad69b6b3c6f3', '2026-05-01 21:51:14.60731+00', '20260501215114_sync_backend_requirements', NULL, NULL, '2026-05-01 21:51:14.551762+00', 1);
INSERT INTO public._prisma_migrations VALUES ('de639dd2-6e19-4f03-8dd8-4b4c4fff1626', '1ff0921f482bf0965f6d54d4aacf30dfb43f541c0ebfa93502690a75d3301156', '2026-05-01 21:33:38.572519+00', '20260501213338', NULL, NULL, '2026-05-01 21:33:38.501396+00', 1);
INSERT INTO public._prisma_migrations VALUES ('dc7bc9fb-fe69-456a-b32d-be1ed9094933', 'dae5cb8441ea6bcf73ba5a23c9eef16e7cb564d321fef301f571395d3a4eb9a9', '2026-05-01 21:37:08.139934+00', '20260501213708', NULL, NULL, '2026-05-01 21:37:08.091852+00', 1);
INSERT INTO public._prisma_migrations VALUES ('7a8c7737-dfa3-4432-b280-6ee83fdd284f', '590994310f943fc5dd264e3cd82ce1536fb5f491810923b63e203676eacde6fd', '2026-05-01 21:43:14.500929+00', '20260501214314_restore_roles_heredados', NULL, NULL, '2026-05-01 21:43:14.486744+00', 1);
INSERT INTO public._prisma_migrations VALUES ('ffcefab7-f732-40ab-ae90-4ed264953610', '74fd8143ea7d35de3129bd66cf565b84c65c6fadc376361928ac117ce63d6000', '2026-05-01 22:22:18.338668+00', '20260501222218_remove_roles_heredados', NULL, NULL, '2026-05-01 22:22:18.287433+00', 1);


--
-- Data for Name: caja_arqueo_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: caja_sesion; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: catalogo_descuento; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.catalogo_descuento VALUES (1, 'Beneficio Tercera Edad', 'Descuento del 50% por ley para adultos mayores', 'TERCERA_EDAD', 50.0000, true, NULL, true, true);
INSERT INTO public.catalogo_descuento VALUES (2, 'Beneficio Discapacidad', 'Descuento del 50% por ley según carnet', 'DISCAPACIDAD', 50.0000, true, NULL, true, true);
INSERT INTO public.catalogo_descuento VALUES (3, 'Exención Tasa Seguridad', 'Exoneración de tasa de seguridad ciudadana', 'EXENCION_TASA', 100.0000, true, NULL, true, false);
INSERT INTO public.catalogo_descuento VALUES (4, 'Rebaja Interés Mora', 'Descuento autorizado sobre intereses acumulados', 'INTERES_MORA', 0.0000, false, NULL, true, false);


--
-- Data for Name: categoria_tarifa; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.categoria_tarifa VALUES (1, 'RESIDENCIAL', 'Tarifa para consumo doméstico estándar', 4.000000, 0, 0.400000, NULL, NULL, true, '2026-05-01 22:35:29.9', '2026-05-01 22:35:29.9', NULL);
INSERT INTO public.categoria_tarifa VALUES (2, 'COMERCIAL', 'Tarifa para locales comerciales y negocios', 7.500000, 0, 0.750000, NULL, NULL, true, '2026-05-01 22:35:29.904', '2026-05-01 22:35:29.904', NULL);
INSERT INTO public.categoria_tarifa VALUES (3, 'INDUSTRIAL', 'Tarifa para industrias y grandes consumidores', 15.000000, 0, 1.500000, NULL, NULL, true, '2026-05-01 22:35:29.907', '2026-05-01 22:35:29.907', NULL);
INSERT INTO public.categoria_tarifa VALUES (4, 'TERCERA EDAD', 'Tarifa subsidiada para adultos mayores', 4.000000, 0, 0.400000, NULL, NULL, true, '2026-05-01 22:35:29.908', '2026-05-01 22:35:29.908', NULL);
INSERT INTO public.categoria_tarifa VALUES (5, 'DISCAPACIDAD', 'Tarifa subsidiada para personas con discapacidad', 4.000000, 0, 0.400000, NULL, NULL, true, '2026-05-01 22:35:29.91', '2026-05-01 22:35:29.91', NULL);


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.clientes VALUES (1, 'Perez', NULL, 'juan@test.com', '1234567890', 'Juan', NULL, NULL, NULL, 'CEDULA', '2026-05-01 22:35:29.914', '2026-05-01 22:35:29.914', NULL, true, false, false);
INSERT INTO public.clientes VALUES (2, 'Gonzalez', NULL, 'maria@test.com', '1234567891', 'Maria', NULL, NULL, NULL, 'CEDULA', '2026-05-01 22:35:29.916', '2026-05-01 22:35:29.916', NULL, true, false, false);
INSERT INTO public.clientes VALUES (3, 'Lopez', NULL, 'pedro@test.com', '1234567892', 'Pedro', NULL, NULL, NULL, 'CEDULA', '2026-05-01 22:35:29.919', '2026-05-01 22:35:29.919', NULL, true, false, false);
INSERT INTO public.clientes VALUES (4, 'Apellido 4', NULL, 'cliente4@test.com', '13100000004', 'Cliente 4', NULL, '0990000004', NULL, 'CEDULA', '2026-05-01 22:35:29.921', '2026-05-01 22:35:29.921', NULL, true, false, false);
INSERT INTO public.clientes VALUES (5, 'Apellido 5', NULL, 'cliente5@test.com', '13100000005', 'Cliente 5', NULL, '0990000005', NULL, 'CEDULA', '2026-05-01 22:35:29.922', '2026-05-01 22:35:29.922', NULL, true, false, false);
INSERT INTO public.clientes VALUES (6, 'Apellido 6', NULL, 'cliente6@test.com', '13100000006', 'Cliente 6', NULL, '0990000006', NULL, 'CEDULA', '2026-05-01 22:35:29.924', '2026-05-01 22:35:29.924', NULL, true, false, false);
INSERT INTO public.clientes VALUES (7, 'Apellido 7', NULL, 'cliente7@test.com', '13100000007', 'Cliente 7', NULL, '0990000007', NULL, 'CEDULA', '2026-05-01 22:35:29.926', '2026-05-01 22:35:29.926', NULL, true, false, false);
INSERT INTO public.clientes VALUES (8, 'Apellido 8', NULL, 'cliente8@test.com', '13100000008', 'Cliente 8', NULL, '0990000008', NULL, 'CEDULA', '2026-05-01 22:35:29.927', '2026-05-01 22:35:29.927', NULL, true, false, false);
INSERT INTO public.clientes VALUES (9, 'Apellido 9', NULL, 'cliente9@test.com', '13100000009', 'Cliente 9', NULL, '0990000009', NULL, 'CEDULA', '2026-05-01 22:35:29.929', '2026-05-01 22:35:29.929', NULL, true, false, false);
INSERT INTO public.clientes VALUES (10, 'Apellido 10', NULL, 'cliente10@test.com', '13100000010', 'Cliente 10', NULL, '0990000010', NULL, 'CEDULA', '2026-05-01 22:35:29.93', '2026-05-01 22:35:29.93', NULL, true, false, false);
INSERT INTO public.clientes VALUES (11, 'Apellido 11', NULL, 'cliente11@test.com', '13100000011', 'Cliente 11', NULL, '0990000011', NULL, 'CEDULA', '2026-05-01 22:35:29.931', '2026-05-01 22:35:29.931', NULL, true, false, false);
INSERT INTO public.clientes VALUES (12, 'Apellido 12', NULL, 'cliente12@test.com', '13100000012', 'Cliente 12', NULL, '0990000012', NULL, 'CEDULA', '2026-05-01 22:35:29.933', '2026-05-01 22:35:29.933', NULL, true, false, false);
INSERT INTO public.clientes VALUES (13, 'Apellido 13', NULL, 'cliente13@test.com', '13100000013', 'Cliente 13', NULL, '0990000013', NULL, 'CEDULA', '2026-05-01 22:35:29.934', '2026-05-01 22:35:29.934', NULL, true, false, false);
INSERT INTO public.clientes VALUES (14, 'Apellido 14', NULL, 'cliente14@test.com', '13100000014', 'Cliente 14', NULL, '0990000014', NULL, 'CEDULA', '2026-05-01 22:35:29.935', '2026-05-01 22:35:29.935', NULL, true, false, false);
INSERT INTO public.clientes VALUES (15, 'Apellido 15', NULL, 'cliente15@test.com', '13100000015', 'Cliente 15', NULL, '0990000015', NULL, 'CEDULA', '2026-05-01 22:35:29.936', '2026-05-01 22:35:29.936', NULL, true, false, false);
INSERT INTO public.clientes VALUES (16, 'Apellido 16', NULL, 'cliente16@test.com', '13100000016', 'Cliente 16', NULL, '0990000016', NULL, 'CEDULA', '2026-05-01 22:35:29.937', '2026-05-01 22:35:29.937', NULL, true, false, false);
INSERT INTO public.clientes VALUES (17, 'Apellido 17', NULL, 'cliente17@test.com', '13100000017', 'Cliente 17', NULL, '0990000017', NULL, 'CEDULA', '2026-05-01 22:35:29.939', '2026-05-01 22:35:29.939', NULL, true, false, false);
INSERT INTO public.clientes VALUES (18, 'Apellido 18', NULL, 'cliente18@test.com', '13100000018', 'Cliente 18', NULL, '0990000018', NULL, 'CEDULA', '2026-05-01 22:35:29.94', '2026-05-01 22:35:29.94', NULL, true, false, false);
INSERT INTO public.clientes VALUES (19, 'Apellido 19', NULL, 'cliente19@test.com', '13100000019', 'Cliente 19', NULL, '0990000019', NULL, 'CEDULA', '2026-05-01 22:35:29.941', '2026-05-01 22:35:29.941', NULL, true, false, false);
INSERT INTO public.clientes VALUES (20, 'Apellido 20', NULL, 'cliente20@test.com', '13100000020', 'Cliente 20', NULL, '0990000020', NULL, 'CEDULA', '2026-05-01 22:35:29.943', '2026-05-01 22:35:29.943', NULL, true, false, false);
INSERT INTO public.clientes VALUES (21, 'Apellido 21', NULL, 'cliente21@test.com', '13100000021', 'Cliente 21', NULL, '0990000021', NULL, 'CEDULA', '2026-05-01 22:35:29.944', '2026-05-01 22:35:29.944', NULL, true, false, false);
INSERT INTO public.clientes VALUES (22, 'Apellido 22', NULL, 'cliente22@test.com', '13100000022', 'Cliente 22', NULL, '0990000022', NULL, 'CEDULA', '2026-05-01 22:35:29.945', '2026-05-01 22:35:29.945', NULL, true, false, false);
INSERT INTO public.clientes VALUES (23, 'Apellido 23', NULL, 'cliente23@test.com', '13100000023', 'Cliente 23', NULL, '0990000023', NULL, 'CEDULA', '2026-05-01 22:35:29.947', '2026-05-01 22:35:29.947', NULL, true, false, false);
INSERT INTO public.clientes VALUES (24, 'Apellido 24', NULL, 'cliente24@test.com', '13100000024', 'Cliente 24', NULL, '0990000024', NULL, 'CEDULA', '2026-05-01 22:35:29.948', '2026-05-01 22:35:29.948', NULL, true, false, false);
INSERT INTO public.clientes VALUES (25, 'Apellido 25', NULL, 'cliente25@test.com', '13100000025', 'Cliente 25', NULL, '0990000025', NULL, 'CEDULA', '2026-05-01 22:35:29.95', '2026-05-01 22:35:29.95', NULL, true, false, false);
INSERT INTO public.clientes VALUES (26, 'Apellido 26', NULL, 'cliente26@test.com', '13100000026', 'Cliente 26', NULL, '0990000026', NULL, 'CEDULA', '2026-05-01 22:35:29.951', '2026-05-01 22:35:29.951', NULL, true, false, false);
INSERT INTO public.clientes VALUES (27, 'Apellido 27', NULL, 'cliente27@test.com', '13100000027', 'Cliente 27', NULL, '0990000027', NULL, 'CEDULA', '2026-05-01 22:35:29.952', '2026-05-01 22:35:29.952', NULL, true, false, false);
INSERT INTO public.clientes VALUES (28, 'Apellido 28', NULL, 'cliente28@test.com', '13100000028', 'Cliente 28', NULL, '0990000028', NULL, 'CEDULA', '2026-05-01 22:35:29.954', '2026-05-01 22:35:29.954', NULL, true, false, false);
INSERT INTO public.clientes VALUES (29, 'Apellido 29', NULL, 'cliente29@test.com', '13100000029', 'Cliente 29', NULL, '0990000029', NULL, 'CEDULA', '2026-05-01 22:35:29.955', '2026-05-01 22:35:29.955', NULL, true, false, false);
INSERT INTO public.clientes VALUES (30, 'Apellido 30', NULL, 'cliente30@test.com', '13100000030', 'Cliente 30', NULL, '0990000030', NULL, 'CEDULA', '2026-05-01 22:35:29.956', '2026-05-01 22:35:29.956', NULL, true, false, false);
INSERT INTO public.clientes VALUES (31, 'Apellido 31', NULL, 'cliente31@test.com', '13100000031', 'Cliente 31', NULL, '0990000031', NULL, 'CEDULA', '2026-05-01 22:35:29.958', '2026-05-01 22:35:29.958', NULL, true, false, false);
INSERT INTO public.clientes VALUES (32, 'Apellido 32', NULL, 'cliente32@test.com', '13100000032', 'Cliente 32', NULL, '0990000032', NULL, 'CEDULA', '2026-05-01 22:35:29.959', '2026-05-01 22:35:29.959', NULL, true, false, false);
INSERT INTO public.clientes VALUES (33, 'Apellido 33', NULL, 'cliente33@test.com', '13100000033', 'Cliente 33', NULL, '0990000033', NULL, 'CEDULA', '2026-05-01 22:35:29.96', '2026-05-01 22:35:29.96', NULL, true, false, false);
INSERT INTO public.clientes VALUES (34, 'Apellido 34', NULL, 'cliente34@test.com', '13100000034', 'Cliente 34', NULL, '0990000034', NULL, 'CEDULA', '2026-05-01 22:35:29.962', '2026-05-01 22:35:29.962', NULL, true, false, false);
INSERT INTO public.clientes VALUES (35, 'Apellido 35', NULL, 'cliente35@test.com', '13100000035', 'Cliente 35', NULL, '0990000035', NULL, 'CEDULA', '2026-05-01 22:35:29.963', '2026-05-01 22:35:29.963', NULL, true, false, false);
INSERT INTO public.clientes VALUES (36, 'Apellido 36', NULL, 'cliente36@test.com', '13100000036', 'Cliente 36', NULL, '0990000036', NULL, 'CEDULA', '2026-05-01 22:35:29.964', '2026-05-01 22:35:29.964', NULL, true, false, false);
INSERT INTO public.clientes VALUES (37, 'Apellido 37', NULL, 'cliente37@test.com', '13100000037', 'Cliente 37', NULL, '0990000037', NULL, 'CEDULA', '2026-05-01 22:35:29.966', '2026-05-01 22:35:29.966', NULL, true, false, false);
INSERT INTO public.clientes VALUES (38, 'Apellido 38', NULL, 'cliente38@test.com', '13100000038', 'Cliente 38', NULL, '0990000038', NULL, 'CEDULA', '2026-05-01 22:35:29.967', '2026-05-01 22:35:29.967', NULL, true, false, false);
INSERT INTO public.clientes VALUES (39, 'Apellido 39', NULL, 'cliente39@test.com', '13100000039', 'Cliente 39', NULL, '0990000039', NULL, 'CEDULA', '2026-05-01 22:35:29.968', '2026-05-01 22:35:29.968', NULL, true, false, false);
INSERT INTO public.clientes VALUES (40, 'Apellido 40', NULL, 'cliente40@test.com', '13100000040', 'Cliente 40', NULL, '0990000040', NULL, 'CEDULA', '2026-05-01 22:35:29.97', '2026-05-01 22:35:29.97', NULL, true, false, false);
INSERT INTO public.clientes VALUES (41, 'Apellido 41', NULL, 'cliente41@test.com', '13100000041', 'Cliente 41', NULL, '0990000041', NULL, 'CEDULA', '2026-05-01 22:35:29.971', '2026-05-01 22:35:29.971', NULL, true, false, false);
INSERT INTO public.clientes VALUES (42, 'Apellido 42', NULL, 'cliente42@test.com', '13100000042', 'Cliente 42', NULL, '0990000042', NULL, 'CEDULA', '2026-05-01 22:35:29.973', '2026-05-01 22:35:29.973', NULL, true, false, false);
INSERT INTO public.clientes VALUES (43, 'Apellido 43', NULL, 'cliente43@test.com', '13100000043', 'Cliente 43', NULL, '0990000043', NULL, 'CEDULA', '2026-05-01 22:35:29.974', '2026-05-01 22:35:29.974', NULL, true, false, false);
INSERT INTO public.clientes VALUES (44, 'Apellido 44', NULL, 'cliente44@test.com', '13100000044', 'Cliente 44', NULL, '0990000044', NULL, 'CEDULA', '2026-05-01 22:35:29.975', '2026-05-01 22:35:29.975', NULL, true, false, false);
INSERT INTO public.clientes VALUES (45, 'Apellido 45', NULL, 'cliente45@test.com', '13100000045', 'Cliente 45', NULL, '0990000045', NULL, 'CEDULA', '2026-05-01 22:35:29.977', '2026-05-01 22:35:29.977', NULL, true, false, false);
INSERT INTO public.clientes VALUES (46, 'Apellido 46', NULL, 'cliente46@test.com', '13100000046', 'Cliente 46', NULL, '0990000046', NULL, 'CEDULA', '2026-05-01 22:35:29.979', '2026-05-01 22:35:29.979', NULL, true, false, false);
INSERT INTO public.clientes VALUES (47, 'Apellido 47', NULL, 'cliente47@test.com', '13100000047', 'Cliente 47', NULL, '0990000047', NULL, 'CEDULA', '2026-05-01 22:35:29.98', '2026-05-01 22:35:29.98', NULL, true, false, false);
INSERT INTO public.clientes VALUES (48, 'Apellido 48', NULL, 'cliente48@test.com', '13100000048', 'Cliente 48', NULL, '0990000048', NULL, 'CEDULA', '2026-05-01 22:35:29.982', '2026-05-01 22:35:29.982', NULL, true, false, false);
INSERT INTO public.clientes VALUES (49, 'Apellido 49', NULL, 'cliente49@test.com', '13100000049', 'Cliente 49', NULL, '0990000049', NULL, 'CEDULA', '2026-05-01 22:35:29.984', '2026-05-01 22:35:29.984', NULL, true, false, false);
INSERT INTO public.clientes VALUES (50, 'Apellido 50', NULL, 'cliente50@test.com', '13100000050', 'Cliente 50', NULL, '0990000050', NULL, 'CEDULA', '2026-05-01 22:35:29.986', '2026-05-01 22:35:29.986', NULL, true, false, false);
INSERT INTO public.clientes VALUES (51, 'Apellido 51', NULL, 'cliente51@test.com', '13100000051', 'Cliente 51', NULL, '0990000051', NULL, 'CEDULA', '2026-05-01 22:35:29.987', '2026-05-01 22:35:29.987', NULL, true, false, false);
INSERT INTO public.clientes VALUES (52, 'Apellido 52', NULL, 'cliente52@test.com', '13100000052', 'Cliente 52', NULL, '0990000052', NULL, 'CEDULA', '2026-05-01 22:35:29.989', '2026-05-01 22:35:29.989', NULL, true, false, false);
INSERT INTO public.clientes VALUES (53, 'Apellido 53', NULL, 'cliente53@test.com', '13100000053', 'Cliente 53', NULL, '0990000053', NULL, 'CEDULA', '2026-05-01 22:35:29.991', '2026-05-01 22:35:29.991', NULL, true, false, false);
INSERT INTO public.clientes VALUES (54, 'Apellido 54', NULL, 'cliente54@test.com', '13100000054', 'Cliente 54', NULL, '0990000054', NULL, 'CEDULA', '2026-05-01 22:35:29.993', '2026-05-01 22:35:29.993', NULL, true, false, false);
INSERT INTO public.clientes VALUES (55, 'Apellido 55', NULL, 'cliente55@test.com', '13100000055', 'Cliente 55', NULL, '0990000055', NULL, 'CEDULA', '2026-05-01 22:35:29.995', '2026-05-01 22:35:29.995', NULL, true, false, false);
INSERT INTO public.clientes VALUES (56, 'Apellido 56', NULL, 'cliente56@test.com', '13100000056', 'Cliente 56', NULL, '0990000056', NULL, 'CEDULA', '2026-05-01 22:35:29.997', '2026-05-01 22:35:29.997', NULL, true, false, false);
INSERT INTO public.clientes VALUES (57, 'Apellido 57', NULL, 'cliente57@test.com', '13100000057', 'Cliente 57', NULL, '0990000057', NULL, 'CEDULA', '2026-05-01 22:35:29.998', '2026-05-01 22:35:29.998', NULL, true, false, false);
INSERT INTO public.clientes VALUES (58, 'Apellido 58', NULL, 'cliente58@test.com', '13100000058', 'Cliente 58', NULL, '0990000058', NULL, 'CEDULA', '2026-05-01 22:35:30', '2026-05-01 22:35:30', NULL, true, false, false);
INSERT INTO public.clientes VALUES (59, 'Apellido 59', NULL, 'cliente59@test.com', '13100000059', 'Cliente 59', NULL, '0990000059', NULL, 'CEDULA', '2026-05-01 22:35:30.001', '2026-05-01 22:35:30.001', NULL, true, false, false);
INSERT INTO public.clientes VALUES (60, 'Apellido 60', NULL, 'cliente60@test.com', '13100000060', 'Cliente 60', NULL, '0990000060', NULL, 'CEDULA', '2026-05-01 22:35:30.003', '2026-05-01 22:35:30.003', NULL, true, false, false);
INSERT INTO public.clientes VALUES (61, 'Apellido 61', NULL, 'cliente61@test.com', '13100000061', 'Cliente 61', NULL, '0990000061', NULL, 'CEDULA', '2026-05-01 22:35:30.005', '2026-05-01 22:35:30.005', NULL, true, false, false);
INSERT INTO public.clientes VALUES (62, 'Apellido 62', NULL, 'cliente62@test.com', '13100000062', 'Cliente 62', NULL, '0990000062', NULL, 'CEDULA', '2026-05-01 22:35:30.006', '2026-05-01 22:35:30.006', NULL, true, false, false);
INSERT INTO public.clientes VALUES (63, 'Apellido 63', NULL, 'cliente63@test.com', '13100000063', 'Cliente 63', NULL, '0990000063', NULL, 'CEDULA', '2026-05-01 22:35:30.008', '2026-05-01 22:35:30.008', NULL, true, false, false);
INSERT INTO public.clientes VALUES (64, 'Apellido 64', NULL, 'cliente64@test.com', '13100000064', 'Cliente 64', NULL, '0990000064', NULL, 'CEDULA', '2026-05-01 22:35:30.01', '2026-05-01 22:35:30.01', NULL, true, false, false);
INSERT INTO public.clientes VALUES (65, 'Apellido 65', NULL, 'cliente65@test.com', '13100000065', 'Cliente 65', NULL, '0990000065', NULL, 'CEDULA', '2026-05-01 22:35:30.012', '2026-05-01 22:35:30.012', NULL, true, false, false);
INSERT INTO public.clientes VALUES (66, 'Apellido 66', NULL, 'cliente66@test.com', '13100000066', 'Cliente 66', NULL, '0990000066', NULL, 'CEDULA', '2026-05-01 22:35:30.019', '2026-05-01 22:35:30.019', NULL, true, false, false);
INSERT INTO public.clientes VALUES (67, 'Apellido 67', NULL, 'cliente67@test.com', '13100000067', 'Cliente 67', NULL, '0990000067', NULL, 'CEDULA', '2026-05-01 22:35:30.032', '2026-05-01 22:35:30.032', NULL, true, false, false);
INSERT INTO public.clientes VALUES (68, 'Apellido 68', NULL, 'cliente68@test.com', '13100000068', 'Cliente 68', NULL, '0990000068', NULL, 'CEDULA', '2026-05-01 22:35:30.043', '2026-05-01 22:35:30.043', NULL, true, false, false);
INSERT INTO public.clientes VALUES (69, 'Apellido 69', NULL, 'cliente69@test.com', '13100000069', 'Cliente 69', NULL, '0990000069', NULL, 'CEDULA', '2026-05-01 22:35:30.057', '2026-05-01 22:35:30.057', NULL, true, false, false);
INSERT INTO public.clientes VALUES (70, 'Apellido 70', NULL, 'cliente70@test.com', '13100000070', 'Cliente 70', NULL, '0990000070', NULL, 'CEDULA', '2026-05-01 22:35:30.072', '2026-05-01 22:35:30.072', NULL, true, false, false);
INSERT INTO public.clientes VALUES (71, 'Apellido 71', NULL, 'cliente71@test.com', '13100000071', 'Cliente 71', NULL, '0990000071', NULL, 'CEDULA', '2026-05-01 22:35:30.082', '2026-05-01 22:35:30.082', NULL, true, false, false);
INSERT INTO public.clientes VALUES (72, 'Apellido 72', NULL, 'cliente72@test.com', '13100000072', 'Cliente 72', NULL, '0990000072', NULL, 'CEDULA', '2026-05-01 22:35:30.094', '2026-05-01 22:35:30.094', NULL, true, false, false);
INSERT INTO public.clientes VALUES (73, 'Apellido 73', NULL, 'cliente73@test.com', '13100000073', 'Cliente 73', NULL, '0990000073', NULL, 'CEDULA', '2026-05-01 22:35:30.103', '2026-05-01 22:35:30.103', NULL, true, false, false);
INSERT INTO public.clientes VALUES (74, 'Apellido 74', NULL, 'cliente74@test.com', '13100000074', 'Cliente 74', NULL, '0990000074', NULL, 'CEDULA', '2026-05-01 22:35:30.115', '2026-05-01 22:35:30.115', NULL, true, false, false);
INSERT INTO public.clientes VALUES (75, 'Apellido 75', NULL, 'cliente75@test.com', '13100000075', 'Cliente 75', NULL, '0990000075', NULL, 'CEDULA', '2026-05-01 22:35:30.124', '2026-05-01 22:35:30.124', NULL, true, false, false);
INSERT INTO public.clientes VALUES (76, 'Apellido 76', NULL, 'cliente76@test.com', '13100000076', 'Cliente 76', NULL, '0990000076', NULL, 'CEDULA', '2026-05-01 22:35:30.136', '2026-05-01 22:35:30.136', NULL, true, false, false);
INSERT INTO public.clientes VALUES (77, 'Apellido 77', NULL, 'cliente77@test.com', '13100000077', 'Cliente 77', NULL, '0990000077', NULL, 'CEDULA', '2026-05-01 22:35:30.142', '2026-05-01 22:35:30.142', NULL, true, false, false);
INSERT INTO public.clientes VALUES (78, 'Apellido 78', NULL, 'cliente78@test.com', '13100000078', 'Cliente 78', NULL, '0990000078', NULL, 'CEDULA', '2026-05-01 22:35:30.146', '2026-05-01 22:35:30.146', NULL, true, false, false);
INSERT INTO public.clientes VALUES (79, 'Apellido 79', NULL, 'cliente79@test.com', '13100000079', 'Cliente 79', NULL, '0990000079', NULL, 'CEDULA', '2026-05-01 22:35:30.159', '2026-05-01 22:35:30.159', NULL, true, false, false);
INSERT INTO public.clientes VALUES (80, 'Apellido 80', NULL, 'cliente80@test.com', '13100000080', 'Cliente 80', NULL, '0990000080', NULL, 'CEDULA', '2026-05-01 22:35:30.168', '2026-05-01 22:35:30.168', NULL, true, false, false);
INSERT INTO public.clientes VALUES (81, 'Apellido 81', NULL, 'cliente81@test.com', '13100000081', 'Cliente 81', NULL, '0990000081', NULL, 'CEDULA', '2026-05-01 22:35:30.189', '2026-05-01 22:35:30.189', NULL, true, false, false);
INSERT INTO public.clientes VALUES (82, 'Apellido 82', NULL, 'cliente82@test.com', '13100000082', 'Cliente 82', NULL, '0990000082', NULL, 'CEDULA', '2026-05-01 22:35:30.191', '2026-05-01 22:35:30.191', NULL, true, false, false);
INSERT INTO public.clientes VALUES (83, 'Apellido 83', NULL, 'cliente83@test.com', '13100000083', 'Cliente 83', NULL, '0990000083', NULL, 'CEDULA', '2026-05-01 22:35:30.193', '2026-05-01 22:35:30.193', NULL, true, false, false);
INSERT INTO public.clientes VALUES (84, 'Apellido 84', NULL, 'cliente84@test.com', '13100000084', 'Cliente 84', NULL, '0990000084', NULL, 'CEDULA', '2026-05-01 22:35:30.194', '2026-05-01 22:35:30.194', NULL, true, false, false);
INSERT INTO public.clientes VALUES (85, 'Apellido 85', NULL, 'cliente85@test.com', '13100000085', 'Cliente 85', NULL, '0990000085', NULL, 'CEDULA', '2026-05-01 22:35:30.199', '2026-05-01 22:35:30.199', NULL, true, false, false);
INSERT INTO public.clientes VALUES (86, 'Apellido 86', NULL, 'cliente86@test.com', '13100000086', 'Cliente 86', NULL, '0990000086', NULL, 'CEDULA', '2026-05-01 22:35:30.201', '2026-05-01 22:35:30.201', NULL, true, false, false);
INSERT INTO public.clientes VALUES (87, 'Apellido 87', NULL, 'cliente87@test.com', '13100000087', 'Cliente 87', NULL, '0990000087', NULL, 'CEDULA', '2026-05-01 22:35:30.203', '2026-05-01 22:35:30.203', NULL, true, false, false);
INSERT INTO public.clientes VALUES (88, 'Apellido 88', NULL, 'cliente88@test.com', '13100000088', 'Cliente 88', NULL, '0990000088', NULL, 'CEDULA', '2026-05-01 22:35:30.204', '2026-05-01 22:35:30.204', NULL, true, false, false);
INSERT INTO public.clientes VALUES (89, 'Apellido 89', NULL, 'cliente89@test.com', '13100000089', 'Cliente 89', NULL, '0990000089', NULL, 'CEDULA', '2026-05-01 22:35:30.205', '2026-05-01 22:35:30.205', NULL, true, false, false);
INSERT INTO public.clientes VALUES (90, 'Apellido 90', NULL, 'cliente90@test.com', '13100000090', 'Cliente 90', NULL, '0990000090', NULL, 'CEDULA', '2026-05-01 22:35:30.207', '2026-05-01 22:35:30.207', NULL, true, false, false);
INSERT INTO public.clientes VALUES (91, 'Apellido 91', NULL, 'cliente91@test.com', '13100000091', 'Cliente 91', NULL, '0990000091', NULL, 'CEDULA', '2026-05-01 22:35:30.211', '2026-05-01 22:35:30.211', NULL, true, false, false);
INSERT INTO public.clientes VALUES (92, 'Apellido 92', NULL, 'cliente92@test.com', '13100000092', 'Cliente 92', NULL, '0990000092', NULL, 'CEDULA', '2026-05-01 22:35:30.213', '2026-05-01 22:35:30.213', NULL, true, false, false);
INSERT INTO public.clientes VALUES (93, 'Apellido 93', NULL, 'cliente93@test.com', '13100000093', 'Cliente 93', NULL, '0990000093', NULL, 'CEDULA', '2026-05-01 22:35:30.214', '2026-05-01 22:35:30.214', NULL, true, false, false);
INSERT INTO public.clientes VALUES (94, 'Apellido 94', NULL, 'cliente94@test.com', '13100000094', 'Cliente 94', NULL, '0990000094', NULL, 'CEDULA', '2026-05-01 22:35:30.215', '2026-05-01 22:35:30.215', NULL, true, false, false);
INSERT INTO public.clientes VALUES (95, 'Apellido 95', NULL, 'cliente95@test.com', '13100000095', 'Cliente 95', NULL, '0990000095', NULL, 'CEDULA', '2026-05-01 22:35:30.217', '2026-05-01 22:35:30.217', NULL, true, false, false);
INSERT INTO public.clientes VALUES (96, 'Apellido 96', NULL, 'cliente96@test.com', '13100000096', 'Cliente 96', NULL, '0990000096', NULL, 'CEDULA', '2026-05-01 22:35:30.218', '2026-05-01 22:35:30.218', NULL, true, false, false);
INSERT INTO public.clientes VALUES (97, 'Apellido 97', NULL, 'cliente97@test.com', '13100000097', 'Cliente 97', NULL, '0990000097', NULL, 'CEDULA', '2026-05-01 22:35:30.226', '2026-05-01 22:35:30.226', NULL, true, false, false);
INSERT INTO public.clientes VALUES (98, 'Apellido 98', NULL, 'cliente98@test.com', '13100000098', 'Cliente 98', NULL, '0990000098', NULL, 'CEDULA', '2026-05-01 22:35:30.24', '2026-05-01 22:35:30.24', NULL, true, false, false);
INSERT INTO public.clientes VALUES (99, 'Apellido 99', NULL, 'cliente99@test.com', '13100000099', 'Cliente 99', NULL, '0990000099', NULL, 'CEDULA', '2026-05-01 22:35:30.241', '2026-05-01 22:35:30.241', NULL, true, false, false);
INSERT INTO public.clientes VALUES (100, 'Apellido 100', NULL, 'cliente100@test.com', '13100000100', 'Cliente 100', NULL, '0990000100', NULL, 'CEDULA', '2026-05-01 22:35:30.242', '2026-05-01 22:35:30.242', NULL, true, false, false);
INSERT INTO public.clientes VALUES (101, 'Apellido 101', NULL, 'cliente101@test.com', '13100000101', 'Cliente 101', NULL, '0990000101', NULL, 'CEDULA', '2026-05-01 22:35:30.244', '2026-05-01 22:35:30.244', NULL, true, false, false);
INSERT INTO public.clientes VALUES (102, 'Apellido 102', NULL, 'cliente102@test.com', '13100000102', 'Cliente 102', NULL, '0990000102', NULL, 'CEDULA', '2026-05-01 22:35:30.256', '2026-05-01 22:35:30.256', NULL, true, false, false);
INSERT INTO public.clientes VALUES (103, 'Apellido 103', NULL, 'cliente103@test.com', '13100000103', 'Cliente 103', NULL, '0990000103', NULL, 'CEDULA', '2026-05-01 22:35:30.266', '2026-05-01 22:35:30.266', NULL, true, false, false);


--
-- Data for Name: comunidades; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.comunidades VALUES (1, 'Olon', '001', 5, '2026-05-01 22:35:29.792', '2026-05-01 22:35:29.792', NULL);
INSERT INTO public.comunidades VALUES (2, 'Nuñez', '002', 0, '2026-05-01 22:35:29.802', '2026-05-01 22:35:29.802', NULL);
INSERT INTO public.comunidades VALUES (3, 'La Entrada', '003', 3, '2026-05-01 22:35:29.836', '2026-05-01 22:35:29.836', NULL);
INSERT INTO public.comunidades VALUES (4, 'San Jose', '004', 2, '2026-05-01 22:35:29.86', '2026-05-01 22:35:29.86', NULL);
INSERT INTO public.comunidades VALUES (5, 'Curia', '005', 0, '2026-05-01 22:35:29.865', '2026-05-01 22:35:29.865', NULL);


--
-- Data for Name: contratos; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.contratos VALUES (1, 1, 1, 1, 'GUIA-OLON-001', '2026-05-01 22:35:30.289', 'Direccion contrato 1', 'ACTIVO', '2026-05-01 22:35:30.289', '2026-05-01 22:35:30.289', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (2, 2, 2, 1, 'GUIA-OLON-002', '2026-05-01 22:35:30.312', 'Direccion contrato 2', 'ACTIVO', '2026-05-01 22:35:30.312', '2026-05-01 22:35:30.312', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (3, 3, NULL, 1, 'GUIA-NUNEZ-001', '2026-05-01 22:35:30.335', 'Direccion contrato 3', 'ACTIVO', '2026-05-01 22:35:30.335', '2026-05-01 22:35:30.335', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (4, 4, NULL, 1, 'GUIA-2-0004', '2026-05-01 22:35:30.35', 'Direccion contrato 4', 'ACTIVO', '2026-05-01 22:35:30.35', '2026-05-01 22:35:30.35', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (5, 5, NULL, 1, 'GUIA-4-0005', '2026-05-01 22:35:30.364', 'Direccion contrato 5', 'ACTIVO', '2026-05-01 22:35:30.364', '2026-05-01 22:35:30.364', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (6, 6, NULL, 2, 'GUIA-4-0006', '2026-05-01 22:35:30.379', 'Direccion contrato 6', 'ACTIVO', '2026-05-01 22:35:30.379', '2026-05-01 22:35:30.379', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (7, 7, NULL, 3, 'GUIA-4-0007', '2026-05-01 22:35:30.391', 'Direccion contrato 7', 'ACTIVO', '2026-05-01 22:35:30.391', '2026-05-01 22:35:30.391', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (8, 8, NULL, 2, 'GUIA-2-0008', '2026-05-01 22:35:30.411', 'Direccion contrato 8', 'ACTIVO', '2026-05-01 22:35:30.411', '2026-05-01 22:35:30.411', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (9, 9, NULL, 3, 'GUIA-3-0009', '2026-05-01 22:35:30.422', 'Direccion contrato 9', 'ACTIVO', '2026-05-01 22:35:30.422', '2026-05-01 22:35:30.422', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (10, 10, 2, 1, 'GUIA-1-0010', '2026-05-01 22:35:30.425', 'Direccion contrato 10', 'ACTIVO', '2026-05-01 22:35:30.425', '2026-05-01 22:35:30.425', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (11, 11, NULL, 2, 'GUIA-2-0011', '2026-05-01 22:35:30.438', 'Direccion contrato 11', 'ACTIVO', '2026-05-01 22:35:30.438', '2026-05-01 22:35:30.438', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (12, 12, NULL, 2, 'GUIA-5-0012', '2026-05-01 22:35:30.451', 'Direccion contrato 12', 'ACTIVO', '2026-05-01 22:35:30.451', '2026-05-01 22:35:30.451', NULL, NULL, 5);
INSERT INTO public.contratos VALUES (13, 13, NULL, 2, 'GUIA-2-0013', '2026-05-01 22:35:30.466', 'Direccion contrato 13', 'ACTIVO', '2026-05-01 22:35:30.466', '2026-05-01 22:35:30.466', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (14, 14, NULL, 2, 'GUIA-2-0014', '2026-05-01 22:35:30.469', 'Direccion contrato 14', 'ACTIVO', '2026-05-01 22:35:30.469', '2026-05-01 22:35:30.469', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (15, 15, NULL, 2, 'GUIA-5-0015', '2026-05-01 22:35:30.471', 'Direccion contrato 15', 'ACTIVO', '2026-05-01 22:35:30.471', '2026-05-01 22:35:30.471', NULL, NULL, 5);
INSERT INTO public.contratos VALUES (16, 16, 2, 2, 'GUIA-1-0016', '2026-05-01 22:35:30.473', 'Direccion contrato 16', 'ACTIVO', '2026-05-01 22:35:30.473', '2026-05-01 22:35:30.473', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (17, 17, NULL, 3, 'GUIA-3-0017', '2026-05-01 22:35:30.474', 'Direccion contrato 17', 'ACTIVO', '2026-05-01 22:35:30.474', '2026-05-01 22:35:30.474', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (18, 18, NULL, 1, 'GUIA-4-0018', '2026-05-01 22:35:30.48', 'Direccion contrato 18', 'ACTIVO', '2026-05-01 22:35:30.48', '2026-05-01 22:35:30.48', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (19, 19, NULL, 2, 'GUIA-3-0019', '2026-05-01 22:35:30.482', 'Direccion contrato 19', 'ACTIVO', '2026-05-01 22:35:30.482', '2026-05-01 22:35:30.482', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (20, 20, NULL, 1, 'GUIA-4-0020', '2026-05-01 22:35:30.484', 'Direccion contrato 20', 'ACTIVO', '2026-05-01 22:35:30.484', '2026-05-01 22:35:30.484', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (21, 21, NULL, 3, 'GUIA-4-0021', '2026-05-01 22:35:30.49', 'Direccion contrato 21', 'ACTIVO', '2026-05-01 22:35:30.49', '2026-05-01 22:35:30.49', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (22, 22, 4, 3, 'GUIA-1-0022', '2026-05-01 22:35:30.493', 'Direccion contrato 22', 'ACTIVO', '2026-05-01 22:35:30.493', '2026-05-01 22:35:30.493', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (23, 23, NULL, 3, 'GUIA-4-0023', '2026-05-01 22:35:30.495', 'Direccion contrato 23', 'ACTIVO', '2026-05-01 22:35:30.495', '2026-05-01 22:35:30.495', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (24, 24, NULL, 2, 'GUIA-3-0024', '2026-05-01 22:35:30.496', 'Direccion contrato 24', 'ACTIVO', '2026-05-01 22:35:30.496', '2026-05-01 22:35:30.496', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (25, 25, NULL, 3, 'GUIA-4-0025', '2026-05-01 22:35:30.498', 'Direccion contrato 25', 'ACTIVO', '2026-05-01 22:35:30.498', '2026-05-01 22:35:30.498', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (26, 26, NULL, 2, 'GUIA-3-0026', '2026-05-01 22:35:30.499', 'Direccion contrato 26', 'ACTIVO', '2026-05-01 22:35:30.499', '2026-05-01 22:35:30.499', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (27, 27, NULL, 1, 'GUIA-5-0027', '2026-05-01 22:35:30.5', 'Direccion contrato 27', 'ACTIVO', '2026-05-01 22:35:30.5', '2026-05-01 22:35:30.5', NULL, NULL, 5);
INSERT INTO public.contratos VALUES (28, 28, 1, 2, 'GUIA-1-0028', '2026-05-01 22:35:30.502', 'Direccion contrato 28', 'ACTIVO', '2026-05-01 22:35:30.502', '2026-05-01 22:35:30.502', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (29, 29, NULL, 1, 'GUIA-2-0029', '2026-05-01 22:35:30.504', 'Direccion contrato 29', 'ACTIVO', '2026-05-01 22:35:30.504', '2026-05-01 22:35:30.504', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (30, 30, NULL, 3, 'GUIA-5-0030', '2026-05-01 22:35:30.505', 'Direccion contrato 30', 'ACTIVO', '2026-05-01 22:35:30.505', '2026-05-01 22:35:30.505', NULL, NULL, 5);
INSERT INTO public.contratos VALUES (31, 31, NULL, 1, 'GUIA-3-0031', '2026-05-01 22:35:30.506', 'Direccion contrato 31', 'ACTIVO', '2026-05-01 22:35:30.506', '2026-05-01 22:35:30.506', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (32, 32, NULL, 2, 'GUIA-3-0032', '2026-05-01 22:35:30.508', 'Direccion contrato 32', 'ACTIVO', '2026-05-01 22:35:30.508', '2026-05-01 22:35:30.508', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (33, 33, NULL, 3, 'GUIA-4-0033', '2026-05-01 22:35:30.509', 'Direccion contrato 33', 'ACTIVO', '2026-05-01 22:35:30.509', '2026-05-01 22:35:30.509', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (34, 34, NULL, 2, 'GUIA-2-0034', '2026-05-01 22:35:30.511', 'Direccion contrato 34', 'ACTIVO', '2026-05-01 22:35:30.511', '2026-05-01 22:35:30.511', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (35, 35, NULL, 3, 'GUIA-3-0035', '2026-05-01 22:35:30.512', 'Direccion contrato 35', 'ACTIVO', '2026-05-01 22:35:30.512', '2026-05-01 22:35:30.512', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (36, 36, NULL, 1, 'GUIA-3-0036', '2026-05-01 22:35:30.514', 'Direccion contrato 36', 'ACTIVO', '2026-05-01 22:35:30.514', '2026-05-01 22:35:30.514', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (37, 37, NULL, 3, 'GUIA-2-0037', '2026-05-01 22:35:30.515', 'Direccion contrato 37', 'ACTIVO', '2026-05-01 22:35:30.515', '2026-05-01 22:35:30.515', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (38, 38, NULL, 1, 'GUIA-5-0038', '2026-05-01 22:35:30.516', 'Direccion contrato 38', 'ACTIVO', '2026-05-01 22:35:30.516', '2026-05-01 22:35:30.516', NULL, NULL, 5);
INSERT INTO public.contratos VALUES (39, 39, NULL, 3, 'GUIA-4-0039', '2026-05-01 22:35:30.518', 'Direccion contrato 39', 'ACTIVO', '2026-05-01 22:35:30.518', '2026-05-01 22:35:30.518', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (40, 40, 4, 1, 'GUIA-1-0040', '2026-05-01 22:35:30.519', 'Direccion contrato 40', 'ACTIVO', '2026-05-01 22:35:30.519', '2026-05-01 22:35:30.519', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (41, 41, 1, 3, 'GUIA-1-0041', '2026-05-01 22:35:30.52', 'Direccion contrato 41', 'ACTIVO', '2026-05-01 22:35:30.52', '2026-05-01 22:35:30.52', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (42, 42, NULL, 3, 'GUIA-2-0042', '2026-05-01 22:35:30.522', 'Direccion contrato 42', 'ACTIVO', '2026-05-01 22:35:30.522', '2026-05-01 22:35:30.522', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (43, 43, NULL, 1, 'GUIA-5-0043', '2026-05-01 22:35:30.531', 'Direccion contrato 43', 'ACTIVO', '2026-05-01 22:35:30.531', '2026-05-01 22:35:30.531', NULL, NULL, 5);
INSERT INTO public.contratos VALUES (44, 44, NULL, 1, 'GUIA-4-0044', '2026-05-01 22:35:30.543', 'Direccion contrato 44', 'ACTIVO', '2026-05-01 22:35:30.543', '2026-05-01 22:35:30.543', NULL, NULL, 4);
INSERT INTO public.contratos VALUES (45, 45, NULL, 2, 'GUIA-2-0045', '2026-05-01 22:35:30.545', 'Direccion contrato 45', 'ACTIVO', '2026-05-01 22:35:30.545', '2026-05-01 22:35:30.545', NULL, NULL, 2);
INSERT INTO public.contratos VALUES (46, 46, 1, 3, 'GUIA-1-0046', '2026-05-01 22:35:30.559', 'Direccion contrato 46', 'ACTIVO', '2026-05-01 22:35:30.559', '2026-05-01 22:35:30.559', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (47, 47, NULL, 2, 'GUIA-3-0047', '2026-05-01 22:35:30.567', 'Direccion contrato 47', 'ACTIVO', '2026-05-01 22:35:30.567', '2026-05-01 22:35:30.567', NULL, NULL, 3);
INSERT INTO public.contratos VALUES (48, 48, 3, 3, 'GUIA-1-0048', '2026-05-01 22:35:30.58', 'Direccion contrato 48', 'ACTIVO', '2026-05-01 22:35:30.58', '2026-05-01 22:35:30.58', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (49, 49, 1, 2, 'GUIA-1-0049', '2026-05-01 22:35:30.59', 'Direccion contrato 49', 'ACTIVO', '2026-05-01 22:35:30.59', '2026-05-01 22:35:30.59', NULL, NULL, 1);
INSERT INTO public.contratos VALUES (50, 50, NULL, 3, 'GUIA-5-0050', '2026-05-01 22:35:30.606', 'Direccion contrato 50', 'ACTIVO', '2026-05-01 22:35:30.606', '2026-05-01 22:35:30.606', NULL, NULL, 5);


--
-- Data for Name: convenios; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: cuota_convenio; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: descuento_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.descuento_detalle VALUES (1, 2.5000, NULL, NULL, '2026-05-01 22:35:32.025', 1, true, 50.0000, 1);


--
-- Data for Name: detalle_pago; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.empresa VALUES (1, '2490012345001', 'JUNTA ADMINISTRADORA DE AGUA POTABLE OLON', 'JAAP OLON', 'Calle Principal Olón', false, NULL, NULL, NULL, NULL, 'PRUEBAS', '1', NULL, NULL, '2026-05-01 22:35:29.733', '2026-05-01 22:35:29.733');


--
-- Data for Name: establecimientos; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.establecimientos VALUES (1, 1, '001', 'OFICINA CENTRAL OLON', 'Calle Principal Olón', '2026-05-01 22:35:29.741', '2026-05-01 22:35:29.741');


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: historial_medidores; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: lecturas; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.lecturas VALUES (1, '2026-05-01 22:35:30.681', 0, 15, 15, NULL, 1, '2026-05-01 22:35:30.682', NULL, NULL, true, 1, '2026-05-01 22:35:30.682', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (2, '2026-05-01 22:35:30.686', 15, 48, 33, NULL, 1, '2026-05-01 22:35:30.687', NULL, NULL, false, 2, '2026-05-01 22:35:30.687', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (3, '2026-05-01 22:35:30.689', 48, 57, 9, NULL, 1, '2026-05-01 22:35:30.69', NULL, NULL, false, 3, '2026-05-01 22:35:30.69', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (4, '2026-05-01 22:35:30.693', 57, 90, 33, NULL, 1, '2026-05-01 22:35:30.694', NULL, NULL, false, 4, '2026-05-01 22:35:30.694', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (5, '2026-05-01 22:35:30.696', 90, 119, 29, NULL, 1, '2026-05-01 22:35:30.697', NULL, NULL, false, 5, '2026-05-01 22:35:30.697', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (6, '2026-05-01 22:35:30.699', 119, 128, 9, NULL, 1, '2026-05-01 22:35:30.7', NULL, NULL, false, 6, '2026-05-01 22:35:30.7', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (7, '2026-05-01 22:35:30.702', 128, 159, 31, NULL, 1, '2026-05-01 22:35:30.703', NULL, NULL, false, 7, '2026-05-01 22:35:30.703', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (8, '2026-05-01 22:35:30.705', 159, 168, 9, NULL, 1, '2026-05-01 22:35:30.706', NULL, NULL, false, 8, '2026-05-01 22:35:30.706', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (9, '2026-05-01 22:35:30.708', 168, 176, 8, NULL, 1, '2026-05-01 22:35:30.709', NULL, NULL, false, 9, '2026-05-01 22:35:30.709', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (10, '2026-05-01 22:35:30.711', 176, 187, 11, NULL, 1, '2026-05-01 22:35:30.712', NULL, NULL, false, 10, '2026-05-01 22:35:30.712', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (11, '2026-05-01 22:35:30.714', 187, 221, 34, NULL, 1, '2026-05-01 22:35:30.715', NULL, NULL, false, 11, '2026-05-01 22:35:30.715', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (12, '2026-05-01 22:35:30.716', 221, 249, 28, NULL, 1, '2026-05-01 22:35:30.717', NULL, NULL, false, 12, '2026-05-01 22:35:30.717', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (13, '2026-05-01 22:35:30.719', 0, 17, 17, NULL, 2, '2026-05-01 22:35:30.72', NULL, NULL, true, 1, '2026-05-01 22:35:30.72', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (14, '2026-05-01 22:35:30.722', 17, 42, 25, NULL, 2, '2026-05-01 22:35:30.723', NULL, NULL, false, 2, '2026-05-01 22:35:30.723', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (15, '2026-05-01 22:35:30.724', 42, 55, 13, NULL, 2, '2026-05-01 22:35:30.725', NULL, NULL, false, 3, '2026-05-01 22:35:30.725', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (16, '2026-05-01 22:35:30.727', 55, 60, 5, NULL, 2, '2026-05-01 22:35:30.728', NULL, NULL, false, 4, '2026-05-01 22:35:30.728', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (17, '2026-05-01 22:35:30.73', 60, 94, 34, NULL, 2, '2026-05-01 22:35:30.73', NULL, NULL, false, 5, '2026-05-01 22:35:30.73', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (18, '2026-05-01 22:35:30.732', 94, 100, 6, NULL, 2, '2026-05-01 22:35:30.733', NULL, NULL, false, 6, '2026-05-01 22:35:30.733', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (19, '2026-05-01 22:35:30.735', 100, 109, 9, NULL, 2, '2026-05-01 22:35:30.735', NULL, NULL, false, 7, '2026-05-01 22:35:30.735', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (20, '2026-05-01 22:35:30.737', 109, 119, 10, NULL, 2, '2026-05-01 22:35:30.738', NULL, NULL, false, 8, '2026-05-01 22:35:30.738', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (21, '2026-05-01 22:35:30.74', 119, 134, 15, NULL, 2, '2026-05-01 22:35:30.741', NULL, NULL, false, 9, '2026-05-01 22:35:30.741', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (22, '2026-05-01 22:35:30.743', 134, 147, 13, NULL, 2, '2026-05-01 22:35:30.744', NULL, NULL, false, 10, '2026-05-01 22:35:30.744', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (23, '2026-05-01 22:35:30.746', 147, 177, 30, NULL, 2, '2026-05-01 22:35:30.746', NULL, NULL, false, 11, '2026-05-01 22:35:30.746', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (24, '2026-05-01 22:35:30.748', 177, 200, 23, NULL, 2, '2026-05-01 22:35:30.748', NULL, NULL, false, 12, '2026-05-01 22:35:30.748', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (25, '2026-05-01 22:35:30.749', 0, 12, 12, NULL, 3, '2026-05-01 22:35:30.75', NULL, NULL, true, 1, '2026-05-01 22:35:30.75', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (26, '2026-05-01 22:35:30.751', 12, 27, 15, NULL, 3, '2026-05-01 22:35:30.751', NULL, NULL, false, 2, '2026-05-01 22:35:30.751', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (27, '2026-05-01 22:35:30.753', 27, 41, 14, NULL, 3, '2026-05-01 22:35:30.753', NULL, NULL, false, 3, '2026-05-01 22:35:30.753', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (28, '2026-05-01 22:35:30.755', 41, 53, 12, NULL, 3, '2026-05-01 22:35:30.755', NULL, NULL, false, 4, '2026-05-01 22:35:30.755', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (29, '2026-05-01 22:35:30.756', 53, 61, 8, NULL, 3, '2026-05-01 22:35:30.757', NULL, NULL, false, 5, '2026-05-01 22:35:30.757', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (30, '2026-05-01 22:35:30.758', 61, 78, 17, NULL, 3, '2026-05-01 22:35:30.759', NULL, NULL, false, 6, '2026-05-01 22:35:30.759', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (31, '2026-05-01 22:35:30.76', 78, 102, 24, NULL, 3, '2026-05-01 22:35:30.761', NULL, NULL, false, 7, '2026-05-01 22:35:30.761', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (32, '2026-05-01 22:35:30.762', 102, 130, 28, NULL, 3, '2026-05-01 22:35:30.762', NULL, NULL, false, 8, '2026-05-01 22:35:30.762', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (33, '2026-05-01 22:35:30.764', 130, 153, 23, NULL, 3, '2026-05-01 22:35:30.764', NULL, NULL, false, 9, '2026-05-01 22:35:30.764', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (34, '2026-05-01 22:35:30.765', 153, 168, 15, NULL, 3, '2026-05-01 22:35:30.766', NULL, NULL, false, 10, '2026-05-01 22:35:30.766', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (35, '2026-05-01 22:35:30.767', 168, 176, 8, NULL, 3, '2026-05-01 22:35:30.767', NULL, NULL, false, 11, '2026-05-01 22:35:30.767', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (36, '2026-05-01 22:35:30.769', 176, 203, 27, NULL, 3, '2026-05-01 22:35:30.769', NULL, NULL, false, 12, '2026-05-01 22:35:30.769', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (37, '2026-05-01 22:35:30.77', 0, 33, 33, NULL, 4, '2026-05-01 22:35:30.771', NULL, NULL, true, 1, '2026-05-01 22:35:30.771', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (38, '2026-05-01 22:35:30.772', 33, 54, 21, NULL, 4, '2026-05-01 22:35:30.773', NULL, NULL, false, 2, '2026-05-01 22:35:30.773', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (39, '2026-05-01 22:35:30.775', 54, 77, 23, NULL, 4, '2026-05-01 22:35:30.776', NULL, NULL, false, 3, '2026-05-01 22:35:30.776', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (40, '2026-05-01 22:35:30.778', 77, 82, 5, NULL, 4, '2026-05-01 22:35:30.778', NULL, NULL, false, 4, '2026-05-01 22:35:30.778', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (41, '2026-05-01 22:35:30.78', 82, 95, 13, NULL, 4, '2026-05-01 22:35:30.781', NULL, NULL, false, 5, '2026-05-01 22:35:30.781', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (42, '2026-05-01 22:35:30.783', 95, 115, 20, NULL, 4, '2026-05-01 22:35:30.783', NULL, NULL, false, 6, '2026-05-01 22:35:30.783', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (43, '2026-05-01 22:35:30.785', 115, 141, 26, NULL, 4, '2026-05-01 22:35:30.785', NULL, NULL, false, 7, '2026-05-01 22:35:30.785', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (44, '2026-05-01 22:35:30.787', 141, 159, 18, NULL, 4, '2026-05-01 22:35:30.788', NULL, NULL, false, 8, '2026-05-01 22:35:30.788', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (45, '2026-05-01 22:35:30.79', 159, 186, 27, NULL, 4, '2026-05-01 22:35:30.79', NULL, NULL, false, 9, '2026-05-01 22:35:30.79', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (46, '2026-05-01 22:35:30.792', 186, 211, 25, NULL, 4, '2026-05-01 22:35:30.793', NULL, NULL, false, 10, '2026-05-01 22:35:30.793', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (47, '2026-05-01 22:35:30.795', 211, 237, 26, NULL, 4, '2026-05-01 22:35:30.796', NULL, NULL, false, 11, '2026-05-01 22:35:30.796', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (48, '2026-05-01 22:35:30.798', 237, 251, 14, NULL, 4, '2026-05-01 22:35:30.798', NULL, NULL, false, 12, '2026-05-01 22:35:30.798', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (49, '2026-05-01 22:35:30.801', 0, 17, 17, NULL, 5, '2026-05-01 22:35:30.801', NULL, NULL, true, 1, '2026-05-01 22:35:30.801', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (50, '2026-05-01 22:35:30.803', 17, 44, 27, NULL, 5, '2026-05-01 22:35:30.804', NULL, NULL, false, 2, '2026-05-01 22:35:30.804', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (51, '2026-05-01 22:35:30.805', 44, 55, 11, NULL, 5, '2026-05-01 22:35:30.806', NULL, NULL, false, 3, '2026-05-01 22:35:30.806', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (52, '2026-05-01 22:35:30.808', 55, 69, 14, NULL, 5, '2026-05-01 22:35:30.808', NULL, NULL, false, 4, '2026-05-01 22:35:30.808', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (53, '2026-05-01 22:35:30.81', 69, 86, 17, NULL, 5, '2026-05-01 22:35:30.811', NULL, NULL, false, 5, '2026-05-01 22:35:30.811', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (54, '2026-05-01 22:35:30.812', 86, 104, 18, NULL, 5, '2026-05-01 22:35:30.813', NULL, NULL, false, 6, '2026-05-01 22:35:30.813', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (55, '2026-05-01 22:35:30.815', 104, 138, 34, NULL, 5, '2026-05-01 22:35:30.815', NULL, NULL, false, 7, '2026-05-01 22:35:30.815', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (56, '2026-05-01 22:35:30.817', 138, 170, 32, NULL, 5, '2026-05-01 22:35:30.818', NULL, NULL, false, 8, '2026-05-01 22:35:30.818', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (57, '2026-05-01 22:35:30.819', 170, 203, 33, NULL, 5, '2026-05-01 22:35:30.82', NULL, NULL, false, 9, '2026-05-01 22:35:30.82', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (58, '2026-05-01 22:35:30.821', 203, 231, 28, NULL, 5, '2026-05-01 22:35:30.821', NULL, NULL, false, 10, '2026-05-01 22:35:30.821', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (59, '2026-05-01 22:35:30.823', 231, 250, 19, NULL, 5, '2026-05-01 22:35:30.823', NULL, NULL, false, 11, '2026-05-01 22:35:30.823', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (60, '2026-05-01 22:35:30.825', 250, 275, 25, NULL, 5, '2026-05-01 22:35:30.825', NULL, NULL, false, 12, '2026-05-01 22:35:30.825', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (61, '2026-05-01 22:35:30.827', 0, 34, 34, NULL, 6, '2026-05-01 22:35:30.827', NULL, NULL, true, 1, '2026-05-01 22:35:30.827', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (62, '2026-05-01 22:35:30.829', 34, 54, 20, NULL, 6, '2026-05-01 22:35:30.83', NULL, NULL, false, 2, '2026-05-01 22:35:30.83', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (63, '2026-05-01 22:35:30.831', 54, 64, 10, NULL, 6, '2026-05-01 22:35:30.832', NULL, NULL, false, 3, '2026-05-01 22:35:30.832', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (64, '2026-05-01 22:35:30.834', 64, 97, 33, NULL, 6, '2026-05-01 22:35:30.834', NULL, NULL, false, 4, '2026-05-01 22:35:30.834', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (65, '2026-05-01 22:35:30.836', 97, 128, 31, NULL, 6, '2026-05-01 22:35:30.836', NULL, NULL, false, 5, '2026-05-01 22:35:30.836', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (66, '2026-05-01 22:35:30.838', 128, 135, 7, NULL, 6, '2026-05-01 22:35:30.838', NULL, NULL, false, 6, '2026-05-01 22:35:30.838', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (67, '2026-05-01 22:35:30.839', 135, 166, 31, NULL, 6, '2026-05-01 22:35:30.84', NULL, NULL, false, 7, '2026-05-01 22:35:30.84', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (68, '2026-05-01 22:35:30.841', 166, 174, 8, NULL, 6, '2026-05-01 22:35:30.842', NULL, NULL, false, 8, '2026-05-01 22:35:30.842', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (69, '2026-05-01 22:35:30.843', 174, 191, 17, NULL, 6, '2026-05-01 22:35:30.843', NULL, NULL, false, 9, '2026-05-01 22:35:30.843', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (70, '2026-05-01 22:35:30.845', 191, 216, 25, NULL, 6, '2026-05-01 22:35:30.845', NULL, NULL, false, 10, '2026-05-01 22:35:30.845', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (71, '2026-05-01 22:35:30.847', 216, 228, 12, NULL, 6, '2026-05-01 22:35:30.847', NULL, NULL, false, 11, '2026-05-01 22:35:30.847', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (72, '2026-05-01 22:35:30.849', 228, 241, 13, NULL, 6, '2026-05-01 22:35:30.849', NULL, NULL, false, 12, '2026-05-01 22:35:30.849', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (73, '2026-05-01 22:35:30.85', 0, 33, 33, NULL, 7, '2026-05-01 22:35:30.85', NULL, NULL, true, 1, '2026-05-01 22:35:30.85', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (74, '2026-05-01 22:35:30.851', 33, 66, 33, NULL, 7, '2026-05-01 22:35:30.852', NULL, NULL, false, 2, '2026-05-01 22:35:30.852', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (75, '2026-05-01 22:35:30.853', 66, 79, 13, NULL, 7, '2026-05-01 22:35:30.854', NULL, NULL, false, 3, '2026-05-01 22:35:30.854', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (76, '2026-05-01 22:35:30.855', 79, 112, 33, NULL, 7, '2026-05-01 22:35:30.855', NULL, NULL, false, 4, '2026-05-01 22:35:30.855', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (77, '2026-05-01 22:35:30.857', 112, 136, 24, NULL, 7, '2026-05-01 22:35:30.857', NULL, NULL, false, 5, '2026-05-01 22:35:30.857', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (78, '2026-05-01 22:35:30.858', 136, 145, 9, NULL, 7, '2026-05-01 22:35:30.859', NULL, NULL, false, 6, '2026-05-01 22:35:30.859', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (79, '2026-05-01 22:35:30.86', 145, 170, 25, NULL, 7, '2026-05-01 22:35:30.86', NULL, NULL, false, 7, '2026-05-01 22:35:30.86', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (80, '2026-05-01 22:35:30.862', 170, 192, 22, NULL, 7, '2026-05-01 22:35:30.862', NULL, NULL, false, 8, '2026-05-01 22:35:30.862', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (81, '2026-05-01 22:35:30.863', 192, 209, 17, NULL, 7, '2026-05-01 22:35:30.864', NULL, NULL, false, 9, '2026-05-01 22:35:30.864', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (82, '2026-05-01 22:35:30.865', 209, 214, 5, NULL, 7, '2026-05-01 22:35:30.866', NULL, NULL, false, 10, '2026-05-01 22:35:30.866', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (83, '2026-05-01 22:35:30.867', 214, 236, 22, NULL, 7, '2026-05-01 22:35:30.867', NULL, NULL, false, 11, '2026-05-01 22:35:30.867', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (84, '2026-05-01 22:35:30.869', 236, 254, 18, NULL, 7, '2026-05-01 22:35:30.869', NULL, NULL, false, 12, '2026-05-01 22:35:30.869', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (85, '2026-05-01 22:35:30.871', 0, 27, 27, NULL, 8, '2026-05-01 22:35:30.871', NULL, NULL, true, 1, '2026-05-01 22:35:30.871', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (86, '2026-05-01 22:35:30.873', 27, 52, 25, NULL, 8, '2026-05-01 22:35:30.873', NULL, NULL, false, 2, '2026-05-01 22:35:30.873', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (87, '2026-05-01 22:35:30.875', 52, 70, 18, NULL, 8, '2026-05-01 22:35:30.875', NULL, NULL, false, 3, '2026-05-01 22:35:30.875', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (88, '2026-05-01 22:35:30.877', 70, 93, 23, NULL, 8, '2026-05-01 22:35:30.877', NULL, NULL, false, 4, '2026-05-01 22:35:30.877', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (89, '2026-05-01 22:35:30.878', 93, 103, 10, NULL, 8, '2026-05-01 22:35:30.879', NULL, NULL, false, 5, '2026-05-01 22:35:30.879', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (90, '2026-05-01 22:35:30.888', 103, 114, 11, NULL, 8, '2026-05-01 22:35:30.893', NULL, NULL, false, 6, '2026-05-01 22:35:30.893', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (91, '2026-05-01 22:35:30.904', 114, 121, 7, NULL, 8, '2026-05-01 22:35:30.91', NULL, NULL, false, 7, '2026-05-01 22:35:30.91', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (92, '2026-05-01 22:35:30.922', 121, 144, 23, NULL, 8, '2026-05-01 22:35:30.923', NULL, NULL, false, 8, '2026-05-01 22:35:30.923', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (93, '2026-05-01 22:35:30.925', 144, 150, 6, NULL, 8, '2026-05-01 22:35:30.926', NULL, NULL, false, 9, '2026-05-01 22:35:30.926', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (94, '2026-05-01 22:35:30.937', 150, 156, 6, NULL, 8, '2026-05-01 22:35:30.942', NULL, NULL, false, 10, '2026-05-01 22:35:30.942', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (95, '2026-05-01 22:35:30.949', 156, 188, 32, NULL, 8, '2026-05-01 22:35:30.955', NULL, NULL, false, 11, '2026-05-01 22:35:30.955', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (96, '2026-05-01 22:35:30.966', 188, 193, 5, NULL, 8, '2026-05-01 22:35:30.969', NULL, NULL, false, 12, '2026-05-01 22:35:30.969', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (97, '2026-05-01 22:35:30.971', 0, 19, 19, NULL, 9, '2026-05-01 22:35:30.971', NULL, NULL, true, 1, '2026-05-01 22:35:30.971', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (98, '2026-05-01 22:35:30.982', 19, 35, 16, NULL, 9, '2026-05-01 22:35:30.989', NULL, NULL, false, 2, '2026-05-01 22:35:30.989', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (99, '2026-05-01 22:35:30.995', 35, 64, 29, NULL, 9, '2026-05-01 22:35:30.995', NULL, NULL, false, 3, '2026-05-01 22:35:30.995', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (100, '2026-05-01 22:35:30.997', 64, 80, 16, NULL, 9, '2026-05-01 22:35:30.997', NULL, NULL, false, 4, '2026-05-01 22:35:30.997', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (101, '2026-05-01 22:35:31.008', 80, 93, 13, NULL, 9, '2026-05-01 22:35:31.014', NULL, NULL, false, 5, '2026-05-01 22:35:31.014', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (102, '2026-05-01 22:35:31.02', 93, 98, 5, NULL, 9, '2026-05-01 22:35:31.02', NULL, NULL, false, 6, '2026-05-01 22:35:31.02', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (103, '2026-05-01 22:35:31.022', 98, 117, 19, NULL, 9, '2026-05-01 22:35:31.022', NULL, NULL, false, 7, '2026-05-01 22:35:31.022', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (104, '2026-05-01 22:35:31.023', 117, 146, 29, NULL, 9, '2026-05-01 22:35:31.024', NULL, NULL, false, 8, '2026-05-01 22:35:31.024', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (105, '2026-05-01 22:35:31.025', 146, 155, 9, NULL, 9, '2026-05-01 22:35:31.026', NULL, NULL, false, 9, '2026-05-01 22:35:31.026', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (106, '2026-05-01 22:35:31.027', 155, 183, 28, NULL, 9, '2026-05-01 22:35:31.028', NULL, NULL, false, 10, '2026-05-01 22:35:31.028', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (107, '2026-05-01 22:35:31.03', 183, 204, 21, NULL, 9, '2026-05-01 22:35:31.03', NULL, NULL, false, 11, '2026-05-01 22:35:31.03', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (108, '2026-05-01 22:35:31.032', 204, 238, 34, NULL, 9, '2026-05-01 22:35:31.032', NULL, NULL, false, 12, '2026-05-01 22:35:31.032', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (109, '2026-05-01 22:35:31.034', 0, 13, 13, NULL, 10, '2026-05-01 22:35:31.035', NULL, NULL, true, 1, '2026-05-01 22:35:31.035', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (110, '2026-05-01 22:35:31.036', 13, 36, 23, NULL, 10, '2026-05-01 22:35:31.037', NULL, NULL, false, 2, '2026-05-01 22:35:31.037', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (111, '2026-05-01 22:35:31.038', 36, 61, 25, NULL, 10, '2026-05-01 22:35:31.039', NULL, NULL, false, 3, '2026-05-01 22:35:31.039', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (112, '2026-05-01 22:35:31.041', 61, 81, 20, NULL, 10, '2026-05-01 22:35:31.041', NULL, NULL, false, 4, '2026-05-01 22:35:31.041', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (113, '2026-05-01 22:35:31.043', 81, 110, 29, NULL, 10, '2026-05-01 22:35:31.044', NULL, NULL, false, 5, '2026-05-01 22:35:31.044', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (114, '2026-05-01 22:35:31.045', 110, 119, 9, NULL, 10, '2026-05-01 22:35:31.046', NULL, NULL, false, 6, '2026-05-01 22:35:31.046', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (115, '2026-05-01 22:35:31.047', 119, 132, 13, NULL, 10, '2026-05-01 22:35:31.048', NULL, NULL, false, 7, '2026-05-01 22:35:31.048', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (116, '2026-05-01 22:35:31.049', 132, 141, 9, NULL, 10, '2026-05-01 22:35:31.05', NULL, NULL, false, 8, '2026-05-01 22:35:31.05', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (117, '2026-05-01 22:35:31.051', 141, 155, 14, NULL, 10, '2026-05-01 22:35:31.051', NULL, NULL, false, 9, '2026-05-01 22:35:31.051', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (118, '2026-05-01 22:35:31.053', 155, 173, 18, NULL, 10, '2026-05-01 22:35:31.053', NULL, NULL, false, 10, '2026-05-01 22:35:31.053', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (119, '2026-05-01 22:35:31.054', 173, 203, 30, NULL, 10, '2026-05-01 22:35:31.055', NULL, NULL, false, 11, '2026-05-01 22:35:31.055', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (120, '2026-05-01 22:35:31.056', 203, 210, 7, NULL, 10, '2026-05-01 22:35:31.057', NULL, NULL, false, 12, '2026-05-01 22:35:31.057', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (121, '2026-05-01 22:35:31.058', 0, 25, 25, NULL, 11, '2026-05-01 22:35:31.059', NULL, NULL, true, 1, '2026-05-01 22:35:31.059', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (122, '2026-05-01 22:35:31.06', 25, 40, 15, NULL, 11, '2026-05-01 22:35:31.06', NULL, NULL, false, 2, '2026-05-01 22:35:31.06', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (123, '2026-05-01 22:35:31.062', 40, 55, 15, NULL, 11, '2026-05-01 22:35:31.062', NULL, NULL, false, 3, '2026-05-01 22:35:31.062', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (124, '2026-05-01 22:35:31.064', 55, 68, 13, NULL, 11, '2026-05-01 22:35:31.064', NULL, NULL, false, 4, '2026-05-01 22:35:31.064', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (125, '2026-05-01 22:35:31.065', 68, 97, 29, NULL, 11, '2026-05-01 22:35:31.066', NULL, NULL, false, 5, '2026-05-01 22:35:31.066', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (126, '2026-05-01 22:35:31.067', 97, 110, 13, NULL, 11, '2026-05-01 22:35:31.068', NULL, NULL, false, 6, '2026-05-01 22:35:31.068', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (127, '2026-05-01 22:35:31.069', 110, 144, 34, NULL, 11, '2026-05-01 22:35:31.069', NULL, NULL, false, 7, '2026-05-01 22:35:31.069', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (128, '2026-05-01 22:35:31.07', 144, 151, 7, NULL, 11, '2026-05-01 22:35:31.071', NULL, NULL, false, 8, '2026-05-01 22:35:31.071', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (129, '2026-05-01 22:35:31.072', 151, 185, 34, NULL, 11, '2026-05-01 22:35:31.072', NULL, NULL, false, 9, '2026-05-01 22:35:31.072', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (130, '2026-05-01 22:35:31.074', 185, 200, 15, NULL, 11, '2026-05-01 22:35:31.074', NULL, NULL, false, 10, '2026-05-01 22:35:31.074', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (131, '2026-05-01 22:35:31.075', 200, 211, 11, NULL, 11, '2026-05-01 22:35:31.075', NULL, NULL, false, 11, '2026-05-01 22:35:31.075', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (132, '2026-05-01 22:35:31.077', 211, 234, 23, NULL, 11, '2026-05-01 22:35:31.077', NULL, NULL, false, 12, '2026-05-01 22:35:31.077', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (133, '2026-05-01 22:35:31.078', 0, 15, 15, NULL, 12, '2026-05-01 22:35:31.079', NULL, NULL, true, 1, '2026-05-01 22:35:31.079', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (134, '2026-05-01 22:35:31.08', 15, 44, 29, NULL, 12, '2026-05-01 22:35:31.081', NULL, NULL, false, 2, '2026-05-01 22:35:31.081', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (135, '2026-05-01 22:35:31.082', 44, 73, 29, NULL, 12, '2026-05-01 22:35:31.083', NULL, NULL, false, 3, '2026-05-01 22:35:31.083', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (136, '2026-05-01 22:35:31.084', 73, 80, 7, NULL, 12, '2026-05-01 22:35:31.084', NULL, NULL, false, 4, '2026-05-01 22:35:31.084', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (137, '2026-05-01 22:35:31.086', 80, 103, 23, NULL, 12, '2026-05-01 22:35:31.086', NULL, NULL, false, 5, '2026-05-01 22:35:31.086', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (138, '2026-05-01 22:35:31.088', 103, 114, 11, NULL, 12, '2026-05-01 22:35:31.088', NULL, NULL, false, 6, '2026-05-01 22:35:31.088', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (139, '2026-05-01 22:35:31.089', 114, 129, 15, NULL, 12, '2026-05-01 22:35:31.089', NULL, NULL, false, 7, '2026-05-01 22:35:31.089', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (140, '2026-05-01 22:35:31.09', 129, 157, 28, NULL, 12, '2026-05-01 22:35:31.091', NULL, NULL, false, 8, '2026-05-01 22:35:31.091', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (141, '2026-05-01 22:35:31.092', 157, 162, 5, NULL, 12, '2026-05-01 22:35:31.092', NULL, NULL, false, 9, '2026-05-01 22:35:31.092', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (142, '2026-05-01 22:35:31.094', 162, 174, 12, NULL, 12, '2026-05-01 22:35:31.094', NULL, NULL, false, 10, '2026-05-01 22:35:31.094', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (143, '2026-05-01 22:35:31.095', 174, 200, 26, NULL, 12, '2026-05-01 22:35:31.096', NULL, NULL, false, 11, '2026-05-01 22:35:31.096', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (144, '2026-05-01 22:35:31.097', 200, 232, 32, NULL, 12, '2026-05-01 22:35:31.097', NULL, NULL, false, 12, '2026-05-01 22:35:31.097', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (145, '2026-05-01 22:35:31.099', 0, 14, 14, NULL, 13, '2026-05-01 22:35:31.099', NULL, NULL, true, 1, '2026-05-01 22:35:31.099', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (146, '2026-05-01 22:35:31.1', 14, 30, 16, NULL, 13, '2026-05-01 22:35:31.101', NULL, NULL, false, 2, '2026-05-01 22:35:31.101', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (147, '2026-05-01 22:35:31.102', 30, 36, 6, NULL, 13, '2026-05-01 22:35:31.103', NULL, NULL, false, 3, '2026-05-01 22:35:31.103', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (148, '2026-05-01 22:35:31.104', 36, 60, 24, NULL, 13, '2026-05-01 22:35:31.105', NULL, NULL, false, 4, '2026-05-01 22:35:31.105', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (149, '2026-05-01 22:35:31.106', 60, 73, 13, NULL, 13, '2026-05-01 22:35:31.106', NULL, NULL, false, 5, '2026-05-01 22:35:31.106', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (150, '2026-05-01 22:35:31.107', 73, 79, 6, NULL, 13, '2026-05-01 22:35:31.108', NULL, NULL, false, 6, '2026-05-01 22:35:31.108', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (151, '2026-05-01 22:35:31.109', 79, 89, 10, NULL, 13, '2026-05-01 22:35:31.109', NULL, NULL, false, 7, '2026-05-01 22:35:31.109', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (152, '2026-05-01 22:35:31.111', 89, 105, 16, NULL, 13, '2026-05-01 22:35:31.111', NULL, NULL, false, 8, '2026-05-01 22:35:31.111', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (153, '2026-05-01 22:35:31.112', 105, 138, 33, NULL, 13, '2026-05-01 22:35:31.112', NULL, NULL, false, 9, '2026-05-01 22:35:31.112', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (154, '2026-05-01 22:35:31.114', 138, 167, 29, NULL, 13, '2026-05-01 22:35:31.115', NULL, NULL, false, 10, '2026-05-01 22:35:31.115', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (155, '2026-05-01 22:35:31.117', 167, 196, 29, NULL, 13, '2026-05-01 22:35:31.118', NULL, NULL, false, 11, '2026-05-01 22:35:31.118', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (156, '2026-05-01 22:35:31.12', 196, 204, 8, NULL, 13, '2026-05-01 22:35:31.12', NULL, NULL, false, 12, '2026-05-01 22:35:31.12', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (157, '2026-05-01 22:35:31.122', 0, 15, 15, NULL, 14, '2026-05-01 22:35:31.122', NULL, NULL, true, 1, '2026-05-01 22:35:31.122', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (158, '2026-05-01 22:35:31.124', 15, 23, 8, NULL, 14, '2026-05-01 22:35:31.124', NULL, NULL, false, 2, '2026-05-01 22:35:31.124', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (159, '2026-05-01 22:35:31.126', 23, 29, 6, NULL, 14, '2026-05-01 22:35:31.126', NULL, NULL, false, 3, '2026-05-01 22:35:31.126', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (160, '2026-05-01 22:35:31.128', 29, 62, 33, NULL, 14, '2026-05-01 22:35:31.128', NULL, NULL, false, 4, '2026-05-01 22:35:31.128', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (161, '2026-05-01 22:35:31.13', 62, 72, 10, NULL, 14, '2026-05-01 22:35:31.13', NULL, NULL, false, 5, '2026-05-01 22:35:31.13', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (162, '2026-05-01 22:35:31.132', 72, 98, 26, NULL, 14, '2026-05-01 22:35:31.132', NULL, NULL, false, 6, '2026-05-01 22:35:31.132', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (163, '2026-05-01 22:35:31.133', 98, 104, 6, NULL, 14, '2026-05-01 22:35:31.134', NULL, NULL, false, 7, '2026-05-01 22:35:31.134', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (164, '2026-05-01 22:35:31.135', 104, 129, 25, NULL, 14, '2026-05-01 22:35:31.135', NULL, NULL, false, 8, '2026-05-01 22:35:31.135', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (165, '2026-05-01 22:35:31.136', 129, 155, 26, NULL, 14, '2026-05-01 22:35:31.137', NULL, NULL, false, 9, '2026-05-01 22:35:31.137', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (166, '2026-05-01 22:35:31.138', 155, 162, 7, NULL, 14, '2026-05-01 22:35:31.139', NULL, NULL, false, 10, '2026-05-01 22:35:31.139', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (167, '2026-05-01 22:35:31.14', 162, 178, 16, NULL, 14, '2026-05-01 22:35:31.14', NULL, NULL, false, 11, '2026-05-01 22:35:31.14', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (168, '2026-05-01 22:35:31.142', 178, 187, 9, NULL, 14, '2026-05-01 22:35:31.142', NULL, NULL, false, 12, '2026-05-01 22:35:31.142', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (169, '2026-05-01 22:35:31.144', 0, 23, 23, NULL, 15, '2026-05-01 22:35:31.144', NULL, NULL, true, 1, '2026-05-01 22:35:31.144', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (170, '2026-05-01 22:35:31.145', 23, 39, 16, NULL, 15, '2026-05-01 22:35:31.146', NULL, NULL, false, 2, '2026-05-01 22:35:31.146', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (171, '2026-05-01 22:35:31.147', 39, 65, 26, NULL, 15, '2026-05-01 22:35:31.147', NULL, NULL, false, 3, '2026-05-01 22:35:31.147', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (172, '2026-05-01 22:35:31.148', 65, 83, 18, NULL, 15, '2026-05-01 22:35:31.149', NULL, NULL, false, 4, '2026-05-01 22:35:31.149', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (173, '2026-05-01 22:35:31.15', 83, 113, 30, NULL, 15, '2026-05-01 22:35:31.15', NULL, NULL, false, 5, '2026-05-01 22:35:31.15', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (174, '2026-05-01 22:35:31.152', 113, 144, 31, NULL, 15, '2026-05-01 22:35:31.152', NULL, NULL, false, 6, '2026-05-01 22:35:31.152', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (175, '2026-05-01 22:35:31.153', 144, 151, 7, NULL, 15, '2026-05-01 22:35:31.153', NULL, NULL, false, 7, '2026-05-01 22:35:31.153', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (176, '2026-05-01 22:35:31.154', 151, 182, 31, NULL, 15, '2026-05-01 22:35:31.155', NULL, NULL, false, 8, '2026-05-01 22:35:31.155', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (177, '2026-05-01 22:35:31.156', 182, 201, 19, NULL, 15, '2026-05-01 22:35:31.156', NULL, NULL, false, 9, '2026-05-01 22:35:31.156', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (178, '2026-05-01 22:35:31.158', 201, 227, 26, NULL, 15, '2026-05-01 22:35:31.158', NULL, NULL, false, 10, '2026-05-01 22:35:31.158', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (179, '2026-05-01 22:35:31.159', 227, 248, 21, NULL, 15, '2026-05-01 22:35:31.159', NULL, NULL, false, 11, '2026-05-01 22:35:31.159', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (180, '2026-05-01 22:35:31.16', 248, 253, 5, NULL, 15, '2026-05-01 22:35:31.161', NULL, NULL, false, 12, '2026-05-01 22:35:31.161', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (181, '2026-05-01 22:35:31.162', 0, 5, 5, NULL, 16, '2026-05-01 22:35:31.163', NULL, NULL, true, 1, '2026-05-01 22:35:31.163', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (182, '2026-05-01 22:35:31.164', 5, 14, 9, NULL, 16, '2026-05-01 22:35:31.164', NULL, NULL, false, 2, '2026-05-01 22:35:31.164', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (183, '2026-05-01 22:35:31.166', 14, 25, 11, NULL, 16, '2026-05-01 22:35:31.166', NULL, NULL, false, 3, '2026-05-01 22:35:31.166', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (184, '2026-05-01 22:35:31.167', 25, 54, 29, NULL, 16, '2026-05-01 22:35:31.168', NULL, NULL, false, 4, '2026-05-01 22:35:31.168', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (185, '2026-05-01 22:35:31.169', 54, 68, 14, NULL, 16, '2026-05-01 22:35:31.169', NULL, NULL, false, 5, '2026-05-01 22:35:31.169', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (186, '2026-05-01 22:35:31.17', 68, 101, 33, NULL, 16, '2026-05-01 22:35:31.171', NULL, NULL, false, 6, '2026-05-01 22:35:31.171', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (187, '2026-05-01 22:35:31.172', 101, 134, 33, NULL, 16, '2026-05-01 22:35:31.173', NULL, NULL, false, 7, '2026-05-01 22:35:31.173', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (188, '2026-05-01 22:35:31.174', 134, 161, 27, NULL, 16, '2026-05-01 22:35:31.174', NULL, NULL, false, 8, '2026-05-01 22:35:31.174', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (189, '2026-05-01 22:35:31.176', 161, 185, 24, NULL, 16, '2026-05-01 22:35:31.176', NULL, NULL, false, 9, '2026-05-01 22:35:31.176', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (190, '2026-05-01 22:35:31.178', 185, 201, 16, NULL, 16, '2026-05-01 22:35:31.178', NULL, NULL, false, 10, '2026-05-01 22:35:31.178', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (191, '2026-05-01 22:35:31.18', 201, 230, 29, NULL, 16, '2026-05-01 22:35:31.18', NULL, NULL, false, 11, '2026-05-01 22:35:31.18', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (192, '2026-05-01 22:35:31.181', 230, 259, 29, NULL, 16, '2026-05-01 22:35:31.182', NULL, NULL, false, 12, '2026-05-01 22:35:31.182', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (193, '2026-05-01 22:35:31.183', 0, 12, 12, NULL, 17, '2026-05-01 22:35:31.183', NULL, NULL, true, 1, '2026-05-01 22:35:31.183', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (194, '2026-05-01 22:35:31.184', 12, 18, 6, NULL, 17, '2026-05-01 22:35:31.185', NULL, NULL, false, 2, '2026-05-01 22:35:31.185', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (195, '2026-05-01 22:35:31.186', 18, 36, 18, NULL, 17, '2026-05-01 22:35:31.186', NULL, NULL, false, 3, '2026-05-01 22:35:31.186', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (196, '2026-05-01 22:35:31.187', 36, 51, 15, NULL, 17, '2026-05-01 22:35:31.188', NULL, NULL, false, 4, '2026-05-01 22:35:31.188', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (197, '2026-05-01 22:35:31.189', 51, 78, 27, NULL, 17, '2026-05-01 22:35:31.19', NULL, NULL, false, 5, '2026-05-01 22:35:31.19', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (198, '2026-05-01 22:35:31.191', 78, 87, 9, NULL, 17, '2026-05-01 22:35:31.191', NULL, NULL, false, 6, '2026-05-01 22:35:31.191', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (199, '2026-05-01 22:35:31.192', 87, 102, 15, NULL, 17, '2026-05-01 22:35:31.193', NULL, NULL, false, 7, '2026-05-01 22:35:31.193', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (200, '2026-05-01 22:35:31.194', 102, 128, 26, NULL, 17, '2026-05-01 22:35:31.194', NULL, NULL, false, 8, '2026-05-01 22:35:31.194', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (201, '2026-05-01 22:35:31.196', 128, 162, 34, NULL, 17, '2026-05-01 22:35:31.197', NULL, NULL, false, 9, '2026-05-01 22:35:31.197', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (202, '2026-05-01 22:35:31.199', 162, 189, 27, NULL, 17, '2026-05-01 22:35:31.199', NULL, NULL, false, 10, '2026-05-01 22:35:31.199', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (203, '2026-05-01 22:35:31.201', 189, 223, 34, NULL, 17, '2026-05-01 22:35:31.201', NULL, NULL, false, 11, '2026-05-01 22:35:31.201', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (204, '2026-05-01 22:35:31.202', 223, 247, 24, NULL, 17, '2026-05-01 22:35:31.203', NULL, NULL, false, 12, '2026-05-01 22:35:31.203', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (205, '2026-05-01 22:35:31.204', 0, 30, 30, NULL, 18, '2026-05-01 22:35:31.204', NULL, NULL, true, 1, '2026-05-01 22:35:31.204', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (206, '2026-05-01 22:35:31.206', 30, 45, 15, NULL, 18, '2026-05-01 22:35:31.206', NULL, NULL, false, 2, '2026-05-01 22:35:31.206', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (207, '2026-05-01 22:35:31.207', 45, 79, 34, NULL, 18, '2026-05-01 22:35:31.208', NULL, NULL, false, 3, '2026-05-01 22:35:31.208', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (208, '2026-05-01 22:35:31.209', 79, 86, 7, NULL, 18, '2026-05-01 22:35:31.209', NULL, NULL, false, 4, '2026-05-01 22:35:31.209', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (209, '2026-05-01 22:35:31.211', 86, 114, 28, NULL, 18, '2026-05-01 22:35:31.211', NULL, NULL, false, 5, '2026-05-01 22:35:31.211', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (210, '2026-05-01 22:35:31.213', 114, 141, 27, NULL, 18, '2026-05-01 22:35:31.213', NULL, NULL, false, 6, '2026-05-01 22:35:31.213', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (211, '2026-05-01 22:35:31.215', 141, 175, 34, NULL, 18, '2026-05-01 22:35:31.215', NULL, NULL, false, 7, '2026-05-01 22:35:31.215', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (212, '2026-05-01 22:35:31.217', 175, 204, 29, NULL, 18, '2026-05-01 22:35:31.217', NULL, NULL, false, 8, '2026-05-01 22:35:31.217', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (213, '2026-05-01 22:35:31.218', 204, 224, 20, NULL, 18, '2026-05-01 22:35:31.219', NULL, NULL, false, 9, '2026-05-01 22:35:31.219', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (214, '2026-05-01 22:35:31.22', 224, 230, 6, NULL, 18, '2026-05-01 22:35:31.221', NULL, NULL, false, 10, '2026-05-01 22:35:31.221', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (215, '2026-05-01 22:35:31.222', 230, 244, 14, NULL, 18, '2026-05-01 22:35:31.222', NULL, NULL, false, 11, '2026-05-01 22:35:31.222', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (216, '2026-05-01 22:35:31.224', 244, 264, 20, NULL, 18, '2026-05-01 22:35:31.224', NULL, NULL, false, 12, '2026-05-01 22:35:31.224', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (217, '2026-05-01 22:35:31.225', 0, 7, 7, NULL, 19, '2026-05-01 22:35:31.226', NULL, NULL, true, 1, '2026-05-01 22:35:31.226', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (218, '2026-05-01 22:35:31.227', 7, 26, 19, NULL, 19, '2026-05-01 22:35:31.227', NULL, NULL, false, 2, '2026-05-01 22:35:31.227', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (219, '2026-05-01 22:35:31.228', 26, 40, 14, NULL, 19, '2026-05-01 22:35:31.229', NULL, NULL, false, 3, '2026-05-01 22:35:31.229', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (220, '2026-05-01 22:35:31.23', 40, 62, 22, NULL, 19, '2026-05-01 22:35:31.231', NULL, NULL, false, 4, '2026-05-01 22:35:31.231', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (221, '2026-05-01 22:35:31.232', 62, 77, 15, NULL, 19, '2026-05-01 22:35:31.232', NULL, NULL, false, 5, '2026-05-01 22:35:31.232', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (222, '2026-05-01 22:35:31.233', 77, 87, 10, NULL, 19, '2026-05-01 22:35:31.234', NULL, NULL, false, 6, '2026-05-01 22:35:31.234', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (223, '2026-05-01 22:35:31.235', 87, 93, 6, NULL, 19, '2026-05-01 22:35:31.235', NULL, NULL, false, 7, '2026-05-01 22:35:31.235', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (224, '2026-05-01 22:35:31.236', 93, 115, 22, NULL, 19, '2026-05-01 22:35:31.237', NULL, NULL, false, 8, '2026-05-01 22:35:31.237', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (225, '2026-05-01 22:35:31.238', 115, 120, 5, NULL, 19, '2026-05-01 22:35:31.238', NULL, NULL, false, 9, '2026-05-01 22:35:31.238', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (226, '2026-05-01 22:35:31.24', 120, 136, 16, NULL, 19, '2026-05-01 22:35:31.24', NULL, NULL, false, 10, '2026-05-01 22:35:31.24', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (227, '2026-05-01 22:35:31.241', 136, 167, 31, NULL, 19, '2026-05-01 22:35:31.242', NULL, NULL, false, 11, '2026-05-01 22:35:31.242', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (228, '2026-05-01 22:35:31.243', 167, 192, 25, NULL, 19, '2026-05-01 22:35:31.243', NULL, NULL, false, 12, '2026-05-01 22:35:31.243', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (229, '2026-05-01 22:35:31.245', 0, 12, 12, NULL, 20, '2026-05-01 22:35:31.245', NULL, NULL, true, 1, '2026-05-01 22:35:31.245', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (230, '2026-05-01 22:35:31.246', 12, 25, 13, NULL, 20, '2026-05-01 22:35:31.246', NULL, NULL, false, 2, '2026-05-01 22:35:31.246', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (231, '2026-05-01 22:35:31.247', 25, 38, 13, NULL, 20, '2026-05-01 22:35:31.248', NULL, NULL, false, 3, '2026-05-01 22:35:31.248', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (232, '2026-05-01 22:35:31.249', 38, 67, 29, NULL, 20, '2026-05-01 22:35:31.25', NULL, NULL, false, 4, '2026-05-01 22:35:31.25', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (233, '2026-05-01 22:35:31.251', 67, 96, 29, NULL, 20, '2026-05-01 22:35:31.251', NULL, NULL, false, 5, '2026-05-01 22:35:31.251', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (234, '2026-05-01 22:35:31.252', 96, 116, 20, NULL, 20, '2026-05-01 22:35:31.253', NULL, NULL, false, 6, '2026-05-01 22:35:31.253', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (235, '2026-05-01 22:35:31.254', 116, 134, 18, NULL, 20, '2026-05-01 22:35:31.254', NULL, NULL, false, 7, '2026-05-01 22:35:31.254', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (236, '2026-05-01 22:35:31.256', 134, 166, 32, NULL, 20, '2026-05-01 22:35:31.256', NULL, NULL, false, 8, '2026-05-01 22:35:31.256', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (237, '2026-05-01 22:35:31.257', 166, 199, 33, NULL, 20, '2026-05-01 22:35:31.257', NULL, NULL, false, 9, '2026-05-01 22:35:31.257', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (238, '2026-05-01 22:35:31.259', 199, 231, 32, NULL, 20, '2026-05-01 22:35:31.259', NULL, NULL, false, 10, '2026-05-01 22:35:31.259', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (239, '2026-05-01 22:35:31.26', 231, 251, 20, NULL, 20, '2026-05-01 22:35:31.26', NULL, NULL, false, 11, '2026-05-01 22:35:31.26', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (240, '2026-05-01 22:35:31.262', 251, 265, 14, NULL, 20, '2026-05-01 22:35:31.262', NULL, NULL, false, 12, '2026-05-01 22:35:31.262', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (241, '2026-05-01 22:35:31.263', 0, 9, 9, NULL, 21, '2026-05-01 22:35:31.263', NULL, NULL, true, 1, '2026-05-01 22:35:31.263', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (242, '2026-05-01 22:35:31.265', 9, 22, 13, NULL, 21, '2026-05-01 22:35:31.265', NULL, NULL, false, 2, '2026-05-01 22:35:31.265', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (243, '2026-05-01 22:35:31.266', 22, 39, 17, NULL, 21, '2026-05-01 22:35:31.267', NULL, NULL, false, 3, '2026-05-01 22:35:31.267', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (244, '2026-05-01 22:35:31.268', 39, 68, 29, NULL, 21, '2026-05-01 22:35:31.268', NULL, NULL, false, 4, '2026-05-01 22:35:31.268', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (245, '2026-05-01 22:35:31.269', 68, 102, 34, NULL, 21, '2026-05-01 22:35:31.27', NULL, NULL, false, 5, '2026-05-01 22:35:31.27', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (246, '2026-05-01 22:35:31.271', 102, 123, 21, NULL, 21, '2026-05-01 22:35:31.271', NULL, NULL, false, 6, '2026-05-01 22:35:31.271', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (247, '2026-05-01 22:35:31.272', 123, 150, 27, NULL, 21, '2026-05-01 22:35:31.273', NULL, NULL, false, 7, '2026-05-01 22:35:31.273', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (248, '2026-05-01 22:35:31.274', 150, 182, 32, NULL, 21, '2026-05-01 22:35:31.274', NULL, NULL, false, 8, '2026-05-01 22:35:31.274', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (249, '2026-05-01 22:35:31.279', 182, 190, 8, NULL, 21, '2026-05-01 22:35:31.28', NULL, NULL, false, 9, '2026-05-01 22:35:31.28', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (250, '2026-05-01 22:35:31.282', 190, 224, 34, NULL, 21, '2026-05-01 22:35:31.282', NULL, NULL, false, 10, '2026-05-01 22:35:31.282', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (251, '2026-05-01 22:35:31.284', 224, 254, 30, NULL, 21, '2026-05-01 22:35:31.284', NULL, NULL, false, 11, '2026-05-01 22:35:31.284', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (252, '2026-05-01 22:35:31.285', 254, 269, 15, NULL, 21, '2026-05-01 22:35:31.286', NULL, NULL, false, 12, '2026-05-01 22:35:31.286', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (253, '2026-05-01 22:35:31.287', 0, 16, 16, NULL, 22, '2026-05-01 22:35:31.288', NULL, NULL, true, 1, '2026-05-01 22:35:31.288', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (254, '2026-05-01 22:35:31.289', 16, 27, 11, NULL, 22, '2026-05-01 22:35:31.29', NULL, NULL, false, 2, '2026-05-01 22:35:31.29', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (255, '2026-05-01 22:35:31.291', 27, 52, 25, NULL, 22, '2026-05-01 22:35:31.291', NULL, NULL, false, 3, '2026-05-01 22:35:31.291', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (256, '2026-05-01 22:35:31.292', 52, 68, 16, NULL, 22, '2026-05-01 22:35:31.293', NULL, NULL, false, 4, '2026-05-01 22:35:31.293', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (257, '2026-05-01 22:35:31.294', 68, 77, 9, NULL, 22, '2026-05-01 22:35:31.295', NULL, NULL, false, 5, '2026-05-01 22:35:31.295', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (258, '2026-05-01 22:35:31.296', 77, 96, 19, NULL, 22, '2026-05-01 22:35:31.297', NULL, NULL, false, 6, '2026-05-01 22:35:31.297', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (259, '2026-05-01 22:35:31.298', 96, 120, 24, NULL, 22, '2026-05-01 22:35:31.298', NULL, NULL, false, 7, '2026-05-01 22:35:31.298', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (260, '2026-05-01 22:35:31.3', 120, 134, 14, NULL, 22, '2026-05-01 22:35:31.3', NULL, NULL, false, 8, '2026-05-01 22:35:31.3', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (261, '2026-05-01 22:35:31.301', 134, 139, 5, NULL, 22, '2026-05-01 22:35:31.302', NULL, NULL, false, 9, '2026-05-01 22:35:31.302', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (262, '2026-05-01 22:35:31.303', 139, 155, 16, NULL, 22, '2026-05-01 22:35:31.304', NULL, NULL, false, 10, '2026-05-01 22:35:31.304', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (263, '2026-05-01 22:35:31.305', 155, 170, 15, NULL, 22, '2026-05-01 22:35:31.305', NULL, NULL, false, 11, '2026-05-01 22:35:31.305', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (264, '2026-05-01 22:35:31.306', 170, 204, 34, NULL, 22, '2026-05-01 22:35:31.307', NULL, NULL, false, 12, '2026-05-01 22:35:31.307', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (265, '2026-05-01 22:35:31.308', 0, 15, 15, NULL, 23, '2026-05-01 22:35:31.308', NULL, NULL, true, 1, '2026-05-01 22:35:31.308', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (266, '2026-05-01 22:35:31.309', 15, 24, 9, NULL, 23, '2026-05-01 22:35:31.309', NULL, NULL, false, 2, '2026-05-01 22:35:31.309', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (267, '2026-05-01 22:35:31.31', 24, 49, 25, NULL, 23, '2026-05-01 22:35:31.311', NULL, NULL, false, 3, '2026-05-01 22:35:31.311', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (268, '2026-05-01 22:35:31.312', 49, 73, 24, NULL, 23, '2026-05-01 22:35:31.312', NULL, NULL, false, 4, '2026-05-01 22:35:31.312', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (269, '2026-05-01 22:35:31.314', 73, 86, 13, NULL, 23, '2026-05-01 22:35:31.314', NULL, NULL, false, 5, '2026-05-01 22:35:31.314', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (270, '2026-05-01 22:35:31.315', 86, 96, 10, NULL, 23, '2026-05-01 22:35:31.316', NULL, NULL, false, 6, '2026-05-01 22:35:31.316', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (271, '2026-05-01 22:35:31.317', 96, 127, 31, NULL, 23, '2026-05-01 22:35:31.317', NULL, NULL, false, 7, '2026-05-01 22:35:31.317', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (272, '2026-05-01 22:35:31.318', 127, 159, 32, NULL, 23, '2026-05-01 22:35:31.319', NULL, NULL, false, 8, '2026-05-01 22:35:31.319', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (273, '2026-05-01 22:35:31.32', 159, 185, 26, NULL, 23, '2026-05-01 22:35:31.32', NULL, NULL, false, 9, '2026-05-01 22:35:31.32', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (274, '2026-05-01 22:35:31.322', 185, 199, 14, NULL, 23, '2026-05-01 22:35:31.322', NULL, NULL, false, 10, '2026-05-01 22:35:31.322', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (275, '2026-05-01 22:35:31.323', 199, 220, 21, NULL, 23, '2026-05-01 22:35:31.323', NULL, NULL, false, 11, '2026-05-01 22:35:31.323', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (276, '2026-05-01 22:35:31.325', 220, 251, 31, NULL, 23, '2026-05-01 22:35:31.325', NULL, NULL, false, 12, '2026-05-01 22:35:31.325', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (277, '2026-05-01 22:35:31.326', 0, 6, 6, NULL, 24, '2026-05-01 22:35:31.326', NULL, NULL, true, 1, '2026-05-01 22:35:31.326', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (278, '2026-05-01 22:35:31.328', 6, 15, 9, NULL, 24, '2026-05-01 22:35:31.328', NULL, NULL, false, 2, '2026-05-01 22:35:31.328', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (279, '2026-05-01 22:35:31.329', 15, 48, 33, NULL, 24, '2026-05-01 22:35:31.329', NULL, NULL, false, 3, '2026-05-01 22:35:31.329', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (280, '2026-05-01 22:35:31.33', 48, 54, 6, NULL, 24, '2026-05-01 22:35:31.331', NULL, NULL, false, 4, '2026-05-01 22:35:31.331', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (281, '2026-05-01 22:35:31.332', 54, 67, 13, NULL, 24, '2026-05-01 22:35:31.332', NULL, NULL, false, 5, '2026-05-01 22:35:31.332', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (282, '2026-05-01 22:35:31.334', 67, 82, 15, NULL, 24, '2026-05-01 22:35:31.334', NULL, NULL, false, 6, '2026-05-01 22:35:31.334', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (283, '2026-05-01 22:35:31.335', 82, 114, 32, NULL, 24, '2026-05-01 22:35:31.336', NULL, NULL, false, 7, '2026-05-01 22:35:31.336', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (284, '2026-05-01 22:35:31.337', 114, 134, 20, NULL, 24, '2026-05-01 22:35:31.337', NULL, NULL, false, 8, '2026-05-01 22:35:31.337', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (285, '2026-05-01 22:35:31.338', 134, 146, 12, NULL, 24, '2026-05-01 22:35:31.339', NULL, NULL, false, 9, '2026-05-01 22:35:31.339', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (286, '2026-05-01 22:35:31.34', 146, 179, 33, NULL, 24, '2026-05-01 22:35:31.34', NULL, NULL, false, 10, '2026-05-01 22:35:31.34', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (287, '2026-05-01 22:35:31.342', 179, 186, 7, NULL, 24, '2026-05-01 22:35:31.342', NULL, NULL, false, 11, '2026-05-01 22:35:31.342', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (288, '2026-05-01 22:35:31.343', 186, 207, 21, NULL, 24, '2026-05-01 22:35:31.344', NULL, NULL, false, 12, '2026-05-01 22:35:31.344', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (289, '2026-05-01 22:35:31.345', 0, 29, 29, NULL, 25, '2026-05-01 22:35:31.345', NULL, NULL, true, 1, '2026-05-01 22:35:31.345', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (290, '2026-05-01 22:35:31.347', 29, 46, 17, NULL, 25, '2026-05-01 22:35:31.347', NULL, NULL, false, 2, '2026-05-01 22:35:31.347', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (291, '2026-05-01 22:35:31.348', 46, 72, 26, NULL, 25, '2026-05-01 22:35:31.349', NULL, NULL, false, 3, '2026-05-01 22:35:31.349', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (292, '2026-05-01 22:35:31.35', 72, 86, 14, NULL, 25, '2026-05-01 22:35:31.35', NULL, NULL, false, 4, '2026-05-01 22:35:31.35', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (293, '2026-05-01 22:35:31.352', 86, 103, 17, NULL, 25, '2026-05-01 22:35:31.352', NULL, NULL, false, 5, '2026-05-01 22:35:31.352', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (294, '2026-05-01 22:35:31.354', 103, 127, 24, NULL, 25, '2026-05-01 22:35:31.354', NULL, NULL, false, 6, '2026-05-01 22:35:31.354', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (295, '2026-05-01 22:35:31.355', 127, 156, 29, NULL, 25, '2026-05-01 22:35:31.356', NULL, NULL, false, 7, '2026-05-01 22:35:31.356', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (296, '2026-05-01 22:35:31.357', 156, 187, 31, NULL, 25, '2026-05-01 22:35:31.357', NULL, NULL, false, 8, '2026-05-01 22:35:31.357', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (297, '2026-05-01 22:35:31.358', 187, 217, 30, NULL, 25, '2026-05-01 22:35:31.359', NULL, NULL, false, 9, '2026-05-01 22:35:31.359', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (298, '2026-05-01 22:35:31.36', 217, 231, 14, NULL, 25, '2026-05-01 22:35:31.36', NULL, NULL, false, 10, '2026-05-01 22:35:31.36', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (299, '2026-05-01 22:35:31.362', 231, 257, 26, NULL, 25, '2026-05-01 22:35:31.362', NULL, NULL, false, 11, '2026-05-01 22:35:31.362', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (300, '2026-05-01 22:35:31.363', 257, 270, 13, NULL, 25, '2026-05-01 22:35:31.364', NULL, NULL, false, 12, '2026-05-01 22:35:31.364', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (301, '2026-05-01 22:35:31.365', 0, 9, 9, NULL, 26, '2026-05-01 22:35:31.365', NULL, NULL, true, 1, '2026-05-01 22:35:31.365', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (302, '2026-05-01 22:35:31.367', 9, 34, 25, NULL, 26, '2026-05-01 22:35:31.367', NULL, NULL, false, 2, '2026-05-01 22:35:31.367', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (303, '2026-05-01 22:35:31.369', 34, 55, 21, NULL, 26, '2026-05-01 22:35:31.369', NULL, NULL, false, 3, '2026-05-01 22:35:31.369', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (304, '2026-05-01 22:35:31.37', 55, 72, 17, NULL, 26, '2026-05-01 22:35:31.371', NULL, NULL, false, 4, '2026-05-01 22:35:31.371', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (305, '2026-05-01 22:35:31.372', 72, 106, 34, NULL, 26, '2026-05-01 22:35:31.372', NULL, NULL, false, 5, '2026-05-01 22:35:31.372', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (306, '2026-05-01 22:35:31.374', 106, 116, 10, NULL, 26, '2026-05-01 22:35:31.375', NULL, NULL, false, 6, '2026-05-01 22:35:31.375', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (307, '2026-05-01 22:35:31.376', 116, 133, 17, NULL, 26, '2026-05-01 22:35:31.377', NULL, NULL, false, 7, '2026-05-01 22:35:31.377', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (308, '2026-05-01 22:35:31.378', 133, 148, 15, NULL, 26, '2026-05-01 22:35:31.379', NULL, NULL, false, 8, '2026-05-01 22:35:31.379', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (309, '2026-05-01 22:35:31.38', 148, 159, 11, NULL, 26, '2026-05-01 22:35:31.381', NULL, NULL, false, 9, '2026-05-01 22:35:31.381', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (310, '2026-05-01 22:35:31.382', 159, 193, 34, NULL, 26, '2026-05-01 22:35:31.382', NULL, NULL, false, 10, '2026-05-01 22:35:31.382', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (311, '2026-05-01 22:35:31.384', 193, 201, 8, NULL, 26, '2026-05-01 22:35:31.384', NULL, NULL, false, 11, '2026-05-01 22:35:31.384', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (312, '2026-05-01 22:35:31.386', 201, 211, 10, NULL, 26, '2026-05-01 22:35:31.386', NULL, NULL, false, 12, '2026-05-01 22:35:31.386', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (313, '2026-05-01 22:35:31.388', 0, 9, 9, NULL, 27, '2026-05-01 22:35:31.388', NULL, NULL, true, 1, '2026-05-01 22:35:31.388', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (314, '2026-05-01 22:35:31.389', 9, 23, 14, NULL, 27, '2026-05-01 22:35:31.39', NULL, NULL, false, 2, '2026-05-01 22:35:31.39', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (315, '2026-05-01 22:35:31.392', 23, 35, 12, NULL, 27, '2026-05-01 22:35:31.392', NULL, NULL, false, 3, '2026-05-01 22:35:31.392', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (316, '2026-05-01 22:35:31.393', 35, 60, 25, NULL, 27, '2026-05-01 22:35:31.394', NULL, NULL, false, 4, '2026-05-01 22:35:31.394', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (317, '2026-05-01 22:35:31.395', 60, 71, 11, NULL, 27, '2026-05-01 22:35:31.395', NULL, NULL, false, 5, '2026-05-01 22:35:31.395', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (318, '2026-05-01 22:35:31.396', 71, 105, 34, NULL, 27, '2026-05-01 22:35:31.397', NULL, NULL, false, 6, '2026-05-01 22:35:31.397', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (319, '2026-05-01 22:35:31.398', 105, 139, 34, NULL, 27, '2026-05-01 22:35:31.398', NULL, NULL, false, 7, '2026-05-01 22:35:31.398', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (320, '2026-05-01 22:35:31.4', 139, 156, 17, NULL, 27, '2026-05-01 22:35:31.4', NULL, NULL, false, 8, '2026-05-01 22:35:31.4', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (321, '2026-05-01 22:35:31.401', 156, 163, 7, NULL, 27, '2026-05-01 22:35:31.401', NULL, NULL, false, 9, '2026-05-01 22:35:31.401', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (322, '2026-05-01 22:35:31.403', 163, 179, 16, NULL, 27, '2026-05-01 22:35:31.403', NULL, NULL, false, 10, '2026-05-01 22:35:31.403', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (323, '2026-05-01 22:35:31.404', 179, 212, 33, NULL, 27, '2026-05-01 22:35:31.405', NULL, NULL, false, 11, '2026-05-01 22:35:31.405', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (324, '2026-05-01 22:35:31.406', 212, 245, 33, NULL, 27, '2026-05-01 22:35:31.407', NULL, NULL, false, 12, '2026-05-01 22:35:31.407', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (325, '2026-05-01 22:35:31.408', 0, 34, 34, NULL, 28, '2026-05-01 22:35:31.408', NULL, NULL, true, 1, '2026-05-01 22:35:31.408', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (326, '2026-05-01 22:35:31.41', 34, 58, 24, NULL, 28, '2026-05-01 22:35:31.41', NULL, NULL, false, 2, '2026-05-01 22:35:31.41', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (327, '2026-05-01 22:35:31.411', 58, 81, 23, NULL, 28, '2026-05-01 22:35:31.412', NULL, NULL, false, 3, '2026-05-01 22:35:31.412', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (328, '2026-05-01 22:35:31.413', 81, 113, 32, NULL, 28, '2026-05-01 22:35:31.414', NULL, NULL, false, 4, '2026-05-01 22:35:31.414', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (329, '2026-05-01 22:35:31.415', 113, 131, 18, NULL, 28, '2026-05-01 22:35:31.415', NULL, NULL, false, 5, '2026-05-01 22:35:31.415', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (330, '2026-05-01 22:35:31.416', 131, 148, 17, NULL, 28, '2026-05-01 22:35:31.417', NULL, NULL, false, 6, '2026-05-01 22:35:31.417', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (331, '2026-05-01 22:35:31.418', 148, 180, 32, NULL, 28, '2026-05-01 22:35:31.418', NULL, NULL, false, 7, '2026-05-01 22:35:31.418', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (332, '2026-05-01 22:35:31.419', 180, 212, 32, NULL, 28, '2026-05-01 22:35:31.42', NULL, NULL, false, 8, '2026-05-01 22:35:31.42', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (333, '2026-05-01 22:35:31.421', 212, 218, 6, NULL, 28, '2026-05-01 22:35:31.421', NULL, NULL, false, 9, '2026-05-01 22:35:31.421', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (334, '2026-05-01 22:35:31.422', 218, 226, 8, NULL, 28, '2026-05-01 22:35:31.423', NULL, NULL, false, 10, '2026-05-01 22:35:31.423', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (335, '2026-05-01 22:35:31.424', 226, 246, 20, NULL, 28, '2026-05-01 22:35:31.424', NULL, NULL, false, 11, '2026-05-01 22:35:31.424', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (336, '2026-05-01 22:35:31.425', 246, 265, 19, NULL, 28, '2026-05-01 22:35:31.426', NULL, NULL, false, 12, '2026-05-01 22:35:31.426', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (337, '2026-05-01 22:35:31.427', 0, 16, 16, NULL, 29, '2026-05-01 22:35:31.427', NULL, NULL, true, 1, '2026-05-01 22:35:31.427', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (338, '2026-05-01 22:35:31.428', 16, 36, 20, NULL, 29, '2026-05-01 22:35:31.428', NULL, NULL, false, 2, '2026-05-01 22:35:31.428', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (339, '2026-05-01 22:35:31.43', 36, 60, 24, NULL, 29, '2026-05-01 22:35:31.43', NULL, NULL, false, 3, '2026-05-01 22:35:31.43', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (340, '2026-05-01 22:35:31.431', 60, 77, 17, NULL, 29, '2026-05-01 22:35:31.431', NULL, NULL, false, 4, '2026-05-01 22:35:31.431', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (341, '2026-05-01 22:35:31.432', 77, 83, 6, NULL, 29, '2026-05-01 22:35:31.433', NULL, NULL, false, 5, '2026-05-01 22:35:31.433', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (342, '2026-05-01 22:35:31.434', 83, 90, 7, NULL, 29, '2026-05-01 22:35:31.434', NULL, NULL, false, 6, '2026-05-01 22:35:31.434', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (343, '2026-05-01 22:35:31.436', 90, 100, 10, NULL, 29, '2026-05-01 22:35:31.436', NULL, NULL, false, 7, '2026-05-01 22:35:31.436', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (344, '2026-05-01 22:35:31.437', 100, 130, 30, NULL, 29, '2026-05-01 22:35:31.437', NULL, NULL, false, 8, '2026-05-01 22:35:31.437', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (345, '2026-05-01 22:35:31.439', 130, 161, 31, NULL, 29, '2026-05-01 22:35:31.439', NULL, NULL, false, 9, '2026-05-01 22:35:31.439', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (346, '2026-05-01 22:35:31.44', 161, 170, 9, NULL, 29, '2026-05-01 22:35:31.44', NULL, NULL, false, 10, '2026-05-01 22:35:31.44', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (347, '2026-05-01 22:35:31.442', 170, 190, 20, NULL, 29, '2026-05-01 22:35:31.442', NULL, NULL, false, 11, '2026-05-01 22:35:31.442', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (348, '2026-05-01 22:35:31.443', 190, 216, 26, NULL, 29, '2026-05-01 22:35:31.443', NULL, NULL, false, 12, '2026-05-01 22:35:31.443', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (349, '2026-05-01 22:35:31.445', 0, 5, 5, NULL, 30, '2026-05-01 22:35:31.445', NULL, NULL, true, 1, '2026-05-01 22:35:31.445', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (350, '2026-05-01 22:35:31.446', 5, 28, 23, NULL, 30, '2026-05-01 22:35:31.447', NULL, NULL, false, 2, '2026-05-01 22:35:31.447', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (351, '2026-05-01 22:35:31.448', 28, 62, 34, NULL, 30, '2026-05-01 22:35:31.449', NULL, NULL, false, 3, '2026-05-01 22:35:31.449', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (352, '2026-05-01 22:35:31.45', 62, 81, 19, NULL, 30, '2026-05-01 22:35:31.45', NULL, NULL, false, 4, '2026-05-01 22:35:31.45', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (353, '2026-05-01 22:35:31.452', 81, 101, 20, NULL, 30, '2026-05-01 22:35:31.452', NULL, NULL, false, 5, '2026-05-01 22:35:31.452', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (354, '2026-05-01 22:35:31.454', 101, 123, 22, NULL, 30, '2026-05-01 22:35:31.455', NULL, NULL, false, 6, '2026-05-01 22:35:31.455', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (355, '2026-05-01 22:35:31.456', 123, 142, 19, NULL, 30, '2026-05-01 22:35:31.457', NULL, NULL, false, 7, '2026-05-01 22:35:31.457', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (356, '2026-05-01 22:35:31.458', 142, 164, 22, NULL, 30, '2026-05-01 22:35:31.458', NULL, NULL, false, 8, '2026-05-01 22:35:31.458', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (357, '2026-05-01 22:35:31.459', 164, 189, 25, NULL, 30, '2026-05-01 22:35:31.46', NULL, NULL, false, 9, '2026-05-01 22:35:31.46', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (358, '2026-05-01 22:35:31.461', 189, 218, 29, NULL, 30, '2026-05-01 22:35:31.461', NULL, NULL, false, 10, '2026-05-01 22:35:31.461', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (359, '2026-05-01 22:35:31.463', 218, 234, 16, NULL, 30, '2026-05-01 22:35:31.463', NULL, NULL, false, 11, '2026-05-01 22:35:31.463', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (360, '2026-05-01 22:35:31.465', 234, 242, 8, NULL, 30, '2026-05-01 22:35:31.465', NULL, NULL, false, 12, '2026-05-01 22:35:31.465', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (361, '2026-05-01 22:35:31.466', 0, 13, 13, NULL, 31, '2026-05-01 22:35:31.467', NULL, NULL, true, 1, '2026-05-01 22:35:31.467', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (362, '2026-05-01 22:35:31.468', 13, 47, 34, NULL, 31, '2026-05-01 22:35:31.468', NULL, NULL, false, 2, '2026-05-01 22:35:31.468', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (363, '2026-05-01 22:35:31.47', 47, 71, 24, NULL, 31, '2026-05-01 22:35:31.47', NULL, NULL, false, 3, '2026-05-01 22:35:31.47', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (364, '2026-05-01 22:35:31.471', 71, 86, 15, NULL, 31, '2026-05-01 22:35:31.472', NULL, NULL, false, 4, '2026-05-01 22:35:31.472', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (365, '2026-05-01 22:35:31.473', 86, 100, 14, NULL, 31, '2026-05-01 22:35:31.473', NULL, NULL, false, 5, '2026-05-01 22:35:31.473', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (366, '2026-05-01 22:35:31.475', 100, 112, 12, NULL, 31, '2026-05-01 22:35:31.475', NULL, NULL, false, 6, '2026-05-01 22:35:31.475', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (367, '2026-05-01 22:35:31.476', 112, 124, 12, NULL, 31, '2026-05-01 22:35:31.477', NULL, NULL, false, 7, '2026-05-01 22:35:31.477', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (368, '2026-05-01 22:35:31.478', 124, 135, 11, NULL, 31, '2026-05-01 22:35:31.478', NULL, NULL, false, 8, '2026-05-01 22:35:31.478', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (369, '2026-05-01 22:35:31.48', 135, 161, 26, NULL, 31, '2026-05-01 22:35:31.48', NULL, NULL, false, 9, '2026-05-01 22:35:31.48', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (370, '2026-05-01 22:35:31.482', 161, 178, 17, NULL, 31, '2026-05-01 22:35:31.482', NULL, NULL, false, 10, '2026-05-01 22:35:31.482', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (371, '2026-05-01 22:35:31.484', 178, 189, 11, NULL, 31, '2026-05-01 22:35:31.484', NULL, NULL, false, 11, '2026-05-01 22:35:31.484', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (372, '2026-05-01 22:35:31.485', 189, 202, 13, NULL, 31, '2026-05-01 22:35:31.486', NULL, NULL, false, 12, '2026-05-01 22:35:31.486', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (373, '2026-05-01 22:35:31.487', 0, 26, 26, NULL, 32, '2026-05-01 22:35:31.488', NULL, NULL, true, 1, '2026-05-01 22:35:31.488', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (374, '2026-05-01 22:35:31.489', 26, 53, 27, NULL, 32, '2026-05-01 22:35:31.489', NULL, NULL, false, 2, '2026-05-01 22:35:31.489', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (375, '2026-05-01 22:35:31.49', 53, 81, 28, NULL, 32, '2026-05-01 22:35:31.491', NULL, NULL, false, 3, '2026-05-01 22:35:31.491', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (376, '2026-05-01 22:35:31.492', 81, 96, 15, NULL, 32, '2026-05-01 22:35:31.492', NULL, NULL, false, 4, '2026-05-01 22:35:31.492', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (377, '2026-05-01 22:35:31.494', 96, 116, 20, NULL, 32, '2026-05-01 22:35:31.494', NULL, NULL, false, 5, '2026-05-01 22:35:31.494', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (378, '2026-05-01 22:35:31.495', 116, 141, 25, NULL, 32, '2026-05-01 22:35:31.495', NULL, NULL, false, 6, '2026-05-01 22:35:31.495', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (379, '2026-05-01 22:35:31.497', 141, 167, 26, NULL, 32, '2026-05-01 22:35:31.497', NULL, NULL, false, 7, '2026-05-01 22:35:31.497', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (380, '2026-05-01 22:35:31.504', 167, 182, 15, NULL, 32, '2026-05-01 22:35:31.509', NULL, NULL, false, 8, '2026-05-01 22:35:31.509', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (381, '2026-05-01 22:35:31.519', 182, 216, 34, NULL, 32, '2026-05-01 22:35:31.52', NULL, NULL, false, 9, '2026-05-01 22:35:31.52', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (382, '2026-05-01 22:35:31.521', 216, 243, 27, NULL, 32, '2026-05-01 22:35:31.522', NULL, NULL, false, 10, '2026-05-01 22:35:31.522', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (383, '2026-05-01 22:35:31.523', 243, 274, 31, NULL, 32, '2026-05-01 22:35:31.523', NULL, NULL, false, 11, '2026-05-01 22:35:31.523', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (384, '2026-05-01 22:35:31.525', 274, 304, 30, NULL, 32, '2026-05-01 22:35:31.525', NULL, NULL, false, 12, '2026-05-01 22:35:31.525', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (385, '2026-05-01 22:35:31.526', 0, 21, 21, NULL, 33, '2026-05-01 22:35:31.526', NULL, NULL, true, 1, '2026-05-01 22:35:31.526', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (386, '2026-05-01 22:35:31.528', 21, 37, 16, NULL, 33, '2026-05-01 22:35:31.528', NULL, NULL, false, 2, '2026-05-01 22:35:31.528', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (387, '2026-05-01 22:35:31.53', 37, 55, 18, NULL, 33, '2026-05-01 22:35:31.53', NULL, NULL, false, 3, '2026-05-01 22:35:31.53', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (388, '2026-05-01 22:35:31.532', 55, 87, 32, NULL, 33, '2026-05-01 22:35:31.532', NULL, NULL, false, 4, '2026-05-01 22:35:31.532', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (389, '2026-05-01 22:35:31.533', 87, 116, 29, NULL, 33, '2026-05-01 22:35:31.534', NULL, NULL, false, 5, '2026-05-01 22:35:31.534', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (390, '2026-05-01 22:35:31.535', 116, 124, 8, NULL, 33, '2026-05-01 22:35:31.535', NULL, NULL, false, 6, '2026-05-01 22:35:31.535', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (391, '2026-05-01 22:35:31.537', 124, 152, 28, NULL, 33, '2026-05-01 22:35:31.537', NULL, NULL, false, 7, '2026-05-01 22:35:31.537', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (392, '2026-05-01 22:35:31.538', 152, 177, 25, NULL, 33, '2026-05-01 22:35:31.539', NULL, NULL, false, 8, '2026-05-01 22:35:31.539', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (393, '2026-05-01 22:35:31.54', 177, 207, 30, NULL, 33, '2026-05-01 22:35:31.54', NULL, NULL, false, 9, '2026-05-01 22:35:31.54', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (394, '2026-05-01 22:35:31.541', 207, 224, 17, NULL, 33, '2026-05-01 22:35:31.542', NULL, NULL, false, 10, '2026-05-01 22:35:31.542', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (395, '2026-05-01 22:35:31.543', 224, 229, 5, NULL, 33, '2026-05-01 22:35:31.543', NULL, NULL, false, 11, '2026-05-01 22:35:31.543', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (396, '2026-05-01 22:35:31.545', 229, 257, 28, NULL, 33, '2026-05-01 22:35:31.545', NULL, NULL, false, 12, '2026-05-01 22:35:31.545', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (397, '2026-05-01 22:35:31.547', 0, 28, 28, NULL, 34, '2026-05-01 22:35:31.547', NULL, NULL, true, 1, '2026-05-01 22:35:31.547', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (398, '2026-05-01 22:35:31.549', 28, 41, 13, NULL, 34, '2026-05-01 22:35:31.549', NULL, NULL, false, 2, '2026-05-01 22:35:31.549', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (399, '2026-05-01 22:35:31.551', 41, 63, 22, NULL, 34, '2026-05-01 22:35:31.551', NULL, NULL, false, 3, '2026-05-01 22:35:31.551', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (400, '2026-05-01 22:35:31.552', 63, 77, 14, NULL, 34, '2026-05-01 22:35:31.553', NULL, NULL, false, 4, '2026-05-01 22:35:31.553', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (401, '2026-05-01 22:35:31.555', 77, 99, 22, NULL, 34, '2026-05-01 22:35:31.555', NULL, NULL, false, 5, '2026-05-01 22:35:31.555', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (402, '2026-05-01 22:35:31.557', 99, 113, 14, NULL, 34, '2026-05-01 22:35:31.557', NULL, NULL, false, 6, '2026-05-01 22:35:31.557', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (403, '2026-05-01 22:35:31.558', 113, 142, 29, NULL, 34, '2026-05-01 22:35:31.559', NULL, NULL, false, 7, '2026-05-01 22:35:31.559', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (404, '2026-05-01 22:35:31.56', 142, 170, 28, NULL, 34, '2026-05-01 22:35:31.561', NULL, NULL, false, 8, '2026-05-01 22:35:31.561', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (405, '2026-05-01 22:35:31.562', 170, 193, 23, NULL, 34, '2026-05-01 22:35:31.563', NULL, NULL, false, 9, '2026-05-01 22:35:31.563', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (406, '2026-05-01 22:35:31.564', 193, 219, 26, NULL, 34, '2026-05-01 22:35:31.565', NULL, NULL, false, 10, '2026-05-01 22:35:31.565', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (407, '2026-05-01 22:35:31.566', 219, 243, 24, NULL, 34, '2026-05-01 22:35:31.567', NULL, NULL, false, 11, '2026-05-01 22:35:31.567', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (408, '2026-05-01 22:35:31.568', 243, 268, 25, NULL, 34, '2026-05-01 22:35:31.568', NULL, NULL, false, 12, '2026-05-01 22:35:31.568', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (409, '2026-05-01 22:35:31.57', 0, 23, 23, NULL, 35, '2026-05-01 22:35:31.57', NULL, NULL, true, 1, '2026-05-01 22:35:31.57', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (410, '2026-05-01 22:35:31.571', 23, 47, 24, NULL, 35, '2026-05-01 22:35:31.571', NULL, NULL, false, 2, '2026-05-01 22:35:31.571', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (411, '2026-05-01 22:35:31.572', 47, 52, 5, NULL, 35, '2026-05-01 22:35:31.573', NULL, NULL, false, 3, '2026-05-01 22:35:31.573', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (412, '2026-05-01 22:35:31.574', 52, 63, 11, NULL, 35, '2026-05-01 22:35:31.574', NULL, NULL, false, 4, '2026-05-01 22:35:31.574', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (413, '2026-05-01 22:35:31.576', 63, 93, 30, NULL, 35, '2026-05-01 22:35:31.576', NULL, NULL, false, 5, '2026-05-01 22:35:31.576', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (414, '2026-05-01 22:35:31.578', 93, 127, 34, NULL, 35, '2026-05-01 22:35:31.578', NULL, NULL, false, 6, '2026-05-01 22:35:31.578', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (415, '2026-05-01 22:35:31.579', 127, 133, 6, NULL, 35, '2026-05-01 22:35:31.58', NULL, NULL, false, 7, '2026-05-01 22:35:31.58', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (416, '2026-05-01 22:35:31.581', 133, 147, 14, NULL, 35, '2026-05-01 22:35:31.582', NULL, NULL, false, 8, '2026-05-01 22:35:31.582', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (417, '2026-05-01 22:35:31.583', 147, 180, 33, NULL, 35, '2026-05-01 22:35:31.584', NULL, NULL, false, 9, '2026-05-01 22:35:31.584', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (418, '2026-05-01 22:35:31.585', 180, 196, 16, NULL, 35, '2026-05-01 22:35:31.585', NULL, NULL, false, 10, '2026-05-01 22:35:31.585', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (419, '2026-05-01 22:35:31.586', 196, 225, 29, NULL, 35, '2026-05-01 22:35:31.587', NULL, NULL, false, 11, '2026-05-01 22:35:31.587', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (420, '2026-05-01 22:35:31.588', 225, 254, 29, NULL, 35, '2026-05-01 22:35:31.589', NULL, NULL, false, 12, '2026-05-01 22:35:31.589', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (421, '2026-05-01 22:35:31.6', 0, 12, 12, NULL, 36, '2026-05-01 22:35:31.601', NULL, NULL, true, 1, '2026-05-01 22:35:31.601', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (422, '2026-05-01 22:35:31.61', 12, 33, 21, NULL, 36, '2026-05-01 22:35:31.611', NULL, NULL, false, 2, '2026-05-01 22:35:31.611', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (423, '2026-05-01 22:35:31.612', 33, 61, 28, NULL, 36, '2026-05-01 22:35:31.613', NULL, NULL, false, 3, '2026-05-01 22:35:31.613', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (424, '2026-05-01 22:35:31.615', 61, 70, 9, NULL, 36, '2026-05-01 22:35:31.615', NULL, NULL, false, 4, '2026-05-01 22:35:31.615', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (425, '2026-05-01 22:35:31.616', 70, 95, 25, NULL, 36, '2026-05-01 22:35:31.617', NULL, NULL, false, 5, '2026-05-01 22:35:31.617', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (426, '2026-05-01 22:35:31.618', 95, 106, 11, NULL, 36, '2026-05-01 22:35:31.619', NULL, NULL, false, 6, '2026-05-01 22:35:31.619', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (427, '2026-05-01 22:35:31.62', 106, 122, 16, NULL, 36, '2026-05-01 22:35:31.62', NULL, NULL, false, 7, '2026-05-01 22:35:31.62', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (428, '2026-05-01 22:35:31.622', 122, 155, 33, NULL, 36, '2026-05-01 22:35:31.622', NULL, NULL, false, 8, '2026-05-01 22:35:31.622', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (429, '2026-05-01 22:35:31.623', 155, 173, 18, NULL, 36, '2026-05-01 22:35:31.624', NULL, NULL, false, 9, '2026-05-01 22:35:31.624', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (430, '2026-05-01 22:35:31.625', 173, 201, 28, NULL, 36, '2026-05-01 22:35:31.625', NULL, NULL, false, 10, '2026-05-01 22:35:31.625', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (431, '2026-05-01 22:35:31.627', 201, 212, 11, NULL, 36, '2026-05-01 22:35:31.628', NULL, NULL, false, 11, '2026-05-01 22:35:31.628', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (432, '2026-05-01 22:35:31.63', 212, 244, 32, NULL, 36, '2026-05-01 22:35:31.631', NULL, NULL, false, 12, '2026-05-01 22:35:31.631', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (433, '2026-05-01 22:35:31.632', 0, 8, 8, NULL, 37, '2026-05-01 22:35:31.632', NULL, NULL, true, 1, '2026-05-01 22:35:31.632', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (434, '2026-05-01 22:35:31.634', 8, 35, 27, NULL, 37, '2026-05-01 22:35:31.634', NULL, NULL, false, 2, '2026-05-01 22:35:31.634', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (435, '2026-05-01 22:35:31.635', 35, 58, 23, NULL, 37, '2026-05-01 22:35:31.635', NULL, NULL, false, 3, '2026-05-01 22:35:31.635', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (436, '2026-05-01 22:35:31.637', 58, 72, 14, NULL, 37, '2026-05-01 22:35:31.637', NULL, NULL, false, 4, '2026-05-01 22:35:31.637', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (437, '2026-05-01 22:35:31.638', 72, 82, 10, NULL, 37, '2026-05-01 22:35:31.639', NULL, NULL, false, 5, '2026-05-01 22:35:31.639', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (438, '2026-05-01 22:35:31.64', 82, 107, 25, NULL, 37, '2026-05-01 22:35:31.641', NULL, NULL, false, 6, '2026-05-01 22:35:31.641', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (439, '2026-05-01 22:35:31.642', 107, 114, 7, NULL, 37, '2026-05-01 22:35:31.642', NULL, NULL, false, 7, '2026-05-01 22:35:31.642', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (440, '2026-05-01 22:35:31.644', 114, 145, 31, NULL, 37, '2026-05-01 22:35:31.644', NULL, NULL, false, 8, '2026-05-01 22:35:31.644', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (441, '2026-05-01 22:35:31.646', 145, 165, 20, NULL, 37, '2026-05-01 22:35:31.646', NULL, NULL, false, 9, '2026-05-01 22:35:31.646', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (442, '2026-05-01 22:35:31.647', 165, 197, 32, NULL, 37, '2026-05-01 22:35:31.648', NULL, NULL, false, 10, '2026-05-01 22:35:31.648', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (443, '2026-05-01 22:35:31.649', 197, 227, 30, NULL, 37, '2026-05-01 22:35:31.65', NULL, NULL, false, 11, '2026-05-01 22:35:31.65', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (444, '2026-05-01 22:35:31.651', 227, 240, 13, NULL, 37, '2026-05-01 22:35:31.652', NULL, NULL, false, 12, '2026-05-01 22:35:31.652', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (445, '2026-05-01 22:35:31.653', 0, 19, 19, NULL, 38, '2026-05-01 22:35:31.653', NULL, NULL, true, 1, '2026-05-01 22:35:31.653', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (446, '2026-05-01 22:35:31.655', 19, 29, 10, NULL, 38, '2026-05-01 22:35:31.655', NULL, NULL, false, 2, '2026-05-01 22:35:31.655', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (447, '2026-05-01 22:35:31.656', 29, 51, 22, NULL, 38, '2026-05-01 22:35:31.657', NULL, NULL, false, 3, '2026-05-01 22:35:31.657', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (448, '2026-05-01 22:35:31.658', 51, 62, 11, NULL, 38, '2026-05-01 22:35:31.658', NULL, NULL, false, 4, '2026-05-01 22:35:31.658', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (449, '2026-05-01 22:35:31.66', 62, 77, 15, NULL, 38, '2026-05-01 22:35:31.66', NULL, NULL, false, 5, '2026-05-01 22:35:31.66', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (450, '2026-05-01 22:35:31.661', 77, 97, 20, NULL, 38, '2026-05-01 22:35:31.661', NULL, NULL, false, 6, '2026-05-01 22:35:31.661', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (451, '2026-05-01 22:35:31.663', 97, 115, 18, NULL, 38, '2026-05-01 22:35:31.663', NULL, NULL, false, 7, '2026-05-01 22:35:31.663', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (452, '2026-05-01 22:35:31.665', 115, 122, 7, NULL, 38, '2026-05-01 22:35:31.665', NULL, NULL, false, 8, '2026-05-01 22:35:31.665', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (453, '2026-05-01 22:35:31.666', 122, 155, 33, NULL, 38, '2026-05-01 22:35:31.667', NULL, NULL, false, 9, '2026-05-01 22:35:31.667', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (454, '2026-05-01 22:35:31.668', 155, 178, 23, NULL, 38, '2026-05-01 22:35:31.668', NULL, NULL, false, 10, '2026-05-01 22:35:31.668', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (455, '2026-05-01 22:35:31.669', 178, 201, 23, NULL, 38, '2026-05-01 22:35:31.67', NULL, NULL, false, 11, '2026-05-01 22:35:31.67', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (456, '2026-05-01 22:35:31.671', 201, 226, 25, NULL, 38, '2026-05-01 22:35:31.671', NULL, NULL, false, 12, '2026-05-01 22:35:31.671', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (457, '2026-05-01 22:35:31.673', 0, 20, 20, NULL, 39, '2026-05-01 22:35:31.673', NULL, NULL, true, 1, '2026-05-01 22:35:31.673', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (458, '2026-05-01 22:35:31.675', 20, 41, 21, NULL, 39, '2026-05-01 22:35:31.675', NULL, NULL, false, 2, '2026-05-01 22:35:31.675', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (459, '2026-05-01 22:35:31.677', 41, 74, 33, NULL, 39, '2026-05-01 22:35:31.677', NULL, NULL, false, 3, '2026-05-01 22:35:31.677', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (460, '2026-05-01 22:35:31.679', 74, 79, 5, NULL, 39, '2026-05-01 22:35:31.679', NULL, NULL, false, 4, '2026-05-01 22:35:31.679', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (461, '2026-05-01 22:35:31.681', 79, 99, 20, NULL, 39, '2026-05-01 22:35:31.681', NULL, NULL, false, 5, '2026-05-01 22:35:31.681', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (462, '2026-05-01 22:35:31.683', 99, 116, 17, NULL, 39, '2026-05-01 22:35:31.683', NULL, NULL, false, 6, '2026-05-01 22:35:31.683', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (463, '2026-05-01 22:35:31.685', 116, 150, 34, NULL, 39, '2026-05-01 22:35:31.685', NULL, NULL, false, 7, '2026-05-01 22:35:31.685', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (464, '2026-05-01 22:35:31.686', 150, 161, 11, NULL, 39, '2026-05-01 22:35:31.687', NULL, NULL, false, 8, '2026-05-01 22:35:31.687', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (465, '2026-05-01 22:35:31.688', 161, 186, 25, NULL, 39, '2026-05-01 22:35:31.689', NULL, NULL, false, 9, '2026-05-01 22:35:31.689', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (466, '2026-05-01 22:35:31.69', 186, 205, 19, NULL, 39, '2026-05-01 22:35:31.69', NULL, NULL, false, 10, '2026-05-01 22:35:31.69', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (467, '2026-05-01 22:35:31.691', 205, 213, 8, NULL, 39, '2026-05-01 22:35:31.692', NULL, NULL, false, 11, '2026-05-01 22:35:31.692', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (468, '2026-05-01 22:35:31.693', 213, 223, 10, NULL, 39, '2026-05-01 22:35:31.694', NULL, NULL, false, 12, '2026-05-01 22:35:31.694', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (469, '2026-05-01 22:35:31.695', 0, 14, 14, NULL, 40, '2026-05-01 22:35:31.695', NULL, NULL, true, 1, '2026-05-01 22:35:31.695', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (470, '2026-05-01 22:35:31.697', 14, 34, 20, NULL, 40, '2026-05-01 22:35:31.697', NULL, NULL, false, 2, '2026-05-01 22:35:31.697', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (471, '2026-05-01 22:35:31.698', 34, 46, 12, NULL, 40, '2026-05-01 22:35:31.699', NULL, NULL, false, 3, '2026-05-01 22:35:31.699', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (472, '2026-05-01 22:35:31.7', 46, 76, 30, NULL, 40, '2026-05-01 22:35:31.701', NULL, NULL, false, 4, '2026-05-01 22:35:31.701', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (473, '2026-05-01 22:35:31.702', 76, 91, 15, NULL, 40, '2026-05-01 22:35:31.703', NULL, NULL, false, 5, '2026-05-01 22:35:31.703', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (474, '2026-05-01 22:35:31.704', 91, 122, 31, NULL, 40, '2026-05-01 22:35:31.704', NULL, NULL, false, 6, '2026-05-01 22:35:31.704', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (475, '2026-05-01 22:35:31.706', 122, 150, 28, NULL, 40, '2026-05-01 22:35:31.707', NULL, NULL, false, 7, '2026-05-01 22:35:31.707', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (476, '2026-05-01 22:35:31.721', 150, 179, 29, NULL, 40, '2026-05-01 22:35:31.726', NULL, NULL, false, 8, '2026-05-01 22:35:31.726', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (477, '2026-05-01 22:35:31.73', 179, 188, 9, NULL, 40, '2026-05-01 22:35:31.73', NULL, NULL, false, 9, '2026-05-01 22:35:31.73', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (478, '2026-05-01 22:35:31.732', 188, 203, 15, NULL, 40, '2026-05-01 22:35:31.732', NULL, NULL, false, 10, '2026-05-01 22:35:31.732', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (479, '2026-05-01 22:35:31.734', 203, 215, 12, NULL, 40, '2026-05-01 22:35:31.735', NULL, NULL, false, 11, '2026-05-01 22:35:31.735', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (480, '2026-05-01 22:35:31.736', 215, 239, 24, NULL, 40, '2026-05-01 22:35:31.736', NULL, NULL, false, 12, '2026-05-01 22:35:31.736', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (481, '2026-05-01 22:35:31.738', 0, 11, 11, NULL, 41, '2026-05-01 22:35:31.738', NULL, NULL, true, 1, '2026-05-01 22:35:31.738', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (482, '2026-05-01 22:35:31.739', 11, 40, 29, NULL, 41, '2026-05-01 22:35:31.74', NULL, NULL, false, 2, '2026-05-01 22:35:31.74', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (483, '2026-05-01 22:35:31.741', 40, 73, 33, NULL, 41, '2026-05-01 22:35:31.742', NULL, NULL, false, 3, '2026-05-01 22:35:31.742', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (484, '2026-05-01 22:35:31.743', 73, 87, 14, NULL, 41, '2026-05-01 22:35:31.743', NULL, NULL, false, 4, '2026-05-01 22:35:31.743', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (485, '2026-05-01 22:35:31.744', 87, 93, 6, NULL, 41, '2026-05-01 22:35:31.745', NULL, NULL, false, 5, '2026-05-01 22:35:31.745', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (486, '2026-05-01 22:35:31.746', 93, 123, 30, NULL, 41, '2026-05-01 22:35:31.746', NULL, NULL, false, 6, '2026-05-01 22:35:31.746', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (487, '2026-05-01 22:35:31.748', 123, 147, 24, NULL, 41, '2026-05-01 22:35:31.748', NULL, NULL, false, 7, '2026-05-01 22:35:31.748', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (488, '2026-05-01 22:35:31.749', 147, 173, 26, NULL, 41, '2026-05-01 22:35:31.75', NULL, NULL, false, 8, '2026-05-01 22:35:31.75', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (489, '2026-05-01 22:35:31.751', 173, 185, 12, NULL, 41, '2026-05-01 22:35:31.752', NULL, NULL, false, 9, '2026-05-01 22:35:31.752', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (490, '2026-05-01 22:35:31.753', 185, 204, 19, NULL, 41, '2026-05-01 22:35:31.754', NULL, NULL, false, 10, '2026-05-01 22:35:31.754', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (491, '2026-05-01 22:35:31.756', 204, 236, 32, NULL, 41, '2026-05-01 22:35:31.756', NULL, NULL, false, 11, '2026-05-01 22:35:31.756', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (492, '2026-05-01 22:35:31.758', 236, 257, 21, NULL, 41, '2026-05-01 22:35:31.758', NULL, NULL, false, 12, '2026-05-01 22:35:31.758', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (493, '2026-05-01 22:35:31.76', 0, 27, 27, NULL, 42, '2026-05-01 22:35:31.76', NULL, NULL, true, 1, '2026-05-01 22:35:31.76', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (494, '2026-05-01 22:35:31.761', 27, 50, 23, NULL, 42, '2026-05-01 22:35:31.762', NULL, NULL, false, 2, '2026-05-01 22:35:31.762', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (495, '2026-05-01 22:35:31.764', 50, 58, 8, NULL, 42, '2026-05-01 22:35:31.764', NULL, NULL, false, 3, '2026-05-01 22:35:31.764', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (496, '2026-05-01 22:35:31.765', 58, 80, 22, NULL, 42, '2026-05-01 22:35:31.766', NULL, NULL, false, 4, '2026-05-01 22:35:31.766', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (497, '2026-05-01 22:35:31.767', 80, 96, 16, NULL, 42, '2026-05-01 22:35:31.767', NULL, NULL, false, 5, '2026-05-01 22:35:31.767', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (498, '2026-05-01 22:35:31.769', 96, 105, 9, NULL, 42, '2026-05-01 22:35:31.769', NULL, NULL, false, 6, '2026-05-01 22:35:31.769', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (499, '2026-05-01 22:35:31.77', 105, 134, 29, NULL, 42, '2026-05-01 22:35:31.771', NULL, NULL, false, 7, '2026-05-01 22:35:31.771', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (500, '2026-05-01 22:35:31.772', 134, 143, 9, NULL, 42, '2026-05-01 22:35:31.772', NULL, NULL, false, 8, '2026-05-01 22:35:31.772', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (501, '2026-05-01 22:35:31.774', 143, 162, 19, NULL, 42, '2026-05-01 22:35:31.774', NULL, NULL, false, 9, '2026-05-01 22:35:31.774', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (502, '2026-05-01 22:35:31.775', 162, 168, 6, NULL, 42, '2026-05-01 22:35:31.776', NULL, NULL, false, 10, '2026-05-01 22:35:31.776', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (503, '2026-05-01 22:35:31.777', 168, 176, 8, NULL, 42, '2026-05-01 22:35:31.777', NULL, NULL, false, 11, '2026-05-01 22:35:31.777', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (504, '2026-05-01 22:35:31.778', 176, 204, 28, NULL, 42, '2026-05-01 22:35:31.779', NULL, NULL, false, 12, '2026-05-01 22:35:31.779', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (505, '2026-05-01 22:35:31.78', 0, 5, 5, NULL, 43, '2026-05-01 22:35:31.78', NULL, NULL, true, 1, '2026-05-01 22:35:31.78', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (506, '2026-05-01 22:35:31.781', 5, 33, 28, NULL, 43, '2026-05-01 22:35:31.782', NULL, NULL, false, 2, '2026-05-01 22:35:31.782', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (507, '2026-05-01 22:35:31.783', 33, 52, 19, NULL, 43, '2026-05-01 22:35:31.783', NULL, NULL, false, 3, '2026-05-01 22:35:31.783', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (508, '2026-05-01 22:35:31.785', 52, 78, 26, NULL, 43, '2026-05-01 22:35:31.785', NULL, NULL, false, 4, '2026-05-01 22:35:31.785', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (509, '2026-05-01 22:35:31.786', 78, 101, 23, NULL, 43, '2026-05-01 22:35:31.787', NULL, NULL, false, 5, '2026-05-01 22:35:31.787', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (510, '2026-05-01 22:35:31.788', 101, 122, 21, NULL, 43, '2026-05-01 22:35:31.789', NULL, NULL, false, 6, '2026-05-01 22:35:31.789', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (511, '2026-05-01 22:35:31.79', 122, 155, 33, NULL, 43, '2026-05-01 22:35:31.79', NULL, NULL, false, 7, '2026-05-01 22:35:31.79', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (512, '2026-05-01 22:35:31.791', 155, 173, 18, NULL, 43, '2026-05-01 22:35:31.791', NULL, NULL, false, 8, '2026-05-01 22:35:31.791', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (513, '2026-05-01 22:35:31.792', 173, 194, 21, NULL, 43, '2026-05-01 22:35:31.793', NULL, NULL, false, 9, '2026-05-01 22:35:31.793', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (514, '2026-05-01 22:35:31.794', 194, 214, 20, NULL, 43, '2026-05-01 22:35:31.794', NULL, NULL, false, 10, '2026-05-01 22:35:31.794', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (515, '2026-05-01 22:35:31.796', 214, 223, 9, NULL, 43, '2026-05-01 22:35:31.796', NULL, NULL, false, 11, '2026-05-01 22:35:31.796', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (516, '2026-05-01 22:35:31.797', 223, 245, 22, NULL, 43, '2026-05-01 22:35:31.798', NULL, NULL, false, 12, '2026-05-01 22:35:31.798', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (517, '2026-05-01 22:35:31.799', 0, 34, 34, NULL, 44, '2026-05-01 22:35:31.799', NULL, NULL, true, 1, '2026-05-01 22:35:31.799', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (518, '2026-05-01 22:35:31.8', 34, 53, 19, NULL, 44, '2026-05-01 22:35:31.801', NULL, NULL, false, 2, '2026-05-01 22:35:31.801', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (519, '2026-05-01 22:35:31.802', 53, 87, 34, NULL, 44, '2026-05-01 22:35:31.802', NULL, NULL, false, 3, '2026-05-01 22:35:31.802', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (520, '2026-05-01 22:35:31.804', 87, 117, 30, NULL, 44, '2026-05-01 22:35:31.804', NULL, NULL, false, 4, '2026-05-01 22:35:31.804', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (521, '2026-05-01 22:35:31.805', 117, 127, 10, NULL, 44, '2026-05-01 22:35:31.806', NULL, NULL, false, 5, '2026-05-01 22:35:31.806', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (522, '2026-05-01 22:35:31.807', 127, 156, 29, NULL, 44, '2026-05-01 22:35:31.807', NULL, NULL, false, 6, '2026-05-01 22:35:31.807', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (523, '2026-05-01 22:35:31.808', 156, 185, 29, NULL, 44, '2026-05-01 22:35:31.809', NULL, NULL, false, 7, '2026-05-01 22:35:31.809', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (524, '2026-05-01 22:35:31.81', 185, 207, 22, NULL, 44, '2026-05-01 22:35:31.811', NULL, NULL, false, 8, '2026-05-01 22:35:31.811', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (525, '2026-05-01 22:35:31.812', 207, 231, 24, NULL, 44, '2026-05-01 22:35:31.813', NULL, NULL, false, 9, '2026-05-01 22:35:31.813', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (526, '2026-05-01 22:35:31.815', 231, 257, 26, NULL, 44, '2026-05-01 22:35:31.815', NULL, NULL, false, 10, '2026-05-01 22:35:31.815', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (527, '2026-05-01 22:35:31.816', 257, 270, 13, NULL, 44, '2026-05-01 22:35:31.816', NULL, NULL, false, 11, '2026-05-01 22:35:31.816', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (528, '2026-05-01 22:35:31.817', 270, 296, 26, NULL, 44, '2026-05-01 22:35:31.818', NULL, NULL, false, 12, '2026-05-01 22:35:31.818', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (529, '2026-05-01 22:35:31.819', 0, 23, 23, NULL, 45, '2026-05-01 22:35:31.819', NULL, NULL, true, 1, '2026-05-01 22:35:31.819', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (530, '2026-05-01 22:35:31.82', 23, 50, 27, NULL, 45, '2026-05-01 22:35:31.82', NULL, NULL, false, 2, '2026-05-01 22:35:31.82', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (531, '2026-05-01 22:35:31.822', 50, 56, 6, NULL, 45, '2026-05-01 22:35:31.822', NULL, NULL, false, 3, '2026-05-01 22:35:31.822', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (532, '2026-05-01 22:35:31.824', 56, 85, 29, NULL, 45, '2026-05-01 22:35:31.824', NULL, NULL, false, 4, '2026-05-01 22:35:31.824', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (533, '2026-05-01 22:35:31.826', 85, 106, 21, NULL, 45, '2026-05-01 22:35:31.826', NULL, NULL, false, 5, '2026-05-01 22:35:31.826', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (534, '2026-05-01 22:35:31.828', 106, 117, 11, NULL, 45, '2026-05-01 22:35:31.828', NULL, NULL, false, 6, '2026-05-01 22:35:31.828', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (535, '2026-05-01 22:35:31.829', 117, 129, 12, NULL, 45, '2026-05-01 22:35:31.83', NULL, NULL, false, 7, '2026-05-01 22:35:31.83', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (536, '2026-05-01 22:35:31.831', 129, 163, 34, NULL, 45, '2026-05-01 22:35:31.832', NULL, NULL, false, 8, '2026-05-01 22:35:31.832', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (537, '2026-05-01 22:35:31.833', 163, 189, 26, NULL, 45, '2026-05-01 22:35:31.834', NULL, NULL, false, 9, '2026-05-01 22:35:31.834', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (538, '2026-05-01 22:35:31.835', 189, 201, 12, NULL, 45, '2026-05-01 22:35:31.835', NULL, NULL, false, 10, '2026-05-01 22:35:31.835', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (539, '2026-05-01 22:35:31.837', 201, 220, 19, NULL, 45, '2026-05-01 22:35:31.837', NULL, NULL, false, 11, '2026-05-01 22:35:31.837', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (540, '2026-05-01 22:35:31.838', 220, 235, 15, NULL, 45, '2026-05-01 22:35:31.839', NULL, NULL, false, 12, '2026-05-01 22:35:31.839', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (541, '2026-05-01 22:35:31.853', 0, 18, 18, NULL, 46, '2026-05-01 22:35:31.859', NULL, NULL, true, 1, '2026-05-01 22:35:31.859', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (542, '2026-05-01 22:35:31.862', 18, 46, 28, NULL, 46, '2026-05-01 22:35:31.862', NULL, NULL, false, 2, '2026-05-01 22:35:31.862', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (543, '2026-05-01 22:35:31.863', 46, 55, 9, NULL, 46, '2026-05-01 22:35:31.864', NULL, NULL, false, 3, '2026-05-01 22:35:31.864', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (544, '2026-05-01 22:35:31.865', 55, 62, 7, NULL, 46, '2026-05-01 22:35:31.866', NULL, NULL, false, 4, '2026-05-01 22:35:31.866', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (545, '2026-05-01 22:35:31.867', 62, 75, 13, NULL, 46, '2026-05-01 22:35:31.867', NULL, NULL, false, 5, '2026-05-01 22:35:31.867', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (546, '2026-05-01 22:35:31.869', 75, 87, 12, NULL, 46, '2026-05-01 22:35:31.869', NULL, NULL, false, 6, '2026-05-01 22:35:31.869', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (547, '2026-05-01 22:35:31.871', 87, 112, 25, NULL, 46, '2026-05-01 22:35:31.871', NULL, NULL, false, 7, '2026-05-01 22:35:31.871', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (548, '2026-05-01 22:35:31.872', 112, 134, 22, NULL, 46, '2026-05-01 22:35:31.873', NULL, NULL, false, 8, '2026-05-01 22:35:31.873', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (549, '2026-05-01 22:35:31.874', 134, 158, 24, NULL, 46, '2026-05-01 22:35:31.875', NULL, NULL, false, 9, '2026-05-01 22:35:31.875', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (550, '2026-05-01 22:35:31.876', 158, 187, 29, NULL, 46, '2026-05-01 22:35:31.876', NULL, NULL, false, 10, '2026-05-01 22:35:31.876', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (551, '2026-05-01 22:35:31.878', 187, 196, 9, NULL, 46, '2026-05-01 22:35:31.878', NULL, NULL, false, 11, '2026-05-01 22:35:31.878', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (552, '2026-05-01 22:35:31.879', 196, 201, 5, NULL, 46, '2026-05-01 22:35:31.88', NULL, NULL, false, 12, '2026-05-01 22:35:31.88', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (553, '2026-05-01 22:35:31.881', 0, 30, 30, NULL, 47, '2026-05-01 22:35:31.881', NULL, NULL, true, 1, '2026-05-01 22:35:31.881', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (554, '2026-05-01 22:35:31.883', 30, 59, 29, NULL, 47, '2026-05-01 22:35:31.883', NULL, NULL, false, 2, '2026-05-01 22:35:31.883', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (555, '2026-05-01 22:35:31.884', 59, 89, 30, NULL, 47, '2026-05-01 22:35:31.885', NULL, NULL, false, 3, '2026-05-01 22:35:31.885', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (556, '2026-05-01 22:35:31.886', 89, 115, 26, NULL, 47, '2026-05-01 22:35:31.887', NULL, NULL, false, 4, '2026-05-01 22:35:31.887', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (557, '2026-05-01 22:35:31.888', 115, 129, 14, NULL, 47, '2026-05-01 22:35:31.888', NULL, NULL, false, 5, '2026-05-01 22:35:31.888', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (558, '2026-05-01 22:35:31.89', 129, 156, 27, NULL, 47, '2026-05-01 22:35:31.89', NULL, NULL, false, 6, '2026-05-01 22:35:31.89', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (559, '2026-05-01 22:35:31.891', 156, 170, 14, NULL, 47, '2026-05-01 22:35:31.892', NULL, NULL, false, 7, '2026-05-01 22:35:31.892', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (560, '2026-05-01 22:35:31.893', 170, 190, 20, NULL, 47, '2026-05-01 22:35:31.893', NULL, NULL, false, 8, '2026-05-01 22:35:31.893', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (561, '2026-05-01 22:35:31.895', 190, 224, 34, NULL, 47, '2026-05-01 22:35:31.895', NULL, NULL, false, 9, '2026-05-01 22:35:31.895', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (562, '2026-05-01 22:35:31.896', 224, 236, 12, NULL, 47, '2026-05-01 22:35:31.896', NULL, NULL, false, 10, '2026-05-01 22:35:31.896', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (563, '2026-05-01 22:35:31.898', 236, 268, 32, NULL, 47, '2026-05-01 22:35:31.898', NULL, NULL, false, 11, '2026-05-01 22:35:31.898', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (564, '2026-05-01 22:35:31.899', 268, 289, 21, NULL, 47, '2026-05-01 22:35:31.9', NULL, NULL, false, 12, '2026-05-01 22:35:31.9', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (565, '2026-05-01 22:35:31.901', 0, 15, 15, NULL, 48, '2026-05-01 22:35:31.901', NULL, NULL, true, 1, '2026-05-01 22:35:31.901', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (566, '2026-05-01 22:35:31.902', 15, 47, 32, NULL, 48, '2026-05-01 22:35:31.903', NULL, NULL, false, 2, '2026-05-01 22:35:31.903', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (567, '2026-05-01 22:35:31.904', 47, 79, 32, NULL, 48, '2026-05-01 22:35:31.905', NULL, NULL, false, 3, '2026-05-01 22:35:31.905', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (568, '2026-05-01 22:35:31.906', 79, 84, 5, NULL, 48, '2026-05-01 22:35:31.906', NULL, NULL, false, 4, '2026-05-01 22:35:31.906', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (569, '2026-05-01 22:35:31.907', 84, 100, 16, NULL, 48, '2026-05-01 22:35:31.908', NULL, NULL, false, 5, '2026-05-01 22:35:31.908', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (570, '2026-05-01 22:35:31.909', 100, 131, 31, NULL, 48, '2026-05-01 22:35:31.909', NULL, NULL, false, 6, '2026-05-01 22:35:31.909', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (571, '2026-05-01 22:35:31.911', 131, 157, 26, NULL, 48, '2026-05-01 22:35:31.911', NULL, NULL, false, 7, '2026-05-01 22:35:31.911', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (572, '2026-05-01 22:35:31.912', 157, 171, 14, NULL, 48, '2026-05-01 22:35:31.913', NULL, NULL, false, 8, '2026-05-01 22:35:31.913', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (573, '2026-05-01 22:35:31.914', 171, 186, 15, NULL, 48, '2026-05-01 22:35:31.914', NULL, NULL, false, 9, '2026-05-01 22:35:31.914', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (574, '2026-05-01 22:35:31.915', 186, 191, 5, NULL, 48, '2026-05-01 22:35:31.916', NULL, NULL, false, 10, '2026-05-01 22:35:31.916', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (575, '2026-05-01 22:35:31.917', 191, 208, 17, NULL, 48, '2026-05-01 22:35:31.917', NULL, NULL, false, 11, '2026-05-01 22:35:31.917', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (576, '2026-05-01 22:35:31.919', 208, 231, 23, NULL, 48, '2026-05-01 22:35:31.919', NULL, NULL, false, 12, '2026-05-01 22:35:31.919', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (577, '2026-05-01 22:35:31.92', 0, 5, 5, NULL, 49, '2026-05-01 22:35:31.92', NULL, NULL, true, 1, '2026-05-01 22:35:31.92', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (578, '2026-05-01 22:35:31.922', 5, 29, 24, NULL, 49, '2026-05-01 22:35:31.922', NULL, NULL, false, 2, '2026-05-01 22:35:31.922', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (579, '2026-05-01 22:35:31.923', 29, 58, 29, NULL, 49, '2026-05-01 22:35:31.924', NULL, NULL, false, 3, '2026-05-01 22:35:31.924', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (580, '2026-05-01 22:35:31.925', 58, 86, 28, NULL, 49, '2026-05-01 22:35:31.925', NULL, NULL, false, 4, '2026-05-01 22:35:31.925', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (581, '2026-05-01 22:35:31.926', 86, 109, 23, NULL, 49, '2026-05-01 22:35:31.927', NULL, NULL, false, 5, '2026-05-01 22:35:31.927', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (582, '2026-05-01 22:35:31.928', 109, 121, 12, NULL, 49, '2026-05-01 22:35:31.928', NULL, NULL, false, 6, '2026-05-01 22:35:31.928', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (583, '2026-05-01 22:35:31.93', 121, 155, 34, NULL, 49, '2026-05-01 22:35:31.93', NULL, NULL, false, 7, '2026-05-01 22:35:31.93', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (584, '2026-05-01 22:35:31.931', 155, 165, 10, NULL, 49, '2026-05-01 22:35:31.932', NULL, NULL, false, 8, '2026-05-01 22:35:31.932', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (585, '2026-05-01 22:35:31.933', 165, 175, 10, NULL, 49, '2026-05-01 22:35:31.933', NULL, NULL, false, 9, '2026-05-01 22:35:31.933', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (586, '2026-05-01 22:35:31.935', 175, 184, 9, NULL, 49, '2026-05-01 22:35:31.935', NULL, NULL, false, 10, '2026-05-01 22:35:31.935', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (587, '2026-05-01 22:35:31.936', 184, 202, 18, NULL, 49, '2026-05-01 22:35:31.937', NULL, NULL, false, 11, '2026-05-01 22:35:31.937', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (588, '2026-05-01 22:35:31.938', 202, 226, 24, NULL, 49, '2026-05-01 22:35:31.938', NULL, NULL, false, 12, '2026-05-01 22:35:31.938', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (589, '2026-05-01 22:35:31.94', 0, 5, 5, NULL, 50, '2026-05-01 22:35:31.94', NULL, NULL, true, 1, '2026-05-01 22:35:31.94', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (590, '2026-05-01 22:35:31.941', 5, 16, 11, NULL, 50, '2026-05-01 22:35:31.942', NULL, NULL, false, 2, '2026-05-01 22:35:31.942', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (591, '2026-05-01 22:35:31.943', 16, 44, 28, NULL, 50, '2026-05-01 22:35:31.944', NULL, NULL, false, 3, '2026-05-01 22:35:31.944', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (592, '2026-05-01 22:35:31.945', 44, 76, 32, NULL, 50, '2026-05-01 22:35:31.945', NULL, NULL, false, 4, '2026-05-01 22:35:31.945', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (593, '2026-05-01 22:35:31.947', 76, 89, 13, NULL, 50, '2026-05-01 22:35:31.947', NULL, NULL, false, 5, '2026-05-01 22:35:31.947', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (594, '2026-05-01 22:35:31.948', 89, 96, 7, NULL, 50, '2026-05-01 22:35:31.949', NULL, NULL, false, 6, '2026-05-01 22:35:31.949', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (595, '2026-05-01 22:35:31.95', 96, 111, 15, NULL, 50, '2026-05-01 22:35:31.951', NULL, NULL, false, 7, '2026-05-01 22:35:31.951', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (596, '2026-05-01 22:35:31.952', 111, 134, 23, NULL, 50, '2026-05-01 22:35:31.952', NULL, NULL, false, 8, '2026-05-01 22:35:31.952', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (597, '2026-05-01 22:35:31.954', 134, 160, 26, NULL, 50, '2026-05-01 22:35:31.954', NULL, NULL, false, 9, '2026-05-01 22:35:31.954', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (598, '2026-05-01 22:35:31.976', 160, 168, 8, NULL, 50, '2026-05-01 22:35:31.977', NULL, NULL, false, 10, '2026-05-01 22:35:31.977', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (599, '2026-05-01 22:35:31.979', 168, 178, 10, NULL, 50, '2026-05-01 22:35:31.979', NULL, NULL, false, 11, '2026-05-01 22:35:31.979', NULL, 'APROBADA', NULL);
INSERT INTO public.lecturas VALUES (600, '2026-05-01 22:35:31.981', 178, 208, 30, NULL, 50, '2026-05-01 22:35:31.981', NULL, NULL, false, 12, '2026-05-01 22:35:31.981', NULL, 'APROBADA', NULL);


--
-- Data for Name: lote_facturacion; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: medidores; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: menu_permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.menu_permisos VALUES (1, 1, 19, NULL);
INSERT INTO public.menu_permisos VALUES (2, 2, 20, NULL);
INSERT INTO public.menu_permisos VALUES (3, 3, 21, NULL);
INSERT INTO public.menu_permisos VALUES (4, 4, 22, NULL);
INSERT INTO public.menu_permisos VALUES (5, 5, 23, NULL);
INSERT INTO public.menu_permisos VALUES (6, 6, 24, NULL);
INSERT INTO public.menu_permisos VALUES (7, 7, 25, NULL);
INSERT INTO public.menu_permisos VALUES (8, 8, 26, NULL);
INSERT INTO public.menu_permisos VALUES (9, 9, 27, NULL);
INSERT INTO public.menu_permisos VALUES (10, 10, 28, NULL);
INSERT INTO public.menu_permisos VALUES (11, 11, 29, NULL);
INSERT INTO public.menu_permisos VALUES (12, 12, 30, NULL);
INSERT INTO public.menu_permisos VALUES (13, 13, 31, NULL);
INSERT INTO public.menu_permisos VALUES (14, 14, 32, NULL);
INSERT INTO public.menu_permisos VALUES (15, 15, 33, NULL);
INSERT INTO public.menu_permisos VALUES (16, 16, 34, NULL);
INSERT INTO public.menu_permisos VALUES (17, 17, 35, NULL);
INSERT INTO public.menu_permisos VALUES (18, 18, 36, NULL);
INSERT INTO public.menu_permisos VALUES (19, 19, 37, NULL);
INSERT INTO public.menu_permisos VALUES (20, 20, 38, NULL);
INSERT INTO public.menu_permisos VALUES (21, 21, 39, NULL);
INSERT INTO public.menu_permisos VALUES (22, 22, 40, NULL);
INSERT INTO public.menu_permisos VALUES (23, 23, 41, NULL);
INSERT INTO public.menu_permisos VALUES (24, 24, 42, NULL);
INSERT INTO public.menu_permisos VALUES (25, 25, 43, NULL);
INSERT INTO public.menu_permisos VALUES (26, 26, 44, NULL);
INSERT INTO public.menu_permisos VALUES (27, 27, 45, NULL);
INSERT INTO public.menu_permisos VALUES (28, 28, 46, NULL);
INSERT INTO public.menu_permisos VALUES (29, 29, 47, NULL);
INSERT INTO public.menu_permisos VALUES (30, 30, 48, NULL);
INSERT INTO public.menu_permisos VALUES (31, 31, 49, NULL);
INSERT INTO public.menu_permisos VALUES (32, 32, 50, NULL);
INSERT INTO public.menu_permisos VALUES (33, 33, 51, NULL);
INSERT INTO public.menu_permisos VALUES (34, 34, 52, NULL);
INSERT INTO public.menu_permisos VALUES (35, 35, 53, NULL);
INSERT INTO public.menu_permisos VALUES (36, 36, 54, NULL);
INSERT INTO public.menu_permisos VALUES (37, 37, 55, NULL);
INSERT INTO public.menu_permisos VALUES (38, 38, 56, NULL);
INSERT INTO public.menu_permisos VALUES (39, 39, 57, NULL);
INSERT INTO public.menu_permisos VALUES (40, 40, 58, NULL);
INSERT INTO public.menu_permisos VALUES (41, 41, 59, NULL);
INSERT INTO public.menu_permisos VALUES (42, 42, 60, NULL);
INSERT INTO public.menu_permisos VALUES (43, 43, 61, NULL);
INSERT INTO public.menu_permisos VALUES (44, 44, 62, NULL);
INSERT INTO public.menu_permisos VALUES (45, 45, 63, NULL);
INSERT INTO public.menu_permisos VALUES (46, 46, 64, NULL);
INSERT INTO public.menu_permisos VALUES (47, 47, 65, NULL);
INSERT INTO public.menu_permisos VALUES (48, 48, 66, NULL);
INSERT INTO public.menu_permisos VALUES (49, 49, 67, NULL);
INSERT INTO public.menu_permisos VALUES (50, 50, 68, NULL);
INSERT INTO public.menu_permisos VALUES (51, 51, 69, NULL);
INSERT INTO public.menu_permisos VALUES (52, 52, 70, NULL);
INSERT INTO public.menu_permisos VALUES (53, 53, 71, NULL);
INSERT INTO public.menu_permisos VALUES (54, 54, 72, NULL);
INSERT INTO public.menu_permisos VALUES (55, 55, 73, NULL);
INSERT INTO public.menu_permisos VALUES (56, 56, 74, NULL);
INSERT INTO public.menu_permisos VALUES (57, 57, 75, NULL);
INSERT INTO public.menu_permisos VALUES (58, 58, 76, NULL);
INSERT INTO public.menu_permisos VALUES (59, 59, 77, NULL);
INSERT INTO public.menu_permisos VALUES (60, 60, 78, NULL);
INSERT INTO public.menu_permisos VALUES (61, 62, 81, NULL);
INSERT INTO public.menu_permisos VALUES (62, 61, 82, NULL);
INSERT INTO public.menu_permisos VALUES (63, 63, 83, NULL);
INSERT INTO public.menu_permisos VALUES (64, 64, 84, NULL);


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.menus VALUES (1, NULL, 'contract', 'Contratos', '/Contratos', true, NULL);
INSERT INTO public.menus VALUES (2, 1, 'inbox_text_person', 'Cliente', '/Contratos/Cliente', true, NULL);
INSERT INTO public.menus VALUES (3, 1, 'clean_hands', 'Contratos de Servicios', '/Contratos/ContratosDeServicios', true, NULL);
INSERT INTO public.menus VALUES (4, 1, 'valve', 'Medidores', '/Contratos/Medidores', true, NULL);
INSERT INTO public.menus VALUES (5, 1, 'price_change', 'Tarifas y Categorias', '/Contratos/TarifasYCategorias', true, NULL);
INSERT INTO public.menus VALUES (6, 1, 'dishwasher_gen', 'Lectura de Consumo', '/Contratos/LecturaDeConsumo', true, NULL);
INSERT INTO public.menus VALUES (7, 1, 'handshake', 'Convenios de pago', '/Contratos/ConveniosDePago', true, NULL);
INSERT INTO public.menus VALUES (8, NULL, 'receipt', 'Facturacion', '/Facturacion', true, NULL);
INSERT INTO public.menus VALUES (9, 8, 'assignment', 'Generacion de Planillas', '/Facturacion/GeneracionPlanilla', true, NULL);
INSERT INTO public.menus VALUES (10, 8, 'receipt_long', 'Facturacion Electronica', '/Facturacion/FacturacionElectronica', true, NULL);
INSERT INTO public.menus VALUES (11, 8, 'point_of_sale', 'Recaudación y pagos', '/Facturacion/RecaudacionYPagos', true, NULL);
INSERT INTO public.menus VALUES (12, 8, 'universal_currency', 'Notas de Credito o Debito', '/Facturacion/NotasDeCreditoDebito', true, NULL);
INSERT INTO public.menus VALUES (13, 8, 'export_notes', 'Envio de Facturas', '/Facturacion/EnvioDeFacturacion', true, NULL);
INSERT INTO public.menus VALUES (14, NULL, 'menu_book', 'Reportes', '/Reportes', true, NULL);
INSERT INTO public.menus VALUES (15, 14, 'article_person', 'Estado de cuenta Cliente', '/Reportes/EstadoCuentaCliente', true, NULL);
INSERT INTO public.menus VALUES (16, 14, 'money_off', 'Recaudación y Morosida', '/Reportes/RecaudacionMorosida', true, NULL);
INSERT INTO public.menus VALUES (17, 14, 'location_on', 'ConsumoPorZonas', '/Reportes/ConsumoZonas', true, NULL);
INSERT INTO public.menus VALUES (18, 14, 'dashboard', 'DashboardKpi', '/Reportes/DashboardKpi', true, NULL);
INSERT INTO public.menus VALUES (19, 2, NULL, 'Listar Cliente', '/Contratos/Cliente/Listar', true, NULL);
INSERT INTO public.menus VALUES (20, 2, NULL, 'Crear Cliente', '/Contratos/Cliente/Crear', true, NULL);
INSERT INTO public.menus VALUES (21, 2, NULL, 'Actualizar Cliente', '/Contratos/Cliente/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (22, 2, NULL, 'Eliminar Cliente', '/Contratos/Cliente/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (23, 3, NULL, 'Listar Contratos de Servicios', '/Contratos/ContratosDeServicios/Listar', true, NULL);
INSERT INTO public.menus VALUES (24, 3, NULL, 'Crear Contratos de Servicios', '/Contratos/ContratosDeServicios/Crear', true, NULL);
INSERT INTO public.menus VALUES (25, 3, NULL, 'Actualizar Contratos de Servicios', '/Contratos/ContratosDeServicios/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (26, 3, NULL, 'Eliminar Contratos de Servicios', '/Contratos/ContratosDeServicios/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (27, 4, NULL, 'Listar Medidores', '/Contratos/Medidores/Listar', true, NULL);
INSERT INTO public.menus VALUES (28, 4, NULL, 'Crear Medidores', '/Contratos/Medidores/Crear', true, NULL);
INSERT INTO public.menus VALUES (29, 4, NULL, 'Actualizar Medidores', '/Contratos/Medidores/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (30, 4, NULL, 'Eliminar Medidores', '/Contratos/Medidores/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (31, 5, NULL, 'Listar Tarifas y Categorias', '/Contratos/TarifasYCategorias/Listar', true, NULL);
INSERT INTO public.menus VALUES (32, 5, NULL, 'Crear Tarifas y Categorias', '/Contratos/TarifasYCategorias/Crear', true, NULL);
INSERT INTO public.menus VALUES (33, 5, NULL, 'Actualizar Tarifas y Categorias', '/Contratos/TarifasYCategorias/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (34, 5, NULL, 'Eliminar Tarifas y Categorias', '/Contratos/TarifasYCategorias/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (35, 6, NULL, 'Listar Lectura de Consumo', '/Contratos/LecturaDeConsumo/Listar', true, NULL);
INSERT INTO public.menus VALUES (36, 6, NULL, 'Crear Lectura de Consumo', '/Contratos/LecturaDeConsumo/Crear', true, NULL);
INSERT INTO public.menus VALUES (37, 6, NULL, 'Actualizar Lectura de Consumo', '/Contratos/LecturaDeConsumo/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (38, 6, NULL, 'Eliminar Lectura de Consumo', '/Contratos/LecturaDeConsumo/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (39, 7, NULL, 'Listar Convenios de pago', '/Contratos/ConveniosDePago/Listar', true, NULL);
INSERT INTO public.menus VALUES (40, 7, NULL, 'Crear Convenios de pago', '/Contratos/ConveniosDePago/Crear', true, NULL);
INSERT INTO public.menus VALUES (41, 7, NULL, 'Actualizar Convenios de pago', '/Contratos/ConveniosDePago/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (42, 7, NULL, 'Eliminar Convenios de pago', '/Contratos/ConveniosDePago/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (43, 9, NULL, 'Listar Generacion de Planillas', '/Facturacion/GeneracionPlanilla/Listar', true, NULL);
INSERT INTO public.menus VALUES (44, 9, NULL, 'Crear Generacion de Planillas', '/Facturacion/GeneracionPlanilla/Crear', true, NULL);
INSERT INTO public.menus VALUES (45, 9, NULL, 'Actualizar Generacion de Planillas', '/Facturacion/GeneracionPlanilla/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (46, 9, NULL, 'Eliminar Generacion de Planillas', '/Facturacion/GeneracionPlanilla/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (47, 10, NULL, 'Listar Facturacion Electronica', '/Facturacion/FacturacionElectronica/Listar', true, NULL);
INSERT INTO public.menus VALUES (48, 10, NULL, 'Crear Facturacion Electronica', '/Facturacion/FacturacionElectronica/Crear', true, NULL);
INSERT INTO public.menus VALUES (49, 10, NULL, 'Actualizar Facturacion Electronica', '/Facturacion/FacturacionElectronica/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (50, 10, NULL, 'Eliminar Facturacion Electronica', '/Facturacion/FacturacionElectronica/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (51, 11, NULL, 'Listar Recaudación y pagos', '/Facturacion/RecaudacionYPagos/Listar', true, NULL);
INSERT INTO public.menus VALUES (52, 11, NULL, 'Crear Recaudación y pagos', '/Facturacion/RecaudacionYPagos/Crear', true, NULL);
INSERT INTO public.menus VALUES (53, 11, NULL, 'Actualizar Recaudación y pagos', '/Facturacion/RecaudacionYPagos/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (54, 11, NULL, 'Eliminar Recaudación y pagos', '/Facturacion/RecaudacionYPagos/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (55, 12, NULL, 'Listar Notas de Credito o Debito', '/Facturacion/NotasDeCreditoDebito/Listar', true, NULL);
INSERT INTO public.menus VALUES (56, 12, NULL, 'Crear Notas de Credito o Debito', '/Facturacion/NotasDeCreditoDebito/Crear', true, NULL);
INSERT INTO public.menus VALUES (57, 12, NULL, 'Actualizar Notas de Credito o Debito', '/Facturacion/NotasDeCreditoDebito/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (58, 12, NULL, 'Eliminar Notas de Credito o Debito', '/Facturacion/NotasDeCreditoDebito/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (59, 13, NULL, 'Listar Envio de Facturas', '/Facturacion/EnvioDeFacturacion/Listar', true, NULL);
INSERT INTO public.menus VALUES (60, 13, NULL, 'Crear Envio de Facturas', '/Facturacion/EnvioDeFacturacion/Crear', true, NULL);
INSERT INTO public.menus VALUES (61, 13, NULL, 'Actualizar Envio de Facturas', '/Facturacion/EnvioDeFacturacion/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (62, 13, NULL, 'Eliminar Envio de Facturas', '/Facturacion/EnvioDeFacturacion/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (63, 15, NULL, 'Listar Estado de cuenta Cliente', '/Reportes/EstadoCuentaCliente/Listar', true, NULL);
INSERT INTO public.menus VALUES (64, 15, NULL, 'Crear Estado de cuenta Cliente', '/Reportes/EstadoCuentaCliente/Crear', true, NULL);
INSERT INTO public.menus VALUES (65, 15, NULL, 'Actualizar Estado de cuenta Cliente', '/Reportes/EstadoCuentaCliente/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (66, 15, NULL, 'Eliminar Estado de cuenta Cliente', '/Reportes/EstadoCuentaCliente/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (67, 16, NULL, 'Listar Recaudación y Morosida', '/Reportes/RecaudacionMorosida/Listar', true, NULL);
INSERT INTO public.menus VALUES (68, 16, NULL, 'Crear Recaudación y Morosida', '/Reportes/RecaudacionMorosida/Crear', true, NULL);
INSERT INTO public.menus VALUES (69, 16, NULL, 'Actualizar Recaudación y Morosida', '/Reportes/RecaudacionMorosida/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (70, 16, NULL, 'Eliminar Recaudación y Morosida', '/Reportes/RecaudacionMorosida/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (71, 17, NULL, 'Listar ConsumoPorZonas', '/Reportes/ConsumoZonas/Listar', true, NULL);
INSERT INTO public.menus VALUES (72, 17, NULL, 'Crear ConsumoPorZonas', '/Reportes/ConsumoZonas/Crear', true, NULL);
INSERT INTO public.menus VALUES (73, 17, NULL, 'Actualizar ConsumoPorZonas', '/Reportes/ConsumoZonas/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (74, 17, NULL, 'Eliminar ConsumoPorZonas', '/Reportes/ConsumoZonas/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (75, 18, NULL, 'Listar DashboardKpi', '/Reportes/DashboardKpi/Listar', true, NULL);
INSERT INTO public.menus VALUES (76, 18, NULL, 'Crear DashboardKpi', '/Reportes/DashboardKpi/Crear', true, NULL);
INSERT INTO public.menus VALUES (77, 18, NULL, 'Actualizar DashboardKpi', '/Reportes/DashboardKpi/Actualizar', true, NULL);
INSERT INTO public.menus VALUES (78, 18, NULL, 'Eliminar DashboardKpi', '/Reportes/DashboardKpi/Eliminar', true, NULL);
INSERT INTO public.menus VALUES (79, NULL, 'admin_panel_settings', 'Administracion Sistema', '/admin', true, NULL);
INSERT INTO public.menus VALUES (80, 79, 'group', 'Usuarios y Roles', '/admin/users', true, NULL);
INSERT INTO public.menus VALUES (81, 80, NULL, 'Lectura Usuarios', '/admin/users', true, NULL);
INSERT INTO public.menus VALUES (82, 80, NULL, 'Escritura Usuarios', '/admin/users', true, NULL);
INSERT INTO public.menus VALUES (83, 80, NULL, 'Actualizacion Usuarios', '/admin/users', true, NULL);
INSERT INTO public.menus VALUES (84, 80, NULL, 'Eliminacion Usuarios', '/admin/users', true, NULL);


--
-- Data for Name: notas_credito; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: notas_credito_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: notas_debito; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: novedad_operativa; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: parametro_tasa_interes; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: periodos; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.periodos VALUES (1, '2025-04', '2025-04-01 00:00:00', '2025-04-28 00:00:00', '2025-04-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.635', '2026-05-01 22:35:30.635');
INSERT INTO public.periodos VALUES (2, '2025-05', '2025-05-01 00:00:00', '2025-05-28 00:00:00', '2025-05-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.655', '2026-05-01 22:35:30.655');
INSERT INTO public.periodos VALUES (3, '2025-06', '2025-06-01 00:00:00', '2025-06-28 00:00:00', '2025-06-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.657', '2026-05-01 22:35:30.657');
INSERT INTO public.periodos VALUES (4, '2025-07', '2025-07-01 00:00:00', '2025-07-28 00:00:00', '2025-07-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.659', '2026-05-01 22:35:30.659');
INSERT INTO public.periodos VALUES (5, '2025-08', '2025-08-01 00:00:00', '2025-08-28 00:00:00', '2025-08-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.661', '2026-05-01 22:35:30.661');
INSERT INTO public.periodos VALUES (6, '2025-09', '2025-09-01 00:00:00', '2025-09-28 00:00:00', '2025-09-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.664', '2026-05-01 22:35:30.664');
INSERT INTO public.periodos VALUES (7, '2025-10', '2025-10-01 00:00:00', '2025-10-28 00:00:00', '2025-10-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.666', '2026-05-01 22:35:30.666');
INSERT INTO public.periodos VALUES (8, '2025-11', '2025-11-01 00:00:00', '2025-11-28 00:00:00', '2025-11-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.668', '2026-05-01 22:35:30.668');
INSERT INTO public.periodos VALUES (9, '2025-12', '2025-12-01 00:00:00', '2025-12-28 00:00:00', '2025-12-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.67', '2026-05-01 22:35:30.67');
INSERT INTO public.periodos VALUES (10, '2026-01', '2026-01-01 00:00:00', '2026-01-28 00:00:00', '2026-01-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.673', '2026-05-01 22:35:30.673');
INSERT INTO public.periodos VALUES (11, '2026-02', '2026-02-01 00:00:00', '2026-02-28 00:00:00', '2026-03-02 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.675', '2026-05-01 22:35:30.675');
INSERT INTO public.periodos VALUES (12, '2026-03', '2026-03-01 00:00:00', '2026-03-28 00:00:00', '2026-03-30 00:00:00', 'ABIERTO', '2026-05-01 22:35:30.677', '2026-05-01 22:35:30.677');


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.permisos VALUES (1, 'clientes', 'read', NULL);
INSERT INTO public.permisos VALUES (2, 'clientes', 'create', NULL);
INSERT INTO public.permisos VALUES (3, 'clientes', 'update', NULL);
INSERT INTO public.permisos VALUES (4, 'clientes', 'delete', NULL);
INSERT INTO public.permisos VALUES (5, 'contratos', 'read', NULL);
INSERT INTO public.permisos VALUES (6, 'contratos', 'create', NULL);
INSERT INTO public.permisos VALUES (7, 'contratos', 'update', NULL);
INSERT INTO public.permisos VALUES (8, 'contratos', 'delete', NULL);
INSERT INTO public.permisos VALUES (9, 'medidores', 'read', NULL);
INSERT INTO public.permisos VALUES (10, 'medidores', 'create', NULL);
INSERT INTO public.permisos VALUES (11, 'medidores', 'update', NULL);
INSERT INTO public.permisos VALUES (12, 'medidores', 'delete', NULL);
INSERT INTO public.permisos VALUES (13, 'tarifas', 'read', NULL);
INSERT INTO public.permisos VALUES (14, 'tarifas', 'create', NULL);
INSERT INTO public.permisos VALUES (15, 'tarifas', 'update', NULL);
INSERT INTO public.permisos VALUES (16, 'tarifas', 'delete', NULL);
INSERT INTO public.permisos VALUES (17, 'lecturas', 'read', NULL);
INSERT INTO public.permisos VALUES (18, 'lecturas', 'create', NULL);
INSERT INTO public.permisos VALUES (19, 'lecturas', 'update', NULL);
INSERT INTO public.permisos VALUES (20, 'lecturas', 'delete', NULL);
INSERT INTO public.permisos VALUES (21, 'convenios', 'read', NULL);
INSERT INTO public.permisos VALUES (22, 'convenios', 'create', NULL);
INSERT INTO public.permisos VALUES (23, 'convenios', 'update', NULL);
INSERT INTO public.permisos VALUES (24, 'convenios', 'delete', NULL);
INSERT INTO public.permisos VALUES (25, 'planillas', 'read', NULL);
INSERT INTO public.permisos VALUES (26, 'planillas', 'create', NULL);
INSERT INTO public.permisos VALUES (27, 'planillas', 'update', NULL);
INSERT INTO public.permisos VALUES (28, 'planillas', 'delete', NULL);
INSERT INTO public.permisos VALUES (29, 'facturacion_electronica', 'read', NULL);
INSERT INTO public.permisos VALUES (30, 'facturacion_electronica', 'create', NULL);
INSERT INTO public.permisos VALUES (31, 'facturacion_electronica', 'update', NULL);
INSERT INTO public.permisos VALUES (32, 'facturacion_electronica', 'delete', NULL);
INSERT INTO public.permisos VALUES (33, 'recaudacion', 'read', NULL);
INSERT INTO public.permisos VALUES (34, 'recaudacion', 'create', NULL);
INSERT INTO public.permisos VALUES (35, 'recaudacion', 'update', NULL);
INSERT INTO public.permisos VALUES (36, 'recaudacion', 'delete', NULL);
INSERT INTO public.permisos VALUES (37, 'notas_credito', 'read', NULL);
INSERT INTO public.permisos VALUES (38, 'notas_credito', 'create', NULL);
INSERT INTO public.permisos VALUES (39, 'notas_credito', 'update', NULL);
INSERT INTO public.permisos VALUES (40, 'notas_credito', 'delete', NULL);
INSERT INTO public.permisos VALUES (41, 'envio_facturas', 'read', NULL);
INSERT INTO public.permisos VALUES (42, 'envio_facturas', 'create', NULL);
INSERT INTO public.permisos VALUES (43, 'envio_facturas', 'update', NULL);
INSERT INTO public.permisos VALUES (44, 'envio_facturas', 'delete', NULL);
INSERT INTO public.permisos VALUES (45, 'estado_cuenta', 'read', NULL);
INSERT INTO public.permisos VALUES (46, 'estado_cuenta', 'create', NULL);
INSERT INTO public.permisos VALUES (47, 'estado_cuenta', 'update', NULL);
INSERT INTO public.permisos VALUES (48, 'estado_cuenta', 'delete', NULL);
INSERT INTO public.permisos VALUES (49, 'recaudacion_morosidad', 'read', NULL);
INSERT INTO public.permisos VALUES (50, 'recaudacion_morosidad', 'create', NULL);
INSERT INTO public.permisos VALUES (51, 'recaudacion_morosidad', 'update', NULL);
INSERT INTO public.permisos VALUES (52, 'recaudacion_morosidad', 'delete', NULL);
INSERT INTO public.permisos VALUES (53, 'consumo_zonas', 'read', NULL);
INSERT INTO public.permisos VALUES (54, 'consumo_zonas', 'create', NULL);
INSERT INTO public.permisos VALUES (55, 'consumo_zonas', 'update', NULL);
INSERT INTO public.permisos VALUES (56, 'consumo_zonas', 'delete', NULL);
INSERT INTO public.permisos VALUES (57, 'dashboard', 'read', NULL);
INSERT INTO public.permisos VALUES (58, 'dashboard', 'create', NULL);
INSERT INTO public.permisos VALUES (59, 'dashboard', 'update', NULL);
INSERT INTO public.permisos VALUES (60, 'dashboard', 'delete', NULL);
INSERT INTO public.permisos VALUES (61, 'users', 'create', NULL);
INSERT INTO public.permisos VALUES (62, 'users', 'read', NULL);
INSERT INTO public.permisos VALUES (63, 'users', 'update', NULL);
INSERT INTO public.permisos VALUES (64, 'users', 'delete', NULL);
INSERT INTO public.permisos VALUES (65, 'roles', 'create', NULL);
INSERT INTO public.permisos VALUES (66, 'roles', 'read', NULL);
INSERT INTO public.permisos VALUES (67, 'roles', 'update', NULL);
INSERT INTO public.permisos VALUES (68, 'roles', 'delete', NULL);
INSERT INTO public.permisos VALUES (69, 'permissions', 'create', NULL);
INSERT INTO public.permisos VALUES (70, 'permissions', 'read', NULL);
INSERT INTO public.permisos VALUES (71, 'permissions', 'update', NULL);
INSERT INTO public.permisos VALUES (72, 'permissions', 'delete', NULL);


--
-- Data for Name: prefactura_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.prefactura_detalle VALUES (1, 1, 1, 'Consumo de agua potable m3', 1, 5, 5, 0, 2.5, NULL, '2026-05-01 22:35:32.021', '2026-05-01 22:35:32.021', 2.5, NULL, NULL, 0);
INSERT INTO public.prefactura_detalle VALUES (2, 1, 2, 'Cargo Fijo Mensual', 1, 5, 5, 0, 5, NULL, '2026-05-01 22:35:32.029', '2026-05-01 22:35:32.029', 0, NULL, NULL, 0);
INSERT INTO public.prefactura_detalle VALUES (3, 1, 4, 'Tasa Seguridad Ciudadana', 1, 5, 5, 0, 5, NULL, '2026-05-01 22:35:32.032', '2026-05-01 22:35:32.032', 0, NULL, NULL, 0);


--
-- Data for Name: prefacturas; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.prefacturas VALUES (1, 'cf206c4a-4c13-4c04-97af-3ffc736e636b', 1, NULL, 1, 1, NULL, NULL, NULL, 15, 0, 2.5, 12.5, 0, 0, 0, 12.5, 0, 'GENERADA', NULL, NULL, NULL, NULL, NULL, '2026-05-01 22:35:32.016', '2026-05-01 22:35:32.016', NULL, 0, 'Olón', 'juan@test.com', '1234567890', 'Juan Perez', NULL, NULL, NULL, NULL, 0);


--
-- Data for Name: preferencias_sistema; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: puntos_emision; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.puntos_emision VALUES (1, 1, '001', 'VENTANILLA 1', 1, '2026-05-01 22:35:29.746', '2026-05-01 22:35:29.746');


--
-- Data for Name: retencion_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: retenciones; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: rol_permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.rol_permisos VALUES (1, 1, 1, NULL);
INSERT INTO public.rol_permisos VALUES (2, 1, 2, NULL);
INSERT INTO public.rol_permisos VALUES (3, 1, 3, NULL);
INSERT INTO public.rol_permisos VALUES (4, 1, 4, NULL);
INSERT INTO public.rol_permisos VALUES (5, 1, 5, NULL);
INSERT INTO public.rol_permisos VALUES (6, 1, 6, NULL);
INSERT INTO public.rol_permisos VALUES (7, 1, 7, NULL);
INSERT INTO public.rol_permisos VALUES (8, 1, 8, NULL);
INSERT INTO public.rol_permisos VALUES (9, 1, 9, NULL);
INSERT INTO public.rol_permisos VALUES (10, 1, 10, NULL);
INSERT INTO public.rol_permisos VALUES (11, 1, 11, NULL);
INSERT INTO public.rol_permisos VALUES (12, 1, 12, NULL);
INSERT INTO public.rol_permisos VALUES (13, 1, 13, NULL);
INSERT INTO public.rol_permisos VALUES (14, 1, 14, NULL);
INSERT INTO public.rol_permisos VALUES (15, 1, 15, NULL);
INSERT INTO public.rol_permisos VALUES (16, 1, 16, NULL);
INSERT INTO public.rol_permisos VALUES (17, 1, 17, NULL);
INSERT INTO public.rol_permisos VALUES (18, 1, 18, NULL);
INSERT INTO public.rol_permisos VALUES (19, 1, 19, NULL);
INSERT INTO public.rol_permisos VALUES (20, 1, 20, NULL);
INSERT INTO public.rol_permisos VALUES (21, 1, 21, NULL);
INSERT INTO public.rol_permisos VALUES (22, 1, 22, NULL);
INSERT INTO public.rol_permisos VALUES (23, 1, 23, NULL);
INSERT INTO public.rol_permisos VALUES (24, 1, 24, NULL);
INSERT INTO public.rol_permisos VALUES (25, 1, 25, NULL);
INSERT INTO public.rol_permisos VALUES (26, 1, 26, NULL);
INSERT INTO public.rol_permisos VALUES (27, 1, 27, NULL);
INSERT INTO public.rol_permisos VALUES (28, 1, 28, NULL);
INSERT INTO public.rol_permisos VALUES (29, 1, 29, NULL);
INSERT INTO public.rol_permisos VALUES (30, 1, 30, NULL);
INSERT INTO public.rol_permisos VALUES (31, 1, 31, NULL);
INSERT INTO public.rol_permisos VALUES (32, 1, 32, NULL);
INSERT INTO public.rol_permisos VALUES (33, 1, 33, NULL);
INSERT INTO public.rol_permisos VALUES (34, 1, 34, NULL);
INSERT INTO public.rol_permisos VALUES (35, 1, 35, NULL);
INSERT INTO public.rol_permisos VALUES (36, 1, 36, NULL);
INSERT INTO public.rol_permisos VALUES (37, 1, 37, NULL);
INSERT INTO public.rol_permisos VALUES (38, 1, 38, NULL);
INSERT INTO public.rol_permisos VALUES (39, 1, 39, NULL);
INSERT INTO public.rol_permisos VALUES (40, 1, 40, NULL);
INSERT INTO public.rol_permisos VALUES (41, 1, 41, NULL);
INSERT INTO public.rol_permisos VALUES (42, 1, 42, NULL);
INSERT INTO public.rol_permisos VALUES (43, 1, 43, NULL);
INSERT INTO public.rol_permisos VALUES (44, 1, 44, NULL);
INSERT INTO public.rol_permisos VALUES (45, 1, 45, NULL);
INSERT INTO public.rol_permisos VALUES (46, 1, 46, NULL);
INSERT INTO public.rol_permisos VALUES (47, 1, 47, NULL);
INSERT INTO public.rol_permisos VALUES (48, 1, 48, NULL);
INSERT INTO public.rol_permisos VALUES (49, 1, 49, NULL);
INSERT INTO public.rol_permisos VALUES (50, 1, 50, NULL);
INSERT INTO public.rol_permisos VALUES (51, 1, 51, NULL);
INSERT INTO public.rol_permisos VALUES (52, 1, 52, NULL);
INSERT INTO public.rol_permisos VALUES (53, 1, 53, NULL);
INSERT INTO public.rol_permisos VALUES (54, 1, 54, NULL);
INSERT INTO public.rol_permisos VALUES (55, 1, 55, NULL);
INSERT INTO public.rol_permisos VALUES (56, 1, 56, NULL);
INSERT INTO public.rol_permisos VALUES (57, 1, 57, NULL);
INSERT INTO public.rol_permisos VALUES (58, 1, 58, NULL);
INSERT INTO public.rol_permisos VALUES (59, 1, 59, NULL);
INSERT INTO public.rol_permisos VALUES (60, 1, 60, NULL);
INSERT INTO public.rol_permisos VALUES (61, 1, 61, NULL);
INSERT INTO public.rol_permisos VALUES (62, 1, 62, NULL);
INSERT INTO public.rol_permisos VALUES (63, 1, 63, NULL);
INSERT INTO public.rol_permisos VALUES (64, 1, 64, NULL);
INSERT INTO public.rol_permisos VALUES (65, 1, 65, NULL);
INSERT INTO public.rol_permisos VALUES (66, 1, 66, NULL);
INSERT INTO public.rol_permisos VALUES (67, 1, 67, NULL);
INSERT INTO public.rol_permisos VALUES (68, 1, 68, NULL);
INSERT INTO public.rol_permisos VALUES (69, 1, 69, NULL);
INSERT INTO public.rol_permisos VALUES (70, 1, 70, NULL);
INSERT INTO public.rol_permisos VALUES (71, 1, 71, NULL);
INSERT INTO public.rol_permisos VALUES (72, 1, 72, NULL);
INSERT INTO public.rol_permisos VALUES (73, 2, 1, NULL);
INSERT INTO public.rol_permisos VALUES (74, 2, 2, NULL);
INSERT INTO public.rol_permisos VALUES (75, 2, 3, NULL);
INSERT INTO public.rol_permisos VALUES (76, 2, 4, NULL);
INSERT INTO public.rol_permisos VALUES (77, 2, 5, NULL);
INSERT INTO public.rol_permisos VALUES (78, 2, 6, NULL);
INSERT INTO public.rol_permisos VALUES (79, 2, 7, NULL);
INSERT INTO public.rol_permisos VALUES (80, 2, 8, NULL);
INSERT INTO public.rol_permisos VALUES (81, 2, 9, NULL);
INSERT INTO public.rol_permisos VALUES (82, 2, 10, NULL);
INSERT INTO public.rol_permisos VALUES (83, 2, 11, NULL);
INSERT INTO public.rol_permisos VALUES (84, 2, 12, NULL);
INSERT INTO public.rol_permisos VALUES (85, 2, 13, NULL);
INSERT INTO public.rol_permisos VALUES (86, 2, 14, NULL);
INSERT INTO public.rol_permisos VALUES (87, 2, 15, NULL);
INSERT INTO public.rol_permisos VALUES (88, 2, 16, NULL);
INSERT INTO public.rol_permisos VALUES (89, 2, 17, NULL);
INSERT INTO public.rol_permisos VALUES (90, 2, 18, NULL);
INSERT INTO public.rol_permisos VALUES (91, 2, 19, NULL);
INSERT INTO public.rol_permisos VALUES (92, 2, 20, NULL);
INSERT INTO public.rol_permisos VALUES (93, 2, 21, NULL);
INSERT INTO public.rol_permisos VALUES (94, 2, 22, NULL);
INSERT INTO public.rol_permisos VALUES (95, 2, 23, NULL);
INSERT INTO public.rol_permisos VALUES (96, 2, 24, NULL);
INSERT INTO public.rol_permisos VALUES (97, 3, 25, NULL);
INSERT INTO public.rol_permisos VALUES (98, 3, 26, NULL);
INSERT INTO public.rol_permisos VALUES (99, 3, 27, NULL);
INSERT INTO public.rol_permisos VALUES (100, 3, 28, NULL);
INSERT INTO public.rol_permisos VALUES (101, 3, 29, NULL);
INSERT INTO public.rol_permisos VALUES (102, 3, 30, NULL);
INSERT INTO public.rol_permisos VALUES (103, 3, 31, NULL);
INSERT INTO public.rol_permisos VALUES (104, 3, 32, NULL);
INSERT INTO public.rol_permisos VALUES (105, 3, 33, NULL);
INSERT INTO public.rol_permisos VALUES (106, 3, 34, NULL);
INSERT INTO public.rol_permisos VALUES (107, 3, 35, NULL);
INSERT INTO public.rol_permisos VALUES (108, 3, 36, NULL);
INSERT INTO public.rol_permisos VALUES (109, 3, 37, NULL);
INSERT INTO public.rol_permisos VALUES (110, 3, 38, NULL);
INSERT INTO public.rol_permisos VALUES (111, 3, 39, NULL);
INSERT INTO public.rol_permisos VALUES (112, 3, 40, NULL);
INSERT INTO public.rol_permisos VALUES (113, 3, 41, NULL);
INSERT INTO public.rol_permisos VALUES (114, 3, 42, NULL);
INSERT INTO public.rol_permisos VALUES (115, 3, 43, NULL);
INSERT INTO public.rol_permisos VALUES (116, 3, 44, NULL);
INSERT INTO public.rol_permisos VALUES (117, 4, 45, NULL);
INSERT INTO public.rol_permisos VALUES (118, 4, 49, NULL);
INSERT INTO public.rol_permisos VALUES (119, 4, 53, NULL);
INSERT INTO public.rol_permisos VALUES (120, 4, 57, NULL);
INSERT INTO public.rol_permisos VALUES (121, 5, 1, NULL);
INSERT INTO public.rol_permisos VALUES (122, 5, 2, NULL);
INSERT INTO public.rol_permisos VALUES (123, 5, 3, NULL);
INSERT INTO public.rol_permisos VALUES (124, 5, 5, NULL);
INSERT INTO public.rol_permisos VALUES (125, 5, 6, NULL);
INSERT INTO public.rol_permisos VALUES (126, 5, 7, NULL);
INSERT INTO public.rol_permisos VALUES (127, 5, 9, NULL);
INSERT INTO public.rol_permisos VALUES (128, 5, 10, NULL);
INSERT INTO public.rol_permisos VALUES (129, 5, 11, NULL);
INSERT INTO public.rol_permisos VALUES (130, 5, 17, NULL);
INSERT INTO public.rol_permisos VALUES (131, 5, 18, NULL);
INSERT INTO public.rol_permisos VALUES (132, 5, 19, NULL);
INSERT INTO public.rol_permisos VALUES (133, 5, 21, NULL);
INSERT INTO public.rol_permisos VALUES (134, 5, 22, NULL);
INSERT INTO public.rol_permisos VALUES (135, 5, 23, NULL);


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.roles VALUES (1, 'admin', NULL);
INSERT INTO public.roles VALUES (2, 'secretaria', NULL);
INSERT INTO public.roles VALUES (3, 'recaudacion', NULL);
INSERT INTO public.roles VALUES (4, 'presidencia', NULL);
INSERT INTO public.roles VALUES (5, 'operadores', NULL);
INSERT INTO public.roles VALUES (6, 'contabilidad', NULL);
INSERT INTO public.roles VALUES (7, 'user', NULL);


--
-- Data for Name: rubros; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.rubros VALUES (1, '001', 'Consumo Agua', 'Consumo de agua potable m3', 0.5, 'VARIABLE', 2, true, '2026-05-01 22:35:31.992', '2026-05-01 22:35:31.992', NULL);
INSERT INTO public.rubros VALUES (2, '002', 'Cargo Fijo', 'Mantenimiento básico de conexión', 5, 'FIJO', 2, true, '2026-05-01 22:35:31.992', '2026-05-01 22:35:31.992', NULL);
INSERT INTO public.rubros VALUES (3, '003', 'Interés Mora', 'Interés por falta de pago puntual', 0.1, 'MULTA', 1, true, '2026-05-01 22:35:31.992', '2026-05-01 22:35:31.992', NULL);
INSERT INTO public.rubros VALUES (4, '004', 'Tasa Seguridad Olón', 'Tasa de seguridad comunitaria (Solo Olón)', 2, 'FIJO', 1, true, '2026-05-01 22:35:31.992', '2026-05-01 22:35:31.992', NULL);
INSERT INTO public.rubros VALUES (5, '005', 'Instalación Medidor', 'Costo de nueva acometida e instalación', 150, 'SERVICIO', 2, true, '2026-05-01 22:35:31.992', '2026-05-01 22:35:31.992', NULL);


--
-- Data for Name: saldo_favor_cliente; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.sectores VALUES (1, 1, 'SEC-OLON-NORTE', 'Sector Norte Olón', '2026-05-01 22:35:29.887', '2026-05-01 22:35:29.887', NULL);
INSERT INTO public.sectores VALUES (2, 1, 'SEC-OLON-SUR', 'Sector Sur Olón', '2026-05-01 22:35:29.89', '2026-05-01 22:35:29.89', NULL);
INSERT INTO public.sectores VALUES (3, 1, 'SEC-OLON-CENTRO', 'Sector Centro Olón', '2026-05-01 22:35:29.893', '2026-05-01 22:35:29.893', NULL);
INSERT INTO public.sectores VALUES (4, 1, 'SEC-OLON-PLAYA', 'Sector Playa Olón', '2026-05-01 22:35:29.896', '2026-05-01 22:35:29.896', NULL);


--
-- Data for Name: sesiones; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.sesiones VALUES ('e3fcec2b-596e-4615-939b-c2feee6034a8', 1, '$2b$10$izle9UgkZ55hcjiUF7zmneeso2VlQh3Y901gC/1TASMzGweNX9XSm', '::1', 'Apidog/1.0.0 (https://apidog.com)', false, '2026-05-09 00:56:46.5', '2026-05-02 00:56:46.515');
INSERT INTO public.sesiones VALUES ('5c5d14ff-f963-4130-8f03-53d1df7c9cd0', 1, '$2b$10$RzXLOni0.hYkm8oeF/kQReJznhVq91u2C58eGZwgOma7ZHkmFAB9u', '::1', 'Apidog/1.0.0 (https://apidog.com)', true, '2026-05-09 01:01:27.419', '2026-05-02 01:01:27.434');
INSERT INTO public.sesiones VALUES ('30167f46-2eca-432b-8e78-a765dc6dfd64', 1, '$2b$10$ir1l8gxlj5b9SXxt51XG0uVCgLgpZkExbD2cIGy/nSnCH2ZdmzP7y', '::1', 'Apidog/1.0.0 (https://apidog.com)', false, '2026-05-09 01:04:44.202', '2026-05-02 01:04:44.205');
INSERT INTO public.sesiones VALUES ('78cbe186-b4ef-4c76-b450-95867e6c28db', 1, '$2b$10$f2TuXu6WW.GXkN6YfPXW7O/eRZmXeAjskpgLXqFfLUGQoznL/5EOW', '::1', 'Apidog/1.0.0 (https://apidog.com)', false, '2026-05-09 01:15:21.153', '2026-05-02 01:15:02.896');
INSERT INTO public.sesiones VALUES ('48488131-981a-46ac-84ad-08205009e8df', 1, '$2b$10$ALApSnjsSLt7ZUyvVWxH8OAkkk10YQUCYoQTUm7cwXrIYI6PFlUmm', '::1', 'Apidog/1.0.0 (https://apidog.com)', false, '2026-05-09 01:16:51.916', '2026-05-02 01:16:51.918');
INSERT INTO public.sesiones VALUES ('cce1a234-0947-4b66-aaa5-a114a452ebfb', 1, '$2b$10$FUGcB91m9J0k/m2ot0PWY.vwCUZllmNHewvE7RkORwuk0PfseiFBe', '::1', 'Apidog/1.0.0 (https://apidog.com)', false, '2026-05-09 03:11:56.6', '2026-05-02 03:11:56.616');
INSERT INTO public.sesiones VALUES ('8afc7f07-f6dc-4a46-ad8b-ccc802a7f27f', 1, '$2b$10$hEs8Cf.4xsu6EDTeHmWepOQhoa2NrV/SDIhYKL3JMT5qvPNgdF4SW', '::1', 'Apidog/1.0.0 (https://apidog.com)', false, '2026-05-09 03:12:52.097', '2026-05-02 03:12:52.099');


--
-- Data for Name: sri_forma_pago; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.sri_forma_pago VALUES (1, '01', 'EFECTIVO (SIN UTILIZACION DEL SISTEMA FINANCIERO)', true);
INSERT INTO public.sri_forma_pago VALUES (16, '16', 'TARJETA DE DEBITO', true);
INSERT INTO public.sri_forma_pago VALUES (19, '19', 'TARJETA DE CREDITO', true);
INSERT INTO public.sri_forma_pago VALUES (20, '20', 'TRANSFERENCIA/OTROS (CON UTILIZACION DEL SISTEMA FINANCIERO)', true);


--
-- Data for Name: sri_impuesto; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.sri_impuesto VALUES (1, '2', '0', 'IVA 0%', 0, true, '2026-05-01 22:35:29.757', '2026-05-01 22:35:29.757');
INSERT INTO public.sri_impuesto VALUES (2, '2', '2', 'IVA 12%', 12, true, '2026-05-01 22:35:29.76', '2026-05-01 22:35:29.76');
INSERT INTO public.sri_impuesto VALUES (4, '2', '4', 'IVA 15%', 15, true, '2026-05-01 22:35:29.762', '2026-05-01 22:35:29.762');
INSERT INTO public.sri_impuesto VALUES (5, '2', '5', 'IVA 5%', 5, true, '2026-05-01 22:35:29.764', '2026-05-01 22:35:29.764');


--
-- Data for Name: sri_tipo_comprobante; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.sri_tipo_comprobante VALUES (1, '01', 'FACTURA', NULL, true);
INSERT INTO public.sri_tipo_comprobante VALUES (4, '04', 'NOTA DE CRÉDITO', NULL, true);
INSERT INTO public.sri_tipo_comprobante VALUES (5, '05', 'NOTA DE DÉBITO', NULL, true);
INSERT INTO public.sri_tipo_comprobante VALUES (6, '06', 'GUÍA DE REMISIÓN', NULL, true);
INSERT INTO public.sri_tipo_comprobante VALUES (7, '07', 'COMPROBANTE DE RETENCIÓN', NULL, true);


--
-- Data for Name: usuario_permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--



--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: appuser
--

INSERT INTO public.usuarios VALUES (1, 'admin@jasrapo.com', '$2b$10$tf82jGrTu527kgDq.gcl/ezLsQ9n9jsJvQH5xIdzys2CpZ32SxYSq', 1, NULL);
INSERT INTO public.usuarios VALUES (2, 'secretaria@jasrapo.com', '$2b$10$T4wuDP7HxEUa9TrDSOpEiuUxfS9yo/NotrQM6jd1Vi6ajsi92IQcu', 2, NULL);
INSERT INTO public.usuarios VALUES (3, 'recaudacion@jasrapo.com', '$2b$10$GSkAJcHSmxkJ5q9q.xoUUO7fAzqYXfCeTmFkp6dPSUOZeYwsT5Fam', 3, NULL);
INSERT INTO public.usuarios VALUES (4, 'presidencia@jasrapo.com', '$2b$10$U/mbmSY5B6.7Lkj6kKlWmOlR8U4vEjQWHj9WP1deuE8gcRM5AubfW', 4, NULL);
INSERT INTO public.usuarios VALUES (5, 'operadores@jasrapo.com', '$2b$10$gbf7IaLBmy8abLej9/uQ3eZF3WeSdwkrgD0qXtImUZk0WCW8nClc2', 5, NULL);
INSERT INTO public.usuarios VALUES (6, 'contabilidad@jasrapo.com', '$2b$10$MMoNlkCxTAmVHbx2PJWaK.fXofvm5PZ/dp6fZopzF0N0qANHUvYp2', 6, NULL);
INSERT INTO public.usuarios VALUES (7, 'user@jasrapo.com', '$2b$10$0kWK/vuOm/ivqwy8IPzW.u.wLFh7X51qYnOFdJJ5j105gtspiOZdm', 7, NULL);


--
-- Name: caja_arqueo_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.caja_arqueo_detalle_id_seq', 1, true);


--
-- Name: caja_sesion_caja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.caja_sesion_caja_id_seq', 1, true);


--
-- Name: catalogo_descuento_catalogo_descuento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.catalogo_descuento_catalogo_descuento_id_seq', 4, true);


--
-- Name: categoria_tarifa_categoria_tarifa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.categoria_tarifa_categoria_tarifa_id_seq', 5, true);


--
-- Name: clientes_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.clientes_cliente_id_seq', 103, true);


--
-- Name: comunidades_comunidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.comunidades_comunidad_id_seq', 5, true);


--
-- Name: contratos_contrato_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.contratos_contrato_id_seq', 50, true);


--
-- Name: convenios_convenio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.convenios_convenio_id_seq', 1, true);


--
-- Name: cuota_convenio_cuota_convenio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.cuota_convenio_cuota_convenio_id_seq', 1, true);


--
-- Name: descuento_detalle_descuento_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.descuento_detalle_descuento_detalle_id_seq', 1, true);


--
-- Name: detalle_pago_detalle_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.detalle_pago_detalle_pago_id_seq', 1, true);


--
-- Name: empresa_empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.empresa_empresa_id_seq', 1, true);


--
-- Name: establecimientos_establecimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.establecimientos_establecimiento_id_seq', 1, true);


--
-- Name: facturas_factura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.facturas_factura_id_seq', 1, true);


--
-- Name: historial_medidores_historial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.historial_medidores_historial_id_seq', 1, true);


--
-- Name: lecturas_lectura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.lecturas_lectura_id_seq', 600, true);


--
-- Name: lote_facturacion_lote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.lote_facturacion_lote_id_seq', 1, true);


--
-- Name: medidores_medidor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.medidores_medidor_id_seq', 1, true);


--
-- Name: menu_permisos_menu_permiso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.menu_permisos_menu_permiso_id_seq', 64, true);


--
-- Name: menus_menu_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.menus_menu_id_seq', 84, true);


--
-- Name: notas_credito_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.notas_credito_detalle_id_seq', 1, true);


--
-- Name: notas_credito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.notas_credito_id_seq', 1, true);


--
-- Name: notas_debito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.notas_debito_id_seq', 1, true);


--
-- Name: novedad_operativa_novedad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.novedad_operativa_novedad_id_seq', 1, true);


--
-- Name: pagos_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.pagos_pago_id_seq', 1, true);


--
-- Name: parametro_tasa_interes_parametro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.parametro_tasa_interes_parametro_id_seq', 1, true);


--
-- Name: perfiles_perfil_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.perfiles_perfil_id_seq', 1, true);


--
-- Name: periodos_periodo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.periodos_periodo_id_seq', 12, true);


--
-- Name: permisos_permiso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.permisos_permiso_id_seq', 72, true);


--
-- Name: prefactura_detalle_prefactura_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.prefactura_detalle_prefactura_detalle_id_seq', 3, true);


--
-- Name: prefacturas_prefactura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.prefacturas_prefactura_id_seq', 1, true);


--
-- Name: preferencias_sistema_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.preferencias_sistema_id_seq', 1, true);


--
-- Name: puntos_emision_punto_emision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.puntos_emision_punto_emision_id_seq', 1, true);


--
-- Name: retencion_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.retencion_detalle_id_seq', 1, true);


--
-- Name: retenciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.retenciones_id_seq', 1, true);


--
-- Name: rol_permisos_rol_permiso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.rol_permisos_rol_permiso_id_seq', 135, true);


--
-- Name: roles_rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.roles_rol_id_seq', 7, true);


--
-- Name: rubros_rubro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.rubros_rubro_id_seq', 5, true);


--
-- Name: saldo_favor_cliente_saldo_favor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.saldo_favor_cliente_saldo_favor_id_seq', 1, true);


--
-- Name: sectores_sector_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.sectores_sector_id_seq', 4, true);


--
-- Name: sri_forma_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.sri_forma_pago_id_seq', 20, true);


--
-- Name: sri_impuesto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.sri_impuesto_id_seq', 5, true);


--
-- Name: sri_tipo_comprobante_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.sri_tipo_comprobante_id_seq', 7, true);


--
-- Name: usuario_permisos_id_usuario_permiso_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.usuario_permisos_id_usuario_permiso_seq', 1, true);


--
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.usuarios_usuario_id_seq', 7, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: caja_arqueo_detalle caja_arqueo_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.caja_arqueo_detalle
    ADD CONSTRAINT caja_arqueo_detalle_pkey PRIMARY KEY (id);


--
-- Name: caja_sesion caja_sesion_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.caja_sesion
    ADD CONSTRAINT caja_sesion_pkey PRIMARY KEY (caja_id);


--
-- Name: catalogo_descuento catalogo_descuento_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.catalogo_descuento
    ADD CONSTRAINT catalogo_descuento_pkey PRIMARY KEY (catalogo_descuento_id);


--
-- Name: categoria_tarifa categoria_tarifa_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.categoria_tarifa
    ADD CONSTRAINT categoria_tarifa_pkey PRIMARY KEY (categoria_tarifa_id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (cliente_id);


--
-- Name: comunidades comunidades_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.comunidades
    ADD CONSTRAINT comunidades_pkey PRIMARY KEY (comunidad_id);


--
-- Name: contratos contratos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_pkey PRIMARY KEY (contrato_id);


--
-- Name: convenios convenios_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.convenios
    ADD CONSTRAINT convenios_pkey PRIMARY KEY (convenio_id);


--
-- Name: cuota_convenio cuota_convenio_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.cuota_convenio
    ADD CONSTRAINT cuota_convenio_pkey PRIMARY KEY (cuota_convenio_id);


--
-- Name: descuento_detalle descuento_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.descuento_detalle
    ADD CONSTRAINT descuento_detalle_pkey PRIMARY KEY (descuento_detalle_id);


--
-- Name: detalle_pago detalle_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.detalle_pago
    ADD CONSTRAINT detalle_pago_pkey PRIMARY KEY (detalle_pago_id);


--
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (empresa_id);


--
-- Name: establecimientos establecimientos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.establecimientos
    ADD CONSTRAINT establecimientos_pkey PRIMARY KEY (establecimiento_id);


--
-- Name: facturas facturas_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_pkey PRIMARY KEY (factura_id);


--
-- Name: historial_medidores historial_medidores_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.historial_medidores
    ADD CONSTRAINT historial_medidores_pkey PRIMARY KEY (historial_id);


--
-- Name: lecturas lecturas_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lecturas
    ADD CONSTRAINT lecturas_pkey PRIMARY KEY (lectura_id);


--
-- Name: lote_facturacion lote_facturacion_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote_facturacion
    ADD CONSTRAINT lote_facturacion_pkey PRIMARY KEY (lote_id);


--
-- Name: medidores medidores_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.medidores
    ADD CONSTRAINT medidores_pkey PRIMARY KEY (medidor_id);


--
-- Name: menu_permisos menu_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.menu_permisos
    ADD CONSTRAINT menu_permisos_pkey PRIMARY KEY (menu_permiso_id);


--
-- Name: menus menus_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_pkey PRIMARY KEY (menu_id);


--
-- Name: notas_credito_detalle notas_credito_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito_detalle
    ADD CONSTRAINT notas_credito_detalle_pkey PRIMARY KEY (id);


--
-- Name: notas_credito notas_credito_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT notas_credito_pkey PRIMARY KEY (id);


--
-- Name: notas_debito notas_debito_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_debito
    ADD CONSTRAINT notas_debito_pkey PRIMARY KEY (id);


--
-- Name: novedad_operativa novedad_operativa_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.novedad_operativa
    ADD CONSTRAINT novedad_operativa_pkey PRIMARY KEY (novedad_id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (pago_id);


--
-- Name: parametro_tasa_interes parametro_tasa_interes_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.parametro_tasa_interes
    ADD CONSTRAINT parametro_tasa_interes_pkey PRIMARY KEY (parametro_id);


--
-- Name: perfiles perfiles_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_pkey PRIMARY KEY (perfil_id);


--
-- Name: periodos periodos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.periodos
    ADD CONSTRAINT periodos_pkey PRIMARY KEY (periodo_id);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (permiso_id);


--
-- Name: prefactura_detalle prefactura_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefactura_detalle
    ADD CONSTRAINT prefactura_detalle_pkey PRIMARY KEY (prefactura_detalle_id);


--
-- Name: prefacturas prefacturas_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefacturas
    ADD CONSTRAINT prefacturas_pkey PRIMARY KEY (prefactura_id);


--
-- Name: preferencias_sistema preferencias_sistema_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.preferencias_sistema
    ADD CONSTRAINT preferencias_sistema_pkey PRIMARY KEY (id);


--
-- Name: puntos_emision puntos_emision_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.puntos_emision
    ADD CONSTRAINT puntos_emision_pkey PRIMARY KEY (punto_emision_id);


--
-- Name: retencion_detalle retencion_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retencion_detalle
    ADD CONSTRAINT retencion_detalle_pkey PRIMARY KEY (id);


--
-- Name: retenciones retenciones_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retenciones
    ADD CONSTRAINT retenciones_pkey PRIMARY KEY (id);


--
-- Name: rol_permisos rol_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_pkey PRIMARY KEY (rol_permiso_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (rol_id);


--
-- Name: rubros rubros_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.rubros
    ADD CONSTRAINT rubros_pkey PRIMARY KEY (rubro_id);


--
-- Name: saldo_favor_cliente saldo_favor_cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.saldo_favor_cliente
    ADD CONSTRAINT saldo_favor_cliente_pkey PRIMARY KEY (saldo_favor_id);


--
-- Name: sectores sectores_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_pkey PRIMARY KEY (sector_id);


--
-- Name: sesiones sesiones_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_pkey PRIMARY KEY (sesion_id);


--
-- Name: sri_forma_pago sri_forma_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sri_forma_pago
    ADD CONSTRAINT sri_forma_pago_pkey PRIMARY KEY (id);


--
-- Name: sri_impuesto sri_impuesto_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sri_impuesto
    ADD CONSTRAINT sri_impuesto_pkey PRIMARY KEY (id);


--
-- Name: sri_tipo_comprobante sri_tipo_comprobante_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sri_tipo_comprobante
    ADD CONSTRAINT sri_tipo_comprobante_pkey PRIMARY KEY (id);


--
-- Name: usuario_permisos usuario_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.usuario_permisos
    ADD CONSTRAINT usuario_permisos_pkey PRIMARY KEY (id_usuario_permiso);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id);


--
-- Name: caja_arqueo_detalle_caja_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX caja_arqueo_detalle_caja_id_idx ON public.caja_arqueo_detalle USING btree (caja_id);


--
-- Name: caja_sesion_usuario_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX caja_sesion_usuario_id_idx ON public.caja_sesion USING btree (usuario_id);


--
-- Name: clientes_borrado_en_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX clientes_borrado_en_idx ON public.clientes USING btree (borrado_en);


--
-- Name: clientes_identificacion_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX clientes_identificacion_key ON public.clientes USING btree (identificacion);


--
-- Name: clientes_nombres_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX clientes_nombres_idx ON public.clientes USING btree (nombres);


--
-- Name: comunidades_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX comunidades_codigo_key ON public.comunidades USING btree (codigo);


--
-- Name: contratos_categoria_tarifa_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX contratos_categoria_tarifa_id_idx ON public.contratos USING btree (categoria_tarifa_id);


--
-- Name: contratos_cliente_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX contratos_cliente_id_idx ON public.contratos USING btree (cliente_id);


--
-- Name: contratos_comunidad_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX contratos_comunidad_id_idx ON public.contratos USING btree (comunidad_id);


--
-- Name: contratos_numero_guia_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX contratos_numero_guia_key ON public.contratos USING btree (numero_guia);


--
-- Name: contratos_sector_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX contratos_sector_id_idx ON public.contratos USING btree (sector_id);


--
-- Name: convenios_contrato_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX convenios_contrato_id_idx ON public.convenios USING btree (contrato_id);


--
-- Name: cuota_convenio_convenio_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX cuota_convenio_convenio_id_idx ON public.cuota_convenio USING btree (convenio_id);


--
-- Name: descuento_detalle_autorizado_por_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX descuento_detalle_autorizado_por_idx ON public.descuento_detalle USING btree (autorizado_por);


--
-- Name: descuento_detalle_catalogo_descuento_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX descuento_detalle_catalogo_descuento_id_idx ON public.descuento_detalle USING btree (catalogo_descuento_id);


--
-- Name: descuento_detalle_prefactura_detalle_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX descuento_detalle_prefactura_detalle_id_idx ON public.descuento_detalle USING btree (prefactura_detalle_id);


--
-- Name: detalle_pago_cuota_convenio_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX detalle_pago_cuota_convenio_id_idx ON public.detalle_pago USING btree (cuota_convenio_id);


--
-- Name: detalle_pago_factura_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX detalle_pago_factura_id_idx ON public.detalle_pago USING btree (factura_id);


--
-- Name: detalle_pago_forma_pago_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX detalle_pago_forma_pago_id_idx ON public.detalle_pago USING btree (forma_pago_id);


--
-- Name: detalle_pago_nota_debito_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX detalle_pago_nota_debito_id_idx ON public.detalle_pago USING btree (nota_debito_id);


--
-- Name: detalle_pago_pago_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX detalle_pago_pago_id_idx ON public.detalle_pago USING btree (pago_id);


--
-- Name: empresa_ruc_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX empresa_ruc_key ON public.empresa USING btree (ruc);


--
-- Name: establecimientos_empresa_id_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX establecimientos_empresa_id_codigo_key ON public.establecimientos USING btree (empresa_id, codigo);


--
-- Name: facturas_clave_acceso_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX facturas_clave_acceso_key ON public.facturas USING btree (clave_acceso);


--
-- Name: facturas_estado_pago_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX facturas_estado_pago_idx ON public.facturas USING btree (estado_pago);


--
-- Name: facturas_estado_sri_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX facturas_estado_sri_idx ON public.facturas USING btree (estado_sri);


--
-- Name: facturas_fecha_emision_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX facturas_fecha_emision_idx ON public.facturas USING btree (fecha_emision);


--
-- Name: facturas_prefactura_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX facturas_prefactura_id_idx ON public.facturas USING btree (prefactura_id);


--
-- Name: facturas_prefactura_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX facturas_prefactura_id_key ON public.facturas USING btree (prefactura_id);


--
-- Name: facturas_secuencial_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX facturas_secuencial_idx ON public.facturas USING btree (secuencial);


--
-- Name: facturas_tipo_comprobante_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX facturas_tipo_comprobante_id_idx ON public.facturas USING btree (tipo_comprobante_id);


--
-- Name: facturas_tipo_comprobante_id_secuencial_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX facturas_tipo_comprobante_id_secuencial_key ON public.facturas USING btree (tipo_comprobante_id, secuencial);


--
-- Name: facturas_uuid_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX facturas_uuid_key ON public.facturas USING btree (uuid);


--
-- Name: historial_medidores_contrato_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX historial_medidores_contrato_id_idx ON public.historial_medidores USING btree (contrato_id);


--
-- Name: historial_medidores_medidor_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX historial_medidores_medidor_id_idx ON public.historial_medidores USING btree (medidor_id);


--
-- Name: lecturas_contrato_id_fecha_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lecturas_contrato_id_fecha_idx ON public.lecturas USING btree (contrato_id, fecha);


--
-- Name: lecturas_contrato_id_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lecturas_contrato_id_periodo_id_idx ON public.lecturas USING btree (contrato_id, periodo_id);


--
-- Name: lecturas_estado_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lecturas_estado_periodo_id_idx ON public.lecturas USING btree (estado, periodo_id);


--
-- Name: lecturas_fecha_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lecturas_fecha_idx ON public.lecturas USING btree (fecha);


--
-- Name: lecturas_medidor_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lecturas_medidor_id_idx ON public.lecturas USING btree (medidor_id);


--
-- Name: lote_facturacion_comunidad_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lote_facturacion_comunidad_id_idx ON public.lote_facturacion USING btree (comunidad_id);


--
-- Name: lote_facturacion_comunidad_id_periodo_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX lote_facturacion_comunidad_id_periodo_id_key ON public.lote_facturacion USING btree (comunidad_id, periodo_id);


--
-- Name: lote_facturacion_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lote_facturacion_periodo_id_idx ON public.lote_facturacion USING btree (periodo_id);


--
-- Name: medidores_contrato_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX medidores_contrato_id_key ON public.medidores USING btree (contrato_id);


--
-- Name: medidores_serie_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX medidores_serie_key ON public.medidores USING btree (serie);


--
-- Name: menu_permisos_menu_id_permiso_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX menu_permisos_menu_id_permiso_id_key ON public.menu_permisos USING btree (menu_id, permiso_id);


--
-- Name: notas_credito_clave_acceso_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX notas_credito_clave_acceso_key ON public.notas_credito USING btree (clave_acceso);


--
-- Name: notas_credito_factura_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX notas_credito_factura_id_idx ON public.notas_credito USING btree (factura_id);


--
-- Name: notas_credito_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX notas_credito_periodo_id_idx ON public.notas_credito USING btree (periodo_id);


--
-- Name: notas_credito_punto_emision_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX notas_credito_punto_emision_id_idx ON public.notas_credito USING btree (punto_emision_id);


--
-- Name: notas_credito_uuid_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX notas_credito_uuid_key ON public.notas_credito USING btree (uuid);


--
-- Name: notas_debito_clave_acceso_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX notas_debito_clave_acceso_key ON public.notas_debito USING btree (clave_acceso);


--
-- Name: notas_debito_factura_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX notas_debito_factura_id_idx ON public.notas_debito USING btree (factura_id);


--
-- Name: notas_debito_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX notas_debito_periodo_id_idx ON public.notas_debito USING btree (periodo_id);


--
-- Name: notas_debito_punto_emision_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX notas_debito_punto_emision_id_idx ON public.notas_debito USING btree (punto_emision_id);


--
-- Name: notas_debito_uuid_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX notas_debito_uuid_key ON public.notas_debito USING btree (uuid);


--
-- Name: pagos_caja_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX pagos_caja_id_idx ON public.pagos USING btree (caja_id);


--
-- Name: pagos_cliente_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX pagos_cliente_id_idx ON public.pagos USING btree (cliente_id);


--
-- Name: pagos_usuario_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX pagos_usuario_id_idx ON public.pagos USING btree (usuario_id);


--
-- Name: perfiles_usuario_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX perfiles_usuario_id_key ON public.perfiles USING btree (usuario_id);


--
-- Name: periodos_nombre_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX periodos_nombre_key ON public.periodos USING btree (nombre);


--
-- Name: prefactura_detalle_cuota_convenio_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX prefactura_detalle_cuota_convenio_id_idx ON public.prefactura_detalle USING btree (cuota_convenio_id);


--
-- Name: prefacturas_contrato_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX prefacturas_contrato_id_idx ON public.prefacturas USING btree (contrato_id);


--
-- Name: prefacturas_contrato_id_periodo_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX prefacturas_contrato_id_periodo_id_key ON public.prefacturas USING btree (contrato_id, periodo_id);


--
-- Name: prefacturas_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX prefacturas_periodo_id_idx ON public.prefacturas USING btree (periodo_id);


--
-- Name: prefacturas_punto_emision_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX prefacturas_punto_emision_id_idx ON public.prefacturas USING btree (punto_emision_id);


--
-- Name: prefacturas_uuid_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX prefacturas_uuid_key ON public.prefacturas USING btree (uuid);


--
-- Name: preferencias_sistema_clave_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX preferencias_sistema_clave_key ON public.preferencias_sistema USING btree (clave);


--
-- Name: puntos_emision_establecimiento_id_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX puntos_emision_establecimiento_id_codigo_key ON public.puntos_emision USING btree (establecimiento_id, codigo);


--
-- Name: retenciones_clave_acceso_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX retenciones_clave_acceso_key ON public.retenciones USING btree (clave_acceso);


--
-- Name: retenciones_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX retenciones_periodo_id_idx ON public.retenciones USING btree (periodo_id);


--
-- Name: retenciones_punto_emision_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX retenciones_punto_emision_id_idx ON public.retenciones USING btree (punto_emision_id);


--
-- Name: retenciones_uuid_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX retenciones_uuid_key ON public.retenciones USING btree (uuid);


--
-- Name: rol_permisos_rol_id_permiso_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX rol_permisos_rol_id_permiso_id_key ON public.rol_permisos USING btree (rol_id, permiso_id);


--
-- Name: roles_nombre_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX roles_nombre_key ON public.roles USING btree (nombre);


--
-- Name: rubros_codigo_sri_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX rubros_codigo_sri_key ON public.rubros USING btree (codigo_sri);


--
-- Name: rubros_impuesto_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX rubros_impuesto_id_idx ON public.rubros USING btree (impuesto_id);


--
-- Name: saldo_favor_cliente_borrado_en_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX saldo_favor_cliente_borrado_en_idx ON public.saldo_favor_cliente USING btree (borrado_en);


--
-- Name: saldo_favor_cliente_cliente_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX saldo_favor_cliente_cliente_id_idx ON public.saldo_favor_cliente USING btree (cliente_id);


--
-- Name: saldo_favor_cliente_pago_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX saldo_favor_cliente_pago_id_idx ON public.saldo_favor_cliente USING btree (pago_id);


--
-- Name: sesiones_expira_en_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX sesiones_expira_en_idx ON public.sesiones USING btree (expira_en);


--
-- Name: sesiones_revocado_expira_en_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX sesiones_revocado_expira_en_idx ON public.sesiones USING btree (revocado, expira_en);


--
-- Name: sesiones_usuario_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX sesiones_usuario_id_idx ON public.sesiones USING btree (usuario_id);


--
-- Name: sri_forma_pago_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX sri_forma_pago_codigo_key ON public.sri_forma_pago USING btree (codigo);


--
-- Name: sri_impuesto_codigo_codigo_porcentaje_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX sri_impuesto_codigo_codigo_porcentaje_key ON public.sri_impuesto USING btree (codigo, codigo_porcentaje);


--
-- Name: sri_tipo_comprobante_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX sri_tipo_comprobante_codigo_key ON public.sri_tipo_comprobante USING btree (codigo);


--
-- Name: usuario_permisos_usuario_id_permiso_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX usuario_permisos_usuario_id_permiso_id_key ON public.usuario_permisos USING btree (usuario_id, permiso_id);


--
-- Name: usuarios_email_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);


--
-- Name: caja_arqueo_detalle caja_arqueo_detalle_caja_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.caja_arqueo_detalle
    ADD CONSTRAINT caja_arqueo_detalle_caja_id_fkey FOREIGN KEY (caja_id) REFERENCES public.caja_sesion(caja_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: caja_sesion caja_sesion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.caja_sesion
    ADD CONSTRAINT caja_sesion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: catalogo_descuento catalogo_descuento_rubro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.catalogo_descuento
    ADD CONSTRAINT catalogo_descuento_rubro_id_fkey FOREIGN KEY (rubro_id) REFERENCES public.rubros(rubro_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: contratos contratos_categoria_tarifa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_categoria_tarifa_id_fkey FOREIGN KEY (categoria_tarifa_id) REFERENCES public.categoria_tarifa(categoria_tarifa_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contratos contratos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contratos contratos_comunidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_comunidad_id_fkey FOREIGN KEY (comunidad_id) REFERENCES public.comunidades(comunidad_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: contratos contratos_sector_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.contratos
    ADD CONSTRAINT contratos_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES public.sectores(sector_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: convenios convenios_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.convenios
    ADD CONSTRAINT convenios_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(contrato_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: cuota_convenio cuota_convenio_convenio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.cuota_convenio
    ADD CONSTRAINT cuota_convenio_convenio_id_fkey FOREIGN KEY (convenio_id) REFERENCES public.convenios(convenio_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: descuento_detalle descuento_detalle_autorizado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.descuento_detalle
    ADD CONSTRAINT descuento_detalle_autorizado_por_fkey FOREIGN KEY (autorizado_por) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: descuento_detalle descuento_detalle_catalogo_descuento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.descuento_detalle
    ADD CONSTRAINT descuento_detalle_catalogo_descuento_id_fkey FOREIGN KEY (catalogo_descuento_id) REFERENCES public.catalogo_descuento(catalogo_descuento_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: descuento_detalle descuento_detalle_prefactura_detalle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.descuento_detalle
    ADD CONSTRAINT descuento_detalle_prefactura_detalle_id_fkey FOREIGN KEY (prefactura_detalle_id) REFERENCES public.prefactura_detalle(prefactura_detalle_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: detalle_pago detalle_pago_cuota_convenio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.detalle_pago
    ADD CONSTRAINT detalle_pago_cuota_convenio_id_fkey FOREIGN KEY (cuota_convenio_id) REFERENCES public.cuota_convenio(cuota_convenio_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detalle_pago detalle_pago_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.detalle_pago
    ADD CONSTRAINT detalle_pago_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(factura_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detalle_pago detalle_pago_forma_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.detalle_pago
    ADD CONSTRAINT detalle_pago_forma_pago_id_fkey FOREIGN KEY (forma_pago_id) REFERENCES public.sri_forma_pago(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: detalle_pago detalle_pago_nota_debito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.detalle_pago
    ADD CONSTRAINT detalle_pago_nota_debito_id_fkey FOREIGN KEY (nota_debito_id) REFERENCES public.notas_debito(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: detalle_pago detalle_pago_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.detalle_pago
    ADD CONSTRAINT detalle_pago_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES public.pagos(pago_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: establecimientos establecimientos_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.establecimientos
    ADD CONSTRAINT establecimientos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES public.empresa(empresa_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: facturas facturas_prefactura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_prefactura_id_fkey FOREIGN KEY (prefactura_id) REFERENCES public.prefacturas(prefactura_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: facturas facturas_tipo_comprobante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.facturas
    ADD CONSTRAINT facturas_tipo_comprobante_id_fkey FOREIGN KEY (tipo_comprobante_id) REFERENCES public.sri_tipo_comprobante(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: historial_medidores historial_medidores_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.historial_medidores
    ADD CONSTRAINT historial_medidores_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(contrato_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: historial_medidores historial_medidores_medidor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.historial_medidores
    ADD CONSTRAINT historial_medidores_medidor_id_fkey FOREIGN KEY (medidor_id) REFERENCES public.medidores(medidor_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lecturas lecturas_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lecturas
    ADD CONSTRAINT lecturas_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(contrato_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lecturas lecturas_medidor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lecturas
    ADD CONSTRAINT lecturas_medidor_id_fkey FOREIGN KEY (medidor_id) REFERENCES public.medidores(medidor_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lecturas lecturas_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lecturas
    ADD CONSTRAINT lecturas_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos(periodo_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lote_facturacion lote_facturacion_comunidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote_facturacion
    ADD CONSTRAINT lote_facturacion_comunidad_id_fkey FOREIGN KEY (comunidad_id) REFERENCES public.comunidades(comunidad_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lote_facturacion lote_facturacion_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote_facturacion
    ADD CONSTRAINT lote_facturacion_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lote_facturacion lote_facturacion_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote_facturacion
    ADD CONSTRAINT lote_facturacion_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos(periodo_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: medidores medidores_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.medidores
    ADD CONSTRAINT medidores_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(contrato_id) ON DELETE RESTRICT;


--
-- Name: menu_permisos menu_permisos_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.menu_permisos
    ADD CONSTRAINT menu_permisos_menu_id_fkey FOREIGN KEY (menu_id) REFERENCES public.menus(menu_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: menu_permisos menu_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.menu_permisos
    ADD CONSTRAINT menu_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(permiso_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: menus menus_menu_padre_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.menus
    ADD CONSTRAINT menus_menu_padre_id_fkey FOREIGN KEY (menu_padre_id) REFERENCES public.menus(menu_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: notas_credito_detalle notas_credito_detalle_nota_credito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito_detalle
    ADD CONSTRAINT notas_credito_detalle_nota_credito_id_fkey FOREIGN KEY (nota_credito_id) REFERENCES public.notas_credito(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_credito notas_credito_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT notas_credito_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(factura_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_credito notas_credito_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT notas_credito_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos(periodo_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_credito notas_credito_punto_emision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT notas_credito_punto_emision_id_fkey FOREIGN KEY (punto_emision_id) REFERENCES public.puntos_emision(punto_emision_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_credito notas_credito_tipo_comprobante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_credito
    ADD CONSTRAINT notas_credito_tipo_comprobante_id_fkey FOREIGN KEY (tipo_comprobante_id) REFERENCES public.sri_tipo_comprobante(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_debito notas_debito_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_debito
    ADD CONSTRAINT notas_debito_factura_id_fkey FOREIGN KEY (factura_id) REFERENCES public.facturas(factura_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_debito notas_debito_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_debito
    ADD CONSTRAINT notas_debito_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos(periodo_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_debito notas_debito_punto_emision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_debito
    ADD CONSTRAINT notas_debito_punto_emision_id_fkey FOREIGN KEY (punto_emision_id) REFERENCES public.puntos_emision(punto_emision_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notas_debito notas_debito_tipo_comprobante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.notas_debito
    ADD CONSTRAINT notas_debito_tipo_comprobante_id_fkey FOREIGN KEY (tipo_comprobante_id) REFERENCES public.sri_tipo_comprobante(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: novedad_operativa novedad_operativa_lectura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.novedad_operativa
    ADD CONSTRAINT novedad_operativa_lectura_id_fkey FOREIGN KEY (lectura_id) REFERENCES public.lecturas(lectura_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pagos pagos_caja_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_caja_id_fkey FOREIGN KEY (caja_id) REFERENCES public.caja_sesion(caja_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pagos pagos_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pagos pagos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: perfiles perfiles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.perfiles
    ADD CONSTRAINT perfiles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prefactura_detalle prefactura_detalle_cuota_convenio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefactura_detalle
    ADD CONSTRAINT prefactura_detalle_cuota_convenio_id_fkey FOREIGN KEY (cuota_convenio_id) REFERENCES public.cuota_convenio(cuota_convenio_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: prefactura_detalle prefactura_detalle_prefactura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefactura_detalle
    ADD CONSTRAINT prefactura_detalle_prefactura_id_fkey FOREIGN KEY (prefactura_id) REFERENCES public.prefacturas(prefactura_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prefactura_detalle prefactura_detalle_rubro_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefactura_detalle
    ADD CONSTRAINT prefactura_detalle_rubro_id_fkey FOREIGN KEY (rubro_id) REFERENCES public.rubros(rubro_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: prefacturas prefacturas_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefacturas
    ADD CONSTRAINT prefacturas_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(contrato_id) ON DELETE RESTRICT;


--
-- Name: prefacturas prefacturas_lectura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefacturas
    ADD CONSTRAINT prefacturas_lectura_id_fkey FOREIGN KEY (lectura_id) REFERENCES public.lecturas(lectura_id) ON DELETE SET NULL;


--
-- Name: prefacturas prefacturas_lote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefacturas
    ADD CONSTRAINT prefacturas_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lote_facturacion(lote_id) ON DELETE SET NULL;


--
-- Name: prefacturas prefacturas_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefacturas
    ADD CONSTRAINT prefacturas_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos(periodo_id) ON DELETE RESTRICT;


--
-- Name: prefacturas prefacturas_punto_emision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.prefacturas
    ADD CONSTRAINT prefacturas_punto_emision_id_fkey FOREIGN KEY (punto_emision_id) REFERENCES public.puntos_emision(punto_emision_id) ON DELETE RESTRICT;


--
-- Name: puntos_emision puntos_emision_establecimiento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.puntos_emision
    ADD CONSTRAINT puntos_emision_establecimiento_id_fkey FOREIGN KEY (establecimiento_id) REFERENCES public.establecimientos(establecimiento_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: retencion_detalle retencion_detalle_retencion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retencion_detalle
    ADD CONSTRAINT retencion_detalle_retencion_id_fkey FOREIGN KEY (retencion_id) REFERENCES public.retenciones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: retenciones retenciones_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retenciones
    ADD CONSTRAINT retenciones_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos(periodo_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: retenciones retenciones_punto_emision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retenciones
    ADD CONSTRAINT retenciones_punto_emision_id_fkey FOREIGN KEY (punto_emision_id) REFERENCES public.puntos_emision(punto_emision_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: retenciones retenciones_tipo_comprobante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.retenciones
    ADD CONSTRAINT retenciones_tipo_comprobante_id_fkey FOREIGN KEY (tipo_comprobante_id) REFERENCES public.sri_tipo_comprobante(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rol_permisos rol_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(permiso_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rol_permisos rol_permisos_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rubros rubros_impuesto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.rubros
    ADD CONSTRAINT rubros_impuesto_id_fkey FOREIGN KEY (impuesto_id) REFERENCES public.sri_impuesto(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: saldo_favor_cliente saldo_favor_cliente_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.saldo_favor_cliente
    ADD CONSTRAINT saldo_favor_cliente_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: saldo_favor_cliente saldo_favor_cliente_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.saldo_favor_cliente
    ADD CONSTRAINT saldo_favor_cliente_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES public.pagos(pago_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sectores sectores_comunidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sectores
    ADD CONSTRAINT sectores_comunidad_id_fkey FOREIGN KEY (comunidad_id) REFERENCES public.comunidades(comunidad_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sesiones sesiones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.sesiones
    ADD CONSTRAINT sesiones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuario_permisos usuario_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.usuario_permisos
    ADD CONSTRAINT usuario_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(permiso_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuario_permisos usuario_permisos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.usuario_permisos
    ADD CONSTRAINT usuario_permisos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios usuarios_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: appuser
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict kXpDYpLpRGCyAAVESa7jo7VDg4XwyaFKYcasSstdRFlppMfaC738bFma7rBjaS4

