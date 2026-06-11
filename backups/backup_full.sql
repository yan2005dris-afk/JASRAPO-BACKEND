--
-- PostgreSQL database dump
--

\restrict 8dOk84fJxfpbpgqvmfxjAerKgQRbUMQ6390ke4FaHblydoc3FpEa04gHr9uNLZ9

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
-- Name: EstadoAnomalia; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."EstadoAnomalia" AS ENUM (
    'PENDIENTE',
    'EN_REVISION',
    'RESUELTA',
    'DESCARTADA'
);


ALTER TYPE public."EstadoAnomalia" OWNER TO appuser;

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
-- Name: TipoAnomalia; Type: TYPE; Schema: public; Owner: appuser
--

CREATE TYPE public."TipoAnomalia" AS ENUM (
    'FUGA',
    'MEDIDOR_DAÑADO',
    'LECTURA_ERRONEA',
    'OTRO'
);


ALTER TYPE public."TipoAnomalia" OWNER TO appuser;

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

--
-- Name: actualizar_consumo_lectura(); Type: FUNCTION; Schema: public; Owner: appuser
--

CREATE FUNCTION public.actualizar_consumo_lectura() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.consumo_calculado := NEW.lectura_actual - NEW.lectura_anterior;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_consumo_lectura() OWNER TO appuser;

--
-- Name: aprobar_lote_facturacion(bigint, text); Type: FUNCTION; Schema: public; Owner: appuser
--

CREATE FUNCTION public.aprobar_lote_facturacion(p_lote_id bigint, p_aprobado_por text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE lote 
    SET estado_id = 2,  -- FK a estado_lote donde codigo = 'DEFINITIVO'
        notas = COALESCE(notas, '') || E'\n' || 'Aprobado por: ' || p_aprobado_por || ' Fecha: ' || CURRENT_TIMESTAMP,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = p_lote_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lote no encontrado: %', p_lote_id;
    END IF;
END;
$$;


ALTER FUNCTION public.aprobar_lote_facturacion(p_lote_id bigint, p_aprobado_por text) OWNER TO appuser;

--
-- Name: generar_prefacturas_lote(integer, integer, text); Type: FUNCTION; Schema: public; Owner: appuser
--

CREATE FUNCTION public.generar_prefacturas_lote(p_periodo_id integer, p_comunidad_id integer DEFAULT NULL::integer, p_creado_por text DEFAULT 'SYSTEM'::text) RETURNS bigint
    LANGUAGE plpgsql
    AS $_$
DECLARE
    v_lote_id BIGINT;
    v_lectura_id BIGINT;
    v_lectura_anterior NUMERIC;
    v_lectura_actual NUMERIC;
    v_consumo NUMERIC;
    contrato_row RECORD;
    v_consumo_minimo INTEGER;
    v_excedente NUMERIC;
    v_cargo_fijo NUMERIC;
    v_excedente_valor NUMERIC;
    v_subtotal NUMERIC;
    v_tasa_seguridad NUMERIC := 0;
    v_porcentaje_tasa NUMERIC := 0;
    v_deuda_anterior NUMERIC := 0;
    v_saldo_vencido NUMERIC := 0;
    v_meses_atrasado INTEGER := 0;
    v_interes_mora NUMERIC := 0;
    v_descuento NUMERIC := 0;
    v_iva_total NUMERIC := 0;
    v_total_pagar_periodo NUMERIC := 0;
    v_prefactura_id BIGINT;
    v_count INTEGER := 0;
    v_total_lote_monto NUMERIC := 0;
    v_observaciones_lote TEXT := 'Iniciado: ' || CURRENT_TIMESTAMP || E'\n';
    
    -- Tasas de impuestos dinámicas para el cálculo
    v_iva_consumo NUMERIC := 0;
    v_iva_cargo_fijo NUMERIC := 0;
    v_iva_interes NUMERIC := 0;
    v_iva_tasa_seguridad NUMERIC := 0;
    
    -- Códigos SRI para los detalles
    v_cod_imp_consumo TEXT; v_por_imp_consumo TEXT;
    v_cod_imp_fijo TEXT; v_por_imp_fijo TEXT;
    v_cod_imp_interes TEXT; v_por_imp_interes TEXT;
    v_cod_imp_seg TEXT; v_por_imp_seg TEXT;
    
    -- IDs de Rubros (Constantes)
    RUBRO_CONSUMO CONSTANT INTEGER := 1;
    RUBRO_CARGO_FIJO CONSTANT INTEGER := 2;
    RUBRO_INTERES CONSTANT INTEGER := 3;
    RUBRO_TASA_SEGURIDAD CONSTANT INTEGER := 4;
    
BEGIN
    -- 1. Cachear tasas de impuestos y códigos de sri_impuesto para rubros comunes
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_consumo, v_cod_imp_consumo, v_por_imp_consumo 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_CONSUMO;
    
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_cargo_fijo, v_cod_imp_fijo, v_por_imp_fijo 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_CARGO_FIJO;
    
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_interes, v_cod_imp_interes, v_por_imp_interes 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_INTERES;
    
    SELECT COALESCE(i.tarifa, 0) / 100, i.codigo, i.codigo_porcentaje INTO v_iva_tasa_seguridad, v_cod_imp_seg, v_por_imp_seg 
    FROM rubros r JOIN sri_impuesto i ON r.impuesto_id = i.id WHERE r.rubro_id = RUBRO_TASA_SEGURIDAD;

    -- 2. Crear el lote (usando FK a estado_lote en lugar de ENUM)
    INSERT INTO lote (comunidad_id, periodo_id, estado_id, total_monto, notas, creado_por, actualizado_en, creado_en)
    VALUES (
        COALESCE(p_comunidad_id, 1),
        p_periodo_id,
        1,  -- FK a estado_lote donde codigo = 'BORRADOR' (asumimos que es el ID 1)
        0,
        'Generando...',
        (CASE WHEN p_creado_por ~ '^[0-9]+$' THEN p_creado_por::INTEGER ELSE NULL END),
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    RETURNING lote_id INTO v_lote_id;
    
    -- 3. Obtener porcentaje de tasa de seguridad de la comunidad
    SELECT COALESCE(c.porcentaje_tasa_seguridad, 0)
    INTO v_porcentaje_tasa
    FROM comunidades c
    WHERE c.comunidad_id = COALESCE(p_comunidad_id, c.comunidad_id)
    LIMIT 1;
    
    -- 4. Procesar contratos activos
    FOR contrato_row IN
        SELECT 
            c.contrato_id, c.cliente_id, c.numero_guia, c.direccion_suministro,
            ct.valor_base, ct.consumo_minimo_mensual, ct.valor_excedente_m3,
            cl.aplica_tercera_edad, cl.aplica_discapacidad,
            (cl.nombres || ' ' || cl.apellidos) AS cliente_nombre,
            cl.identificacion AS cliente_identificacion, cl.email
        FROM contratos c
        JOIN categoria_tarifa ct ON c.categoria_tarifa_id = ct.categoria_tarifa_id
        JOIN clientes cl ON c.cliente_id = cl.cliente_id
        WHERE c.estado = 'ACTIVO'::"EstadoGenerico"
          AND c.borrado_en IS NULL
          AND cl.borrado_en IS NULL
          AND (p_comunidad_id IS NULL OR c.comunidad_id = p_comunidad_id)
    LOOP
        -- Buscar lectura (Debe estar APROBADA)
        SELECT lectura_id, lectura_anterior, lectura_actual
        INTO v_lectura_id, v_lectura_anterior, v_lectura_actual
        FROM lecturas
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_id = p_periodo_id
          AND estado = 'APROBADA'::"EstadoLectura"
          AND borrado_en IS NULL;
        
        IF NOT FOUND THEN
            v_observaciones_lote := v_observaciones_lote || 'Contrato ' || contrato_row.contrato_id || ': Sin lectura APROBADA para periodo ' || p_periodo_id || E'\n';
            CONTINUE;
        END IF;
        
        -- Cálculos de consumo y excedente
        v_consumo := v_lectura_actual - v_lectura_anterior;
        v_excedente := GREATEST(0, v_consumo - contrato_row.consumo_minimo_mensual) * contrato_row.valor_excedente_m3;
        v_cargo_fijo := contrato_row.valor_base;
        
        -- Tasa de Seguridad de la Comunidad (Calculada a partir del parámetro)
        IF v_porcentaje_tasa > 0 THEN
            v_tasa_seguridad := (v_cargo_fijo + v_excedente) * (v_porcentaje_tasa / 100);
        ELSE
            v_tasa_seguridad := 0;
        END IF;
        
        -- Seguimiento de Deuda
        -- v_saldo_vencido: total de prefacturas impagas anteriores
        SELECT COALESCE(SUM(total_pagar - abono), 0), COUNT(*)
        INTO v_saldo_vencido, v_meses_atrasado
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND periodo_id < p_periodo_id
          AND borrado_en IS NULL;
          
        -- v_deuda_anterior: buscar la ÚLTIMA prefactura impaga antes de la actual
        SELECT COALESCE(total_pagar - abono, 0)
        INTO v_deuda_anterior
        FROM prefacturas
        WHERE contrato_id = contrato_row.contrato_id
          AND periodo_id < p_periodo_id
          AND estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
          AND borrado_en IS NULL
        ORDER BY periodo_id DESC
        LIMIT 1;
        
        -- Si es NULL (no hay deuda), asignar 0
        IF v_deuda_anterior IS NULL THEN
            v_deuda_anterior := 0;
        END IF;

        -- Fórmula de Interés de Mora: (saldo vencido) * (cargo fijo / 12) * (meses atrasados)
        IF v_meses_atrasado >= 3 THEN
            v_interes_mora := v_saldo_vencido * (v_cargo_fijo / 12) * v_meses_atrasado;
        ELSE
            v_interes_mora := 0;
        END IF;
        
        -- Descuentos (Adulto Mayor / Discapacidad) aplicados solo al Cargo Fijo
        IF contrato_row.aplica_tercera_edad OR contrato_row.aplica_discapacidad THEN
            v_descuento := v_cargo_fijo * 0.50;
        ELSE
            v_descuento := 0;
        END IF;
        
        -- Subtotal e IVA por Rubro
        -- 1. Cargo Fijo
        v_iva_total := (v_cargo_fijo - v_descuento) * v_iva_cargo_fijo;
        -- 2. Excedente
        v_iva_total := v_iva_total + (v_excedente * v_iva_consumo);
        -- 3. Interés
        v_iva_total := v_iva_total + (v_interes_mora * v_iva_interes);
        -- 4. Tasa Seguridad
        v_iva_total := v_iva_total + (v_tasa_seguridad * v_iva_tasa_seguridad);
        
        v_subtotal := v_cargo_fijo + v_excedente + v_tasa_seguridad + v_interes_mora;
        v_total_pagar_periodo := v_subtotal + v_iva_total - v_descuento;
        
        -- Insertar prefactura
        INSERT INTO prefacturas (
            contrato_id, lote_id, periodo_id, punto_emision_id,
            lectura_anterior, lectura_actual, consumo_m3,
            subtotal, iva, descuento_total, total_pagar,
            deuda_anterior, saldo_vencido, saldo_actual, meses_atrasado,
            interes_mora, tasa_interes_usada, estado,
            cliente_direccion, cliente_email, cliente_identificacion, cliente_nombre,
            tarifa_valor_base, tarifa_valor_excedente, lectura_id, creado_por,
            abono, creado_en, actualizado_en
        ) VALUES (
            contrato_row.contrato_id, v_lote_id, p_periodo_id, 1,
            v_lectura_anterior, v_lectura_actual, v_consumo,
            v_subtotal, v_iva_total, v_descuento, v_total_pagar_periodo,
            v_deuda_anterior, v_saldo_vencido, v_total_pagar_periodo + v_saldo_vencido, v_meses_atrasado,
            v_interes_mora, (v_cargo_fijo / 12), 'GENERADA'::"EstadoPrefactura",
            contrato_row.direccion_suministro, contrato_row.email, contrato_row.cliente_identificacion, contrato_row.cliente_nombre,
            v_cargo_fijo, contrato_row.valor_excedente_m3, v_lectura_id, p_creado_por,
            0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING prefactura_id INTO v_prefactura_id;
        
        -- Insertar Detalles (Con códigos SRI e impuestos correctos)
        -- Detalle: Cargo Fijo
        INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
        VALUES (v_prefactura_id, RUBRO_CARGO_FIJO, 'Cargo Fijo', 1, v_cargo_fijo, v_cargo_fijo, v_cargo_fijo * v_iva_cargo_fijo, v_cargo_fijo * (1 + v_iva_cargo_fijo), v_iva_cargo_fijo * 100, v_cod_imp_fijo, v_por_imp_fijo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        
        -- Detalle: Excedente
        IF v_excedente > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (v_prefactura_id, RUBRO_CONSUMO, 'Excedente Consumo', GREATEST(0, v_consumo - contrato_row.consumo_minimo_mensual), contrato_row.valor_excedente_m3, v_excedente, v_excedente * v_iva_consumo, v_excedente * (1 + v_iva_consumo), v_iva_consumo * 100, v_cod_imp_consumo, v_por_imp_consumo, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;
        
        -- Detalle: Tasa Seguridad
        IF v_tasa_seguridad > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (v_prefactura_id, RUBRO_TASA_SEGURIDAD, 'Tasa Seguridad', 1, v_tasa_seguridad, v_tasa_seguridad, v_tasa_seguridad * v_iva_tasa_seguridad, v_tasa_seguridad * (1 + v_iva_tasa_seguridad), v_iva_tasa_seguridad * 100, v_cod_imp_seg, v_por_imp_seg, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;
        
        -- Detalle: Interés Mora
        IF v_interes_mora > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, cantidad, precio_unitario, subtotal, iva, total, descuento, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (v_prefactura_id, RUBRO_INTERES, v_meses_atrasado, v_interes_mora / NULLIF(v_meses_atrasado, 0), v_interes_mora, v_interes_mora * v_iva_interes, v_interes_mora * (1 + v_iva_interes), 0, v_iva_interes * 100, v_cod_imp_interes, v_por_imp_interes, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;
        
        -- Detalle: Descuento
        IF v_descuento > 0 THEN
            INSERT INTO prefactura_detalle (prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, descuento, tarifa_impuesto, codigo_impuesto_sri, codigo_porcentaje_sri, creado_en, actualizado_en)
            VALUES (v_prefactura_id, RUBRO_CARGO_FIJO, 'Descuento Ley (Tercera Edad/Disc.)', 1, -v_descuento, -v_descuento, 0, -v_descuento, v_descuento, 0, '2', '0', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        END IF;
        
        v_count := v_count + 1;
        v_total_lote_monto := v_total_lote_monto + v_total_pagar_periodo;
    END LOOP;
    
    -- 5. Finalizar Lote (Nombre de tabla corregido)
    UPDATE lote 
    SET total_monto = v_total_lote_monto, 
        total_emisiones = v_count,
        notas = v_observaciones_lote || 'Completado: ' || CURRENT_TIMESTAMP,
        actualizado_en = CURRENT_TIMESTAMP
    WHERE lote_id = v_lote_id;
    
    RETURN v_lote_id;
END;
$_$;


ALTER FUNCTION public.generar_prefacturas_lote(p_periodo_id integer, p_comunidad_id integer, p_creado_por text) OWNER TO appuser;

--
-- Name: obtener_deuda_contrato(bigint); Type: FUNCTION; Schema: public; Owner: appuser
--

CREATE FUNCTION public.obtener_deuda_contrato(p_contrato_id bigint) RETURNS TABLE(deuda_total numeric, meses_atrasado integer, ultima_fecha_pago timestamp without time zone)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(p.total_pagar - p.abono), 0)::NUMERIC AS deuda_total,
        COUNT(*)::INTEGER AS meses_atrasado,
        MAX(p.creado_en) AS ultima_fecha_pago
    FROM prefacturas p
    WHERE p.contrato_id = p_contrato_id
      AND p.estado NOT IN ('PAGADA'::"EstadoPrefactura", 'ANULADA'::"EstadoPrefactura")
      AND p.borrado_en IS NULL;
END;
$$;


ALTER FUNCTION public.obtener_deuda_contrato(p_contrato_id bigint) OWNER TO appuser;

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
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone,
    activo boolean DEFAULT true NOT NULL,
    aplica_discapacidad boolean DEFAULT false NOT NULL,
    aplica_tercera_edad boolean DEFAULT false NOT NULL,
    tipo_identificacion_id bigint
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
    porcentaje_tasa_seguridad numeric(18,2) NOT NULL,
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
-- Name: estado_lote; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.estado_lote (
    estado_id bigint NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.estado_lote OWNER TO appuser;

--
-- Name: estado_lote_estado_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.estado_lote_estado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_lote_estado_id_seq OWNER TO appuser;

--
-- Name: estado_lote_estado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.estado_lote_estado_id_seq OWNED BY public.estado_lote.estado_id;


--
-- Name: estado_medidor; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.estado_medidor (
    estado_id bigint NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    borrado_en timestamp(3) without time zone
);


ALTER TABLE public.estado_medidor OWNER TO appuser;

--
-- Name: estado_medidor_estado_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.estado_medidor_estado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_medidor_estado_id_seq OWNER TO appuser;

--
-- Name: estado_medidor_estado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.estado_medidor_estado_id_seq OWNED BY public.estado_medidor.estado_id;


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
-- Name: identificacion; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.identificacion (
    identificacion_id bigint NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    orden integer DEFAULT 0 NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.identificacion OWNER TO appuser;

--
-- Name: identificacion_identificacion_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.identificacion_identificacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.identificacion_identificacion_id_seq OWNER TO appuser;

--
-- Name: identificacion_identificacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.identificacion_identificacion_id_seq OWNED BY public.identificacion.identificacion_id;


--
-- Name: lectura_anomalia; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.lectura_anomalia (
    anomalia_id bigint NOT NULL,
    lectura_id bigint NOT NULL,
    observacion text,
    tipo public."TipoAnomalia" NOT NULL,
    estado public."EstadoAnomalia" NOT NULL,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    foto_url_minio text
);


ALTER TABLE public.lectura_anomalia OWNER TO appuser;

--
-- Name: lectura_anomalia_anomalia_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.lectura_anomalia_anomalia_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lectura_anomalia_anomalia_id_seq OWNER TO appuser;

--
-- Name: lectura_anomalia_anomalia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.lectura_anomalia_anomalia_id_seq OWNED BY public.lectura_anomalia.anomalia_id;


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
-- Name: lote; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.lote (
    lote_id bigint NOT NULL,
    comunidad_id integer NOT NULL,
    periodo_id integer NOT NULL,
    total_monto numeric(18,2) DEFAULT 0 NOT NULL,
    notas text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    creado_por integer,
    total_emisiones integer DEFAULT 0 NOT NULL,
    estado_id bigint DEFAULT 1 NOT NULL
);


ALTER TABLE public.lote OWNER TO appuser;

--
-- Name: lote_lote_id_seq; Type: SEQUENCE; Schema: public; Owner: appuser
--

CREATE SEQUENCE public.lote_lote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lote_lote_id_seq OWNER TO appuser;

--
-- Name: lote_lote_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: appuser
--

ALTER SEQUENCE public.lote_lote_id_seq OWNED BY public.lote.lote_id;


--
-- Name: medidores; Type: TABLE; Schema: public; Owner: appuser
--

CREATE TABLE public.medidores (
    medidor_id bigint NOT NULL,
    contrato_id bigint,
    marca text NOT NULL,
    modelo text NOT NULL,
    serie text NOT NULL,
    fecha_instalacion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_baja timestamp(3) without time zone,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    borrado_en timestamp(3) without time zone,
    latitud numeric(10,8),
    longitud numeric(11,8),
    motivo text,
    estado_id bigint
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
    cantidad numeric(18,2) NOT NULL,
    precio_unitario numeric(18,2) NOT NULL,
    subtotal numeric(18,2) NOT NULL,
    iva numeric(18,2) NOT NULL,
    total numeric(18,2) NOT NULL,
    codigo_impuesto_sri text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en timestamp(3) without time zone NOT NULL,
    descuento numeric(18,2) DEFAULT 0 NOT NULL,
    cuota_convenio_id bigint,
    codigo_porcentaje_sri text,
    tarifa_impuesto numeric(18,2) DEFAULT 0 NOT NULL
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
    lectura_anterior numeric(18,2),
    lectura_actual numeric(18,2),
    consumo_m3 numeric(18,2),
    subtotal numeric(18,2) NOT NULL,
    iva numeric(18,2) NOT NULL,
    descuento_total numeric(18,2) NOT NULL,
    total_pagar numeric(18,2) NOT NULL,
    deuda_anterior numeric(18,2) DEFAULT 0 NOT NULL,
    saldo_vencido numeric(18,2) DEFAULT 0 NOT NULL,
    abono numeric(18,2) DEFAULT 0 NOT NULL,
    saldo_actual numeric(18,2) DEFAULT 0 NOT NULL,
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
    interes_mora numeric(18,2) DEFAULT 0 NOT NULL,
    cliente_direccion text,
    cliente_email text,
    cliente_identificacion text,
    cliente_nombre text,
    tarifa_nombre text,
    tarifa_valor_base numeric(18,2),
    tarifa_valor_excedente numeric(18,2),
    lectura_id bigint,
    tasa_interes_usada numeric(18,4) DEFAULT 0 NOT NULL
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
    precio_unitario numeric(18,2) NOT NULL,
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
-- Name: estado_lote estado_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.estado_lote ALTER COLUMN estado_id SET DEFAULT nextval('public.estado_lote_estado_id_seq'::regclass);


--
-- Name: estado_medidor estado_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.estado_medidor ALTER COLUMN estado_id SET DEFAULT nextval('public.estado_medidor_estado_id_seq'::regclass);


--
-- Name: facturas factura_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.facturas ALTER COLUMN factura_id SET DEFAULT nextval('public.facturas_factura_id_seq'::regclass);


--
-- Name: historial_medidores historial_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.historial_medidores ALTER COLUMN historial_id SET DEFAULT nextval('public.historial_medidores_historial_id_seq'::regclass);


--
-- Name: identificacion identificacion_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.identificacion ALTER COLUMN identificacion_id SET DEFAULT nextval('public.identificacion_identificacion_id_seq'::regclass);


--
-- Name: lectura_anomalia anomalia_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lectura_anomalia ALTER COLUMN anomalia_id SET DEFAULT nextval('public.lectura_anomalia_anomalia_id_seq'::regclass);


--
-- Name: lecturas lectura_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lecturas ALTER COLUMN lectura_id SET DEFAULT nextval('public.lecturas_lectura_id_seq'::regclass);


--
-- Name: lote lote_id; Type: DEFAULT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote ALTER COLUMN lote_id SET DEFAULT nextval('public.lote_lote_id_seq'::regclass);


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

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
062988d1-3ac2-41dd-9ecb-0cc313e6a1f5	4940a8277e220b0e2093db33dece396dbf4878c4a985aafe933c96d3f0d9263f	2026-05-06 01:21:14.935864+00	20260501195819	\N	\N	2026-05-06 01:21:14.929262+00	1
e8246d8d-15b1-4565-96fa-01d44d70a246	752f0cd8e4bd277939400351713b7e358a947011aa142d36b9f92ce87332e072	2026-05-06 01:21:14.321946+00	20260417025636_init	\N	\N	2026-05-06 01:21:13.814372+00	1
1bdafab5-9f37-4fce-aa4a-b62588d5de14	e509ebe467cdecdf868856f70dbb50aec36e9c37155a33bb18966b5ec6abbf84	2026-05-06 01:21:14.564915+00	20260417073637_multi_payment_methods_final_v2	\N	\N	2026-05-06 01:21:14.542013+00	1
3983b3d2-ffc4-47ce-b8e8-5f2cee1c745f	68175cf8145601fa4197fbab4aa9fc9c3423469e4839a409ed331121744446e9	2026-05-06 01:21:14.379475+00	20260417051611_sincronizacion	\N	\N	2026-05-06 01:21:14.322912+00	1
b8d2bde6-5499-449a-a51a-ef6cdaf7f53e	7eafdc21bf439acbe5de671de102db95490683a65bbdfbcfb5ddd582d37dbbe1	2026-05-06 01:21:14.409538+00	20260417053036_sincronizacionv	\N	\N	2026-05-06 01:21:14.380459+00	1
6db23a4f-1462-4317-9bd9-5a194ea84f22	c11ebeecaf13e75a4970fadedfb54cbe54444855c282715bbeb8043b5b440d73	2026-05-06 01:21:14.416973+00	20260417053150_sincronizacionv2	\N	\N	2026-05-06 01:21:14.41087+00	1
2181e1b2-9af0-4d94-99b4-d04ca47b93b2	e51d0bf5c496330df0d33087a17cc72d13e790356c4976a98ef5888b53f6f0e3	2026-05-06 01:21:14.587734+00	20260426211628_optimize_facturas_lecturas_indexes	\N	\N	2026-05-06 01:21:14.565883+00	1
00045b29-91e7-403e-ba9a-d169bb17300f	26c5305da9689b72b5a9993eaa140990defb05e14ec83c33998f0ca835363ca4	2026-05-06 01:21:14.424713+00	20260417053522_sincronizacionv3	\N	\N	2026-05-06 01:21:14.418306+00	1
0fb4a8d2-67c3-43d0-b2a6-a7c175ff5468	6978588ada71c239e91b4447c69d16f00de9a4999b2568480a27cc933ce2bad5	2026-05-06 01:21:14.430111+00	20260417055313_sincronizacionv4	\N	\N	2026-05-06 01:21:14.426049+00	1
2b88454a-ab02-4b31-ab31-7e4d6bc6ab47	610e45a258bb59baa18135a1044bc67a3447a3416709ce64ed798a87bc189f14	2026-05-06 01:21:15.064427+00	20260501214340_fix_roles_heredados_columns	\N	\N	2026-05-06 01:21:15.051841+00	1
8fd665a9-08a2-4d90-b48c-ff04721dc332	20324f14dabe15945fa47a07ad95f722aa4a9923e6dacfc5629422a91fa349fb	2026-05-06 01:21:14.457406+00	20260417061806_add_discounts_architecture	\N	\N	2026-05-06 01:21:14.431155+00	1
ac115961-06bd-436e-8dae-19b4a4786603	bfd4ed5502eb7b7f0746a322589695b3f94ba19f516530c5d9ac50ed0ebb7503	2026-05-06 01:21:14.649417+00	20260501025438_cambiando_schema	\N	\N	2026-05-06 01:21:14.588868+00	1
59c0e010-06d7-4a8a-b597-eb50090a948e	5ddceeeb16e28459aa9f0fe8767da787d108d3d2ee7e7e95e7618f40c42acc51	2026-05-06 01:21:14.476594+00	20260417063947_add_manual_discounts_catalog_final	\N	\N	2026-05-06 01:21:14.458656+00	1
0e1001e3-c094-4015-aaff-75dd87b3d9da	26e4a1ab1ab0217331bf78768435cf3f7bd03f6f1c39ba21c22443b695f557cd	2026-05-06 01:21:14.490378+00	20260417065302_sync_hybrid_manual_discounts	\N	\N	2026-05-06 01:21:14.477586+00	1
a5f89c84-da7b-40b9-bb4c-34406f5fed22	89f00f1b3e1594baaf79b4272ba5de97ad0537639610df4ebf7eff6f12f25743	2026-05-06 01:21:14.984171+00	20260501202811	\N	\N	2026-05-06 01:21:14.936978+00	1
7fb016d2-1f73-4b19-a31a-505144cda4dd	5552bb9875d921a3608139fb92d617844b7bf974ff50222a5289e8502e2952dd	2026-05-06 01:21:14.500908+00	20260417065428_simplify_discounts_to_detail_only	\N	\N	2026-05-06 01:21:14.491265+00	1
2a65ea4f-7d3c-4bdc-a0c9-97f8900660f4	5e838be0e5cba71305dfb15dd4786ecd28777da6eb4e10bd031545ed206eb876	2026-05-06 01:21:14.73721+00	20260501030013_facturacion	\N	\N	2026-05-06 01:21:14.65054+00	1
9bb76f50-c674-4579-9b46-5edef2bacedd	4fd43fe2df88eeee28e7650baf0cf01e124b9e3d2c919ae4d9cec2c8d8423aae	2026-05-06 01:21:14.516577+00	20260417070954_unified_billing_source_of_truth	\N	\N	2026-05-06 01:21:14.50193+00	1
b304bfc5-31f7-4505-a294-3da05f6f88b3	10e225a9154cac8d4ae4a8c7ae5494ade7b2818ce46c0cae72a93600a155d35f	2026-05-06 01:21:14.535788+00	20260417071843_final_minimalist_invoice_architecture	\N	\N	2026-05-06 01:21:14.51766+00	1
0da80891-4553-4bb5-8b26-63bedf29f03f	3d680e9689f7f69cfd9f081cda0b6b6f4f8f3fa362b8e5c4511db96c071dd6f6	2026-05-06 01:21:14.540896+00	20260417072129_add_client_snapshot_to_prefactura	\N	\N	2026-05-06 01:21:14.537149+00	1
beb026e7-38d5-48f1-8110-4eecc07f8038	5c17efbfcaec54d892f7a2e74d2aa5547d820268bcf80dedaaaf143867d287a5	2026-05-06 01:21:14.861515+00	20260501074016_migration_db_upgrade	\N	\N	2026-05-06 01:21:14.738346+00	1
799be9b0-0a5c-4354-a7e7-005944bac8e7	326b70a38293e44be28d6a660b0effb409ccb95766e9915c37e09052afa519c0	2026-05-06 01:21:14.885048+00	20260501193021_upgrade_detalle_pago	\N	\N	2026-05-06 01:21:14.862507+00	1
93ee73e7-c09c-48fc-bd1b-66cc6954a984	f4ea262c27d946ea0222a907a3fd121ccd0a7593bcb37be222402653d376dcd7	2026-05-06 01:21:15.011628+00	20260501210913	\N	\N	2026-05-06 01:21:14.985297+00	1
1fa6ea5e-e4de-4cf7-b4a1-af6fee4b2475	720e347d513bcb309cf4ffa05fdf740168f8578850f50235cd897e2db08522a4	2026-05-06 01:21:14.919833+00	20260501195100	\N	\N	2026-05-06 01:21:14.886009+00	1
a46e90f8-c1d5-43c8-b53d-8474338ff4fb	18017787b02488096c22ae1c8495ac3231135b30da47b79a8554ef16f210d3a1	2026-05-06 01:21:14.927917+00	20260501195400	\N	\N	2026-05-06 01:21:14.920883+00	1
a0002e87-d0d6-4036-9f81-6a5fc953addc	b4fb119b28b8e95aa85f23e38ed2702e6d2cdf5920b76d73eac3efe42e1df918	2026-05-06 01:21:15.169724+00	20260504002220_identificacion_table_name	\N	\N	2026-05-06 01:21:15.146656+00	1
c00563c1-7e9d-4224-9b73-b7c5f9f79f0c	ba6b2c70b74cb3aef01f875278452d7b21cdd51aa8a6fb624966ad69b6b3c6f3	2026-05-06 01:21:15.076084+00	20260501215114_sync_backend_requirements	\N	\N	2026-05-06 01:21:15.065621+00	1
6990c09f-ae3f-4767-9555-e984e2643cf8	1ff0921f482bf0965f6d54d4aacf30dfb43f541c0ebfa93502690a75d3301156	2026-05-06 01:21:15.033172+00	20260501213338	\N	\N	2026-05-06 01:21:15.012642+00	1
df3f4a18-1ab9-4727-8f62-c8fd922e57be	dae5cb8441ea6bcf73ba5a23c9eef16e7cb564d321fef301f571395d3a4eb9a9	2026-05-06 01:21:15.040583+00	20260501213708	\N	\N	2026-05-06 01:21:15.034546+00	1
28d33731-22d7-4d1a-9688-8739452a08a4	d38e6f44f697d2227002e0e7487930ef59939731191bf516431cf3502a022cf3	2026-05-06 01:21:15.095869+00	20260503052915_meter_update_nullable_fecha_instalacion	\N	\N	2026-05-06 01:21:15.092019+00	1
15ece05d-fcb6-4045-91f9-b2ba6ad5c6a6	590994310f943fc5dd264e3cd82ce1536fb5f491810923b63e203676eacde6fd	2026-05-06 01:21:15.050773+00	20260501214314_restore_roles_heredados	\N	\N	2026-05-06 01:21:15.04165+00	1
c4fc9f9e-8e5b-4e60-800c-8e0f3e9afec4	74fd8143ea7d35de3129bd66cf565b84c65c6fadc376361928ac117ce63d6000	2026-05-06 01:21:15.086492+00	20260501222218_remove_roles_heredados	\N	\N	2026-05-06 01:21:15.077559+00	1
835c155f-d6d3-4ff6-bfdf-1a77db2c0d50	004f59715424f29476a1b70d534844050e25eec4a81f6c35d99b89127eb0fb5f	2026-05-06 01:21:15.145513+00	20260504002131_identificacion_table	\N	\N	2026-05-06 01:21:15.109746+00	1
a8efaad7-cd27-42da-8a80-0bdff0223209	3d50b947dbb7b739403cc6797e14ab448e5ba435c1c113e0dfc30ae416493dec	2026-05-06 01:21:15.090911+00	20260503041311_fecha_instalacion_nulleable	\N	\N	2026-05-06 01:21:15.087573+00	1
8882ddad-4582-4b1b-a86c-0b71813a9286	3da617a331a81e5a77013c86522e3f1005c401947be187dc0f80cee93a29af07	2026-05-06 01:21:15.108685+00	20260503063819_enum_update_estimate_to_pendiente	\N	\N	2026-05-06 01:21:15.097168+00	1
0a913340-81fd-48fe-9ffb-8d1333227a95	c207e8d074398615ce941770a9d35ad3a1666a327c79b2db81316341b7544727	2026-05-06 01:21:15.190425+00	20260504025653_estado_medidor_table	\N	\N	2026-05-06 01:21:15.170863+00	1
c9f75b39-8111-4621-b8ba-7ddaf4552b27	bafe2bd73166db2363594ea75e9a3722dd018c3180d15b1255666a1c6684d315	2026-05-06 01:21:15.214608+00	20260504042824_nametableestadomedidor	\N	\N	2026-05-06 01:21:15.191735+00	1
cd09b332-b06c-4fa1-8930-ea609b18f310	d1f45552821845b99911ec04ebf973cb16f3dfc3fa8bc264c684bc041c53cf3c	2026-05-06 01:21:15.225341+00	20260504051656_generar_prefacturas_sp	\N	\N	2026-05-06 01:21:15.215757+00	1
06a0df9e-abb2-4f1f-8a1f-3d93791168ab	d9f95cc5fd1d1feaa78accbfead94ea68771e20ecb6606b5c6f906d936d14fe8	2026-05-06 01:21:15.294666+00	20260504155610_name_table_lote	\N	\N	2026-05-06 01:21:15.226378+00	1
7f2d5c51-f27a-46b9-8284-904c515bc6cb	3b29181bbf7b6d07258594b0328c7eb8480128f87adb2a76997fa51c08981582	2026-05-06 01:21:15.307043+00	202605050100_estado_lote_tabla	\N	\N	2026-05-06 01:21:15.295698+00	1
5a2edc95-adce-49b4-ab6d-f23f2c7728b2	a85d3e896eb2a93640e420719caa581e35592e737e5edb6f16cf6648192d65ff	2026-05-06 01:21:15.327492+00	20260506011438_dev	\N	\N	2026-05-06 01:21:15.308094+00	1
\.


--
-- Data for Name: caja_arqueo_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.caja_arqueo_detalle (id, caja_id, denominacion, cantidad, subtotal, es_moneda, creado_en) FROM stdin;
\.


--
-- Data for Name: caja_sesion; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.caja_sesion (caja_id, usuario_id, fecha_apertura, monto_apertura, monto_cierre_sistema, monto_cierre_real, novedad_cierre, estado, creado_en, actualizado_en, total_cheques_declarados, total_transferencias_declaradas) FROM stdin;
\.


--
-- Data for Name: catalogo_descuento; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.catalogo_descuento (catalogo_descuento_id, nombre, descripcion, tipo_descuento, valor, es_porcentaje, rubro_id, activo, aplica_automatico) FROM stdin;
1	Beneficio Tercera Edad	Descuento del 50% por ley para adultos mayores	TERCERA_EDAD	50.0000	t	\N	t	t
2	Beneficio Discapacidad	Descuento del 50% por ley según carnet	DISCAPACIDAD	50.0000	t	\N	t	t
3	Exención Tasa Seguridad	Exoneración de tasa de seguridad ciudadana	EXENCION_TASA	100.0000	t	\N	t	f
4	Rebaja Interés Mora	Descuento autorizado sobre intereses acumulados	INTERES_MORA	0.0000	f	\N	t	f
\.


--
-- Data for Name: categoria_tarifa; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.categoria_tarifa (categoria_tarifa_id, nombre, descripcion, valor_base, consumo_minimo_mensual, valor_excedente_m3, fecha_vigencia_desde, fecha_vigencia_hasta, activo, creado_en, actualizado_en, borrado_en) FROM stdin;
1	RESIDENCIAL	Tarifa para consumo doméstico estándar	4.000000	0	0.400000	\N	\N	t	2026-05-06 01:21:35.411	2026-05-06 01:21:35.411	\N
2	COMERCIAL	Tarifa para locales comerciales y negocios	7.500000	0	0.750000	\N	\N	t	2026-05-06 01:21:35.414	2026-05-06 01:21:35.414	\N
3	INDUSTRIAL	Tarifa para industrias y grandes consumidores	15.000000	0	1.500000	\N	\N	t	2026-05-06 01:21:35.417	2026-05-06 01:21:35.417	\N
4	TERCERA EDAD	Tarifa subsidiada para adultos mayores	4.000000	0	0.400000	\N	\N	t	2026-05-06 01:21:35.419	2026-05-06 01:21:35.419	\N
5	DISCAPACIDAD	Tarifa subsidiada para personas con discapacidad	4.000000	0	0.400000	\N	\N	t	2026-05-06 01:21:35.42	2026-05-06 01:21:35.42	\N
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.clientes (cliente_id, apellidos, direccion_domicilio, email, identificacion, nombres, razon_social, telefono, telefono_secundario, actualizado_en, creado_en, borrado_en, activo, aplica_discapacidad, aplica_tercera_edad, tipo_identificacion_id) FROM stdin;
1	Perez	\N	juan@test.com	1234567890	Juan	\N	\N	\N	2026-05-06 01:21:35.483	2026-05-06 01:21:35.483	\N	t	f	f	1
2	Gonzalez	\N	maria@test.com	1234567891	Maria	\N	\N	\N	2026-05-06 01:21:35.488	2026-05-06 01:21:35.488	\N	t	f	f	1
3	Lopez	\N	pedro@test.com	1234567892	Pedro	\N	\N	\N	2026-05-06 01:21:35.49	2026-05-06 01:21:35.49	\N	t	f	f	1
4	Apellido 4	\N	cliente4@test.com	13100000004	Cliente 4	\N	0990000004	\N	2026-05-06 01:21:35.493	2026-05-06 01:21:35.493	\N	t	f	f	1
5	Apellido 5	\N	cliente5@test.com	13100000005	Cliente 5	\N	0990000005	\N	2026-05-06 01:21:35.495	2026-05-06 01:21:35.495	\N	t	f	f	1
6	Apellido 6	\N	cliente6@test.com	13100000006	Cliente 6	\N	0990000006	\N	2026-05-06 01:21:35.496	2026-05-06 01:21:35.496	\N	t	f	f	1
7	Apellido 7	\N	cliente7@test.com	13100000007	Cliente 7	\N	0990000007	\N	2026-05-06 01:21:35.498	2026-05-06 01:21:35.498	\N	t	f	f	1
8	Apellido 8	\N	cliente8@test.com	13100000008	Cliente 8	\N	0990000008	\N	2026-05-06 01:21:35.499	2026-05-06 01:21:35.499	\N	t	f	f	1
9	Apellido 9	\N	cliente9@test.com	13100000009	Cliente 9	\N	0990000009	\N	2026-05-06 01:21:35.5	2026-05-06 01:21:35.5	\N	t	f	f	1
10	Apellido 10	\N	cliente10@test.com	13100000010	Cliente 10	\N	0990000010	\N	2026-05-06 01:21:35.502	2026-05-06 01:21:35.502	\N	t	f	f	1
11	Apellido 11	\N	cliente11@test.com	13100000011	Cliente 11	\N	0990000011	\N	2026-05-06 01:21:35.503	2026-05-06 01:21:35.503	\N	t	f	f	1
12	Apellido 12	\N	cliente12@test.com	13100000012	Cliente 12	\N	0990000012	\N	2026-05-06 01:21:35.504	2026-05-06 01:21:35.504	\N	t	f	f	1
13	Apellido 13	\N	cliente13@test.com	13100000013	Cliente 13	\N	0990000013	\N	2026-05-06 01:21:35.506	2026-05-06 01:21:35.506	\N	t	f	f	1
14	Apellido 14	\N	cliente14@test.com	13100000014	Cliente 14	\N	0990000014	\N	2026-05-06 01:21:35.507	2026-05-06 01:21:35.507	\N	t	f	f	1
15	Apellido 15	\N	cliente15@test.com	13100000015	Cliente 15	\N	0990000015	\N	2026-05-06 01:21:35.508	2026-05-06 01:21:35.508	\N	t	f	f	1
16	Apellido 16	\N	cliente16@test.com	13100000016	Cliente 16	\N	0990000016	\N	2026-05-06 01:21:35.51	2026-05-06 01:21:35.51	\N	t	f	f	1
17	Apellido 17	\N	cliente17@test.com	13100000017	Cliente 17	\N	0990000017	\N	2026-05-06 01:21:35.512	2026-05-06 01:21:35.512	\N	t	f	f	1
18	Apellido 18	\N	cliente18@test.com	13100000018	Cliente 18	\N	0990000018	\N	2026-05-06 01:21:35.514	2026-05-06 01:21:35.514	\N	t	f	f	1
19	Apellido 19	\N	cliente19@test.com	13100000019	Cliente 19	\N	0990000019	\N	2026-05-06 01:21:35.515	2026-05-06 01:21:35.515	\N	t	f	f	1
20	Apellido 20	\N	cliente20@test.com	13100000020	Cliente 20	\N	0990000020	\N	2026-05-06 01:21:35.517	2026-05-06 01:21:35.517	\N	t	f	f	1
21	Apellido 21	\N	cliente21@test.com	13100000021	Cliente 21	\N	0990000021	\N	2026-05-06 01:21:35.519	2026-05-06 01:21:35.519	\N	t	f	f	1
22	Apellido 22	\N	cliente22@test.com	13100000022	Cliente 22	\N	0990000022	\N	2026-05-06 01:21:35.521	2026-05-06 01:21:35.521	\N	t	f	f	1
23	Apellido 23	\N	cliente23@test.com	13100000023	Cliente 23	\N	0990000023	\N	2026-05-06 01:21:35.522	2026-05-06 01:21:35.522	\N	t	f	f	1
24	Apellido 24	\N	cliente24@test.com	13100000024	Cliente 24	\N	0990000024	\N	2026-05-06 01:21:35.526	2026-05-06 01:21:35.526	\N	t	f	f	1
25	Apellido 25	\N	cliente25@test.com	13100000025	Cliente 25	\N	0990000025	\N	2026-05-06 01:21:35.528	2026-05-06 01:21:35.528	\N	t	f	f	1
26	Apellido 26	\N	cliente26@test.com	13100000026	Cliente 26	\N	0990000026	\N	2026-05-06 01:21:35.529	2026-05-06 01:21:35.529	\N	t	f	f	1
27	Apellido 27	\N	cliente27@test.com	13100000027	Cliente 27	\N	0990000027	\N	2026-05-06 01:21:35.53	2026-05-06 01:21:35.53	\N	t	f	f	1
28	Apellido 28	\N	cliente28@test.com	13100000028	Cliente 28	\N	0990000028	\N	2026-05-06 01:21:35.532	2026-05-06 01:21:35.532	\N	t	f	f	1
29	Apellido 29	\N	cliente29@test.com	13100000029	Cliente 29	\N	0990000029	\N	2026-05-06 01:21:35.533	2026-05-06 01:21:35.533	\N	t	f	f	1
30	Apellido 30	\N	cliente30@test.com	13100000030	Cliente 30	\N	0990000030	\N	2026-05-06 01:21:35.535	2026-05-06 01:21:35.535	\N	t	f	f	1
31	Apellido 31	\N	cliente31@test.com	13100000031	Cliente 31	\N	0990000031	\N	2026-05-06 01:21:35.536	2026-05-06 01:21:35.536	\N	t	f	f	1
32	Apellido 32	\N	cliente32@test.com	13100000032	Cliente 32	\N	0990000032	\N	2026-05-06 01:21:35.537	2026-05-06 01:21:35.537	\N	t	f	f	1
33	Apellido 33	\N	cliente33@test.com	13100000033	Cliente 33	\N	0990000033	\N	2026-05-06 01:21:35.538	2026-05-06 01:21:35.538	\N	t	f	f	1
34	Apellido 34	\N	cliente34@test.com	13100000034	Cliente 34	\N	0990000034	\N	2026-05-06 01:21:35.54	2026-05-06 01:21:35.54	\N	t	f	f	1
35	Apellido 35	\N	cliente35@test.com	13100000035	Cliente 35	\N	0990000035	\N	2026-05-06 01:21:35.541	2026-05-06 01:21:35.541	\N	t	f	f	1
36	Apellido 36	\N	cliente36@test.com	13100000036	Cliente 36	\N	0990000036	\N	2026-05-06 01:21:35.543	2026-05-06 01:21:35.543	\N	t	f	f	1
37	Apellido 37	\N	cliente37@test.com	13100000037	Cliente 37	\N	0990000037	\N	2026-05-06 01:21:35.544	2026-05-06 01:21:35.544	\N	t	f	f	1
38	Apellido 38	\N	cliente38@test.com	13100000038	Cliente 38	\N	0990000038	\N	2026-05-06 01:21:35.545	2026-05-06 01:21:35.545	\N	t	f	f	1
39	Apellido 39	\N	cliente39@test.com	13100000039	Cliente 39	\N	0990000039	\N	2026-05-06 01:21:35.547	2026-05-06 01:21:35.547	\N	t	f	f	1
40	Apellido 40	\N	cliente40@test.com	13100000040	Cliente 40	\N	0990000040	\N	2026-05-06 01:21:35.548	2026-05-06 01:21:35.548	\N	t	f	f	1
41	Apellido 41	\N	cliente41@test.com	13100000041	Cliente 41	\N	0990000041	\N	2026-05-06 01:21:35.549	2026-05-06 01:21:35.549	\N	t	f	f	1
42	Apellido 42	\N	cliente42@test.com	13100000042	Cliente 42	\N	0990000042	\N	2026-05-06 01:21:35.551	2026-05-06 01:21:35.551	\N	t	f	f	1
43	Apellido 43	\N	cliente43@test.com	13100000043	Cliente 43	\N	0990000043	\N	2026-05-06 01:21:35.552	2026-05-06 01:21:35.552	\N	t	f	f	1
44	Apellido 44	\N	cliente44@test.com	13100000044	Cliente 44	\N	0990000044	\N	2026-05-06 01:21:35.553	2026-05-06 01:21:35.553	\N	t	f	f	1
45	Apellido 45	\N	cliente45@test.com	13100000045	Cliente 45	\N	0990000045	\N	2026-05-06 01:21:35.555	2026-05-06 01:21:35.555	\N	t	f	f	1
46	Apellido 46	\N	cliente46@test.com	13100000046	Cliente 46	\N	0990000046	\N	2026-05-06 01:21:35.556	2026-05-06 01:21:35.556	\N	t	f	f	1
47	Apellido 47	\N	cliente47@test.com	13100000047	Cliente 47	\N	0990000047	\N	2026-05-06 01:21:35.557	2026-05-06 01:21:35.557	\N	t	f	f	1
48	Apellido 48	\N	cliente48@test.com	13100000048	Cliente 48	\N	0990000048	\N	2026-05-06 01:21:35.559	2026-05-06 01:21:35.559	\N	t	f	f	1
49	Apellido 49	\N	cliente49@test.com	13100000049	Cliente 49	\N	0990000049	\N	2026-05-06 01:21:35.56	2026-05-06 01:21:35.56	\N	t	f	f	1
50	Apellido 50	\N	cliente50@test.com	13100000050	Cliente 50	\N	0990000050	\N	2026-05-06 01:21:35.562	2026-05-06 01:21:35.562	\N	t	f	f	1
51	Apellido 51	\N	cliente51@test.com	13100000051	Cliente 51	\N	0990000051	\N	2026-05-06 01:21:35.563	2026-05-06 01:21:35.563	\N	t	f	f	1
52	Apellido 52	\N	cliente52@test.com	13100000052	Cliente 52	\N	0990000052	\N	2026-05-06 01:21:35.564	2026-05-06 01:21:35.564	\N	t	f	f	1
53	Apellido 53	\N	cliente53@test.com	13100000053	Cliente 53	\N	0990000053	\N	2026-05-06 01:21:35.566	2026-05-06 01:21:35.566	\N	t	f	f	1
54	Apellido 54	\N	cliente54@test.com	13100000054	Cliente 54	\N	0990000054	\N	2026-05-06 01:21:35.567	2026-05-06 01:21:35.567	\N	t	f	f	1
55	Apellido 55	\N	cliente55@test.com	13100000055	Cliente 55	\N	0990000055	\N	2026-05-06 01:21:35.569	2026-05-06 01:21:35.569	\N	t	f	f	1
56	Apellido 56	\N	cliente56@test.com	13100000056	Cliente 56	\N	0990000056	\N	2026-05-06 01:21:35.57	2026-05-06 01:21:35.57	\N	t	f	f	1
57	Apellido 57	\N	cliente57@test.com	13100000057	Cliente 57	\N	0990000057	\N	2026-05-06 01:21:35.571	2026-05-06 01:21:35.571	\N	t	f	f	1
58	Apellido 58	\N	cliente58@test.com	13100000058	Cliente 58	\N	0990000058	\N	2026-05-06 01:21:35.573	2026-05-06 01:21:35.573	\N	t	f	f	1
59	Apellido 59	\N	cliente59@test.com	13100000059	Cliente 59	\N	0990000059	\N	2026-05-06 01:21:35.575	2026-05-06 01:21:35.575	\N	t	f	f	1
60	Apellido 60	\N	cliente60@test.com	13100000060	Cliente 60	\N	0990000060	\N	2026-05-06 01:21:35.576	2026-05-06 01:21:35.576	\N	t	f	f	1
61	Apellido 61	\N	cliente61@test.com	13100000061	Cliente 61	\N	0990000061	\N	2026-05-06 01:21:35.577	2026-05-06 01:21:35.577	\N	t	f	f	1
62	Apellido 62	\N	cliente62@test.com	13100000062	Cliente 62	\N	0990000062	\N	2026-05-06 01:21:35.578	2026-05-06 01:21:35.578	\N	t	f	f	1
63	Apellido 63	\N	cliente63@test.com	13100000063	Cliente 63	\N	0990000063	\N	2026-05-06 01:21:35.58	2026-05-06 01:21:35.58	\N	t	f	f	1
64	Apellido 64	\N	cliente64@test.com	13100000064	Cliente 64	\N	0990000064	\N	2026-05-06 01:21:35.581	2026-05-06 01:21:35.581	\N	t	f	f	1
65	Apellido 65	\N	cliente65@test.com	13100000065	Cliente 65	\N	0990000065	\N	2026-05-06 01:21:35.583	2026-05-06 01:21:35.583	\N	t	f	f	1
66	Apellido 66	\N	cliente66@test.com	13100000066	Cliente 66	\N	0990000066	\N	2026-05-06 01:21:35.584	2026-05-06 01:21:35.584	\N	t	f	f	1
67	Apellido 67	\N	cliente67@test.com	13100000067	Cliente 67	\N	0990000067	\N	2026-05-06 01:21:35.585	2026-05-06 01:21:35.585	\N	t	f	f	1
68	Apellido 68	\N	cliente68@test.com	13100000068	Cliente 68	\N	0990000068	\N	2026-05-06 01:21:35.586	2026-05-06 01:21:35.586	\N	t	f	f	1
69	Apellido 69	\N	cliente69@test.com	13100000069	Cliente 69	\N	0990000069	\N	2026-05-06 01:21:35.588	2026-05-06 01:21:35.588	\N	t	f	f	1
70	Apellido 70	\N	cliente70@test.com	13100000070	Cliente 70	\N	0990000070	\N	2026-05-06 01:21:35.589	2026-05-06 01:21:35.589	\N	t	f	f	1
71	Apellido 71	\N	cliente71@test.com	13100000071	Cliente 71	\N	0990000071	\N	2026-05-06 01:21:35.591	2026-05-06 01:21:35.591	\N	t	f	f	1
72	Apellido 72	\N	cliente72@test.com	13100000072	Cliente 72	\N	0990000072	\N	2026-05-06 01:21:35.592	2026-05-06 01:21:35.592	\N	t	f	f	1
73	Apellido 73	\N	cliente73@test.com	13100000073	Cliente 73	\N	0990000073	\N	2026-05-06 01:21:35.593	2026-05-06 01:21:35.593	\N	t	f	f	1
74	Apellido 74	\N	cliente74@test.com	13100000074	Cliente 74	\N	0990000074	\N	2026-05-06 01:21:35.595	2026-05-06 01:21:35.595	\N	t	f	f	1
75	Apellido 75	\N	cliente75@test.com	13100000075	Cliente 75	\N	0990000075	\N	2026-05-06 01:21:35.596	2026-05-06 01:21:35.596	\N	t	f	f	1
76	Apellido 76	\N	cliente76@test.com	13100000076	Cliente 76	\N	0990000076	\N	2026-05-06 01:21:35.598	2026-05-06 01:21:35.598	\N	t	f	f	1
77	Apellido 77	\N	cliente77@test.com	13100000077	Cliente 77	\N	0990000077	\N	2026-05-06 01:21:35.599	2026-05-06 01:21:35.599	\N	t	f	f	1
78	Apellido 78	\N	cliente78@test.com	13100000078	Cliente 78	\N	0990000078	\N	2026-05-06 01:21:35.6	2026-05-06 01:21:35.6	\N	t	f	f	1
79	Apellido 79	\N	cliente79@test.com	13100000079	Cliente 79	\N	0990000079	\N	2026-05-06 01:21:35.602	2026-05-06 01:21:35.602	\N	t	f	f	1
80	Apellido 80	\N	cliente80@test.com	13100000080	Cliente 80	\N	0990000080	\N	2026-05-06 01:21:35.603	2026-05-06 01:21:35.603	\N	t	f	f	1
81	Apellido 81	\N	cliente81@test.com	13100000081	Cliente 81	\N	0990000081	\N	2026-05-06 01:21:35.605	2026-05-06 01:21:35.605	\N	t	f	f	1
82	Apellido 82	\N	cliente82@test.com	13100000082	Cliente 82	\N	0990000082	\N	2026-05-06 01:21:35.606	2026-05-06 01:21:35.606	\N	t	f	f	1
83	Apellido 83	\N	cliente83@test.com	13100000083	Cliente 83	\N	0990000083	\N	2026-05-06 01:21:35.607	2026-05-06 01:21:35.607	\N	t	f	f	1
84	Apellido 84	\N	cliente84@test.com	13100000084	Cliente 84	\N	0990000084	\N	2026-05-06 01:21:35.609	2026-05-06 01:21:35.609	\N	t	f	f	1
85	Apellido 85	\N	cliente85@test.com	13100000085	Cliente 85	\N	0990000085	\N	2026-05-06 01:21:35.61	2026-05-06 01:21:35.61	\N	t	f	f	1
86	Apellido 86	\N	cliente86@test.com	13100000086	Cliente 86	\N	0990000086	\N	2026-05-06 01:21:35.611	2026-05-06 01:21:35.611	\N	t	f	f	1
87	Apellido 87	\N	cliente87@test.com	13100000087	Cliente 87	\N	0990000087	\N	2026-05-06 01:21:35.613	2026-05-06 01:21:35.613	\N	t	f	f	1
88	Apellido 88	\N	cliente88@test.com	13100000088	Cliente 88	\N	0990000088	\N	2026-05-06 01:21:35.614	2026-05-06 01:21:35.614	\N	t	f	f	1
89	Apellido 89	\N	cliente89@test.com	13100000089	Cliente 89	\N	0990000089	\N	2026-05-06 01:21:35.615	2026-05-06 01:21:35.615	\N	t	f	f	1
90	Apellido 90	\N	cliente90@test.com	13100000090	Cliente 90	\N	0990000090	\N	2026-05-06 01:21:35.616	2026-05-06 01:21:35.616	\N	t	f	f	1
91	Apellido 91	\N	cliente91@test.com	13100000091	Cliente 91	\N	0990000091	\N	2026-05-06 01:21:35.618	2026-05-06 01:21:35.618	\N	t	f	f	1
92	Apellido 92	\N	cliente92@test.com	13100000092	Cliente 92	\N	0990000092	\N	2026-05-06 01:21:35.619	2026-05-06 01:21:35.619	\N	t	f	f	1
93	Apellido 93	\N	cliente93@test.com	13100000093	Cliente 93	\N	0990000093	\N	2026-05-06 01:21:35.62	2026-05-06 01:21:35.62	\N	t	f	f	1
94	Apellido 94	\N	cliente94@test.com	13100000094	Cliente 94	\N	0990000094	\N	2026-05-06 01:21:35.621	2026-05-06 01:21:35.621	\N	t	f	f	1
95	Apellido 95	\N	cliente95@test.com	13100000095	Cliente 95	\N	0990000095	\N	2026-05-06 01:21:35.622	2026-05-06 01:21:35.622	\N	t	f	f	1
96	Apellido 96	\N	cliente96@test.com	13100000096	Cliente 96	\N	0990000096	\N	2026-05-06 01:21:35.624	2026-05-06 01:21:35.624	\N	t	f	f	1
97	Apellido 97	\N	cliente97@test.com	13100000097	Cliente 97	\N	0990000097	\N	2026-05-06 01:21:35.626	2026-05-06 01:21:35.626	\N	t	f	f	1
98	Apellido 98	\N	cliente98@test.com	13100000098	Cliente 98	\N	0990000098	\N	2026-05-06 01:21:35.627	2026-05-06 01:21:35.627	\N	t	f	f	1
99	Apellido 99	\N	cliente99@test.com	13100000099	Cliente 99	\N	0990000099	\N	2026-05-06 01:21:35.628	2026-05-06 01:21:35.628	\N	t	f	f	1
100	Apellido 100	\N	cliente100@test.com	13100000100	Cliente 100	\N	0990000100	\N	2026-05-06 01:21:35.63	2026-05-06 01:21:35.63	\N	t	f	f	1
101	Apellido 101	\N	cliente101@test.com	13100000101	Cliente 101	\N	0990000101	\N	2026-05-06 01:21:35.631	2026-05-06 01:21:35.631	\N	t	f	f	1
102	Apellido 102	\N	cliente102@test.com	13100000102	Cliente 102	\N	0990000102	\N	2026-05-06 01:21:35.632	2026-05-06 01:21:35.632	\N	t	f	f	1
103	Apellido 103	\N	cliente103@test.com	13100000103	Cliente 103	\N	0990000103	\N	2026-05-06 01:21:35.633	2026-05-06 01:21:35.633	\N	t	f	f	1
\.


--
-- Data for Name: comunidades; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.comunidades (comunidad_id, nombre, codigo, porcentaje_tasa_seguridad, actualizado_en, creado_en, borrado_en) FROM stdin;
1	Olon	001	5.00	2026-05-06 01:21:35.377	2026-05-06 01:21:35.377	\N
2	Nuñez	002	0.00	2026-05-06 01:21:35.382	2026-05-06 01:21:35.382	\N
3	La Entrada	003	3.00	2026-05-06 01:21:35.388	2026-05-06 01:21:35.388	\N
4	San Jose	004	2.00	2026-05-06 01:21:35.391	2026-05-06 01:21:35.391	\N
5	Curia	005	0.00	2026-05-06 01:21:35.394	2026-05-06 01:21:35.394	\N
\.


--
-- Data for Name: contratos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.contratos (contrato_id, cliente_id, sector_id, categoria_tarifa_id, numero_guia, fecha_inicio, direccion_suministro, estado, creado_en, actualizado_en, borrado_en, creado_por, comunidad_id) FROM stdin;
1	1	1	1	GUIA-OLON-001	2026-05-06 01:21:35.638	Direccion contrato 1	ACTIVO	2026-05-06 01:21:35.638	2026-05-06 01:21:35.638	\N	\N	1
2	2	2	1	GUIA-OLON-002	2026-05-06 01:21:35.642	Direccion contrato 2	ACTIVO	2026-05-06 01:21:35.642	2026-05-06 01:21:35.642	\N	\N	1
3	3	\N	1	GUIA-NUNEZ-001	2026-05-06 01:21:35.647	Direccion contrato 3	ACTIVO	2026-05-06 01:21:35.647	2026-05-06 01:21:35.647	\N	\N	2
4	4	\N	2	GUIA-3-0004	2026-05-06 01:21:35.649	Direccion contrato 4	ACTIVO	2026-05-06 01:21:35.649	2026-05-06 01:21:35.649	\N	\N	3
5	5	\N	2	GUIA-4-0005	2026-05-06 01:21:35.651	Direccion contrato 5	ACTIVO	2026-05-06 01:21:35.651	2026-05-06 01:21:35.651	\N	\N	4
6	6	\N	2	GUIA-3-0006	2026-05-06 01:21:35.653	Direccion contrato 6	ACTIVO	2026-05-06 01:21:35.653	2026-05-06 01:21:35.653	\N	\N	3
7	7	\N	1	GUIA-3-0007	2026-05-06 01:21:35.655	Direccion contrato 7	ACTIVO	2026-05-06 01:21:35.655	2026-05-06 01:21:35.655	\N	\N	3
8	8	\N	1	GUIA-2-0008	2026-05-06 01:21:35.656	Direccion contrato 8	ACTIVO	2026-05-06 01:21:35.656	2026-05-06 01:21:35.656	\N	\N	2
9	9	\N	3	GUIA-3-0009	2026-05-06 01:21:35.658	Direccion contrato 9	ACTIVO	2026-05-06 01:21:35.658	2026-05-06 01:21:35.658	\N	\N	3
10	10	2	1	GUIA-1-0010	2026-05-06 01:21:35.661	Direccion contrato 10	ACTIVO	2026-05-06 01:21:35.661	2026-05-06 01:21:35.661	\N	\N	1
11	11	\N	3	GUIA-3-0011	2026-05-06 01:21:35.662	Direccion contrato 11	ACTIVO	2026-05-06 01:21:35.662	2026-05-06 01:21:35.662	\N	\N	3
12	12	\N	3	GUIA-5-0012	2026-05-06 01:21:35.664	Direccion contrato 12	ACTIVO	2026-05-06 01:21:35.664	2026-05-06 01:21:35.664	\N	\N	5
13	13	\N	2	GUIA-2-0013	2026-05-06 01:21:35.665	Direccion contrato 13	ACTIVO	2026-05-06 01:21:35.665	2026-05-06 01:21:35.665	\N	\N	2
14	14	2	3	GUIA-1-0014	2026-05-06 01:21:35.667	Direccion contrato 14	ACTIVO	2026-05-06 01:21:35.667	2026-05-06 01:21:35.667	\N	\N	1
15	15	2	1	GUIA-1-0015	2026-05-06 01:21:35.669	Direccion contrato 15	ACTIVO	2026-05-06 01:21:35.669	2026-05-06 01:21:35.669	\N	\N	1
16	16	\N	2	GUIA-5-0016	2026-05-06 01:21:35.67	Direccion contrato 16	ACTIVO	2026-05-06 01:21:35.67	2026-05-06 01:21:35.67	\N	\N	5
17	17	4	1	GUIA-1-0017	2026-05-06 01:21:35.672	Direccion contrato 17	ACTIVO	2026-05-06 01:21:35.672	2026-05-06 01:21:35.672	\N	\N	1
18	18	1	3	GUIA-1-0018	2026-05-06 01:21:35.674	Direccion contrato 18	ACTIVO	2026-05-06 01:21:35.674	2026-05-06 01:21:35.674	\N	\N	1
19	19	\N	3	GUIA-3-0019	2026-05-06 01:21:35.676	Direccion contrato 19	ACTIVO	2026-05-06 01:21:35.676	2026-05-06 01:21:35.676	\N	\N	3
20	20	\N	3	GUIA-2-0020	2026-05-06 01:21:35.677	Direccion contrato 20	ACTIVO	2026-05-06 01:21:35.677	2026-05-06 01:21:35.677	\N	\N	2
21	21	\N	1	GUIA-5-0021	2026-05-06 01:21:35.679	Direccion contrato 21	ACTIVO	2026-05-06 01:21:35.679	2026-05-06 01:21:35.679	\N	\N	5
22	22	\N	3	GUIA-4-0022	2026-05-06 01:21:35.681	Direccion contrato 22	ACTIVO	2026-05-06 01:21:35.681	2026-05-06 01:21:35.681	\N	\N	4
23	23	\N	1	GUIA-4-0023	2026-05-06 01:21:35.682	Direccion contrato 23	ACTIVO	2026-05-06 01:21:35.682	2026-05-06 01:21:35.682	\N	\N	4
24	24	\N	3	GUIA-2-0024	2026-05-06 01:21:35.684	Direccion contrato 24	ACTIVO	2026-05-06 01:21:35.684	2026-05-06 01:21:35.684	\N	\N	2
25	25	\N	2	GUIA-5-0025	2026-05-06 01:21:35.685	Direccion contrato 25	ACTIVO	2026-05-06 01:21:35.685	2026-05-06 01:21:35.685	\N	\N	5
26	26	2	1	GUIA-1-0026	2026-05-06 01:21:35.687	Direccion contrato 26	ACTIVO	2026-05-06 01:21:35.687	2026-05-06 01:21:35.687	\N	\N	1
27	27	\N	2	GUIA-2-0027	2026-05-06 01:21:35.689	Direccion contrato 27	ACTIVO	2026-05-06 01:21:35.689	2026-05-06 01:21:35.689	\N	\N	2
28	28	1	2	GUIA-1-0028	2026-05-06 01:21:35.691	Direccion contrato 28	ACTIVO	2026-05-06 01:21:35.691	2026-05-06 01:21:35.691	\N	\N	1
29	29	\N	3	GUIA-5-0029	2026-05-06 01:21:35.693	Direccion contrato 29	ACTIVO	2026-05-06 01:21:35.693	2026-05-06 01:21:35.693	\N	\N	5
30	30	\N	3	GUIA-3-0030	2026-05-06 01:21:35.695	Direccion contrato 30	ACTIVO	2026-05-06 01:21:35.695	2026-05-06 01:21:35.695	\N	\N	3
31	31	\N	1	GUIA-5-0031	2026-05-06 01:21:35.697	Direccion contrato 31	ACTIVO	2026-05-06 01:21:35.697	2026-05-06 01:21:35.697	\N	\N	5
32	32	\N	2	GUIA-5-0032	2026-05-06 01:21:35.699	Direccion contrato 32	ACTIVO	2026-05-06 01:21:35.699	2026-05-06 01:21:35.699	\N	\N	5
33	33	\N	2	GUIA-5-0033	2026-05-06 01:21:35.701	Direccion contrato 33	ACTIVO	2026-05-06 01:21:35.701	2026-05-06 01:21:35.701	\N	\N	5
34	34	\N	3	GUIA-3-0034	2026-05-06 01:21:35.703	Direccion contrato 34	ACTIVO	2026-05-06 01:21:35.703	2026-05-06 01:21:35.703	\N	\N	3
35	35	\N	2	GUIA-5-0035	2026-05-06 01:21:35.705	Direccion contrato 35	ACTIVO	2026-05-06 01:21:35.705	2026-05-06 01:21:35.705	\N	\N	5
36	36	\N	3	GUIA-5-0036	2026-05-06 01:21:35.707	Direccion contrato 36	ACTIVO	2026-05-06 01:21:35.707	2026-05-06 01:21:35.707	\N	\N	5
37	37	4	2	GUIA-1-0037	2026-05-06 01:21:35.709	Direccion contrato 37	ACTIVO	2026-05-06 01:21:35.709	2026-05-06 01:21:35.709	\N	\N	1
38	38	\N	2	GUIA-3-0038	2026-05-06 01:21:35.711	Direccion contrato 38	ACTIVO	2026-05-06 01:21:35.711	2026-05-06 01:21:35.711	\N	\N	3
39	39	\N	3	GUIA-5-0039	2026-05-06 01:21:35.712	Direccion contrato 39	ACTIVO	2026-05-06 01:21:35.712	2026-05-06 01:21:35.712	\N	\N	5
40	40	\N	3	GUIA-4-0040	2026-05-06 01:21:35.714	Direccion contrato 40	ACTIVO	2026-05-06 01:21:35.714	2026-05-06 01:21:35.714	\N	\N	4
41	41	\N	1	GUIA-5-0041	2026-05-06 01:21:35.716	Direccion contrato 41	ACTIVO	2026-05-06 01:21:35.716	2026-05-06 01:21:35.716	\N	\N	5
42	42	\N	2	GUIA-5-0042	2026-05-06 01:21:35.718	Direccion contrato 42	ACTIVO	2026-05-06 01:21:35.718	2026-05-06 01:21:35.718	\N	\N	5
43	43	4	2	GUIA-1-0043	2026-05-06 01:21:35.721	Direccion contrato 43	ACTIVO	2026-05-06 01:21:35.721	2026-05-06 01:21:35.721	\N	\N	1
44	44	2	2	GUIA-1-0044	2026-05-06 01:21:35.724	Direccion contrato 44	ACTIVO	2026-05-06 01:21:35.724	2026-05-06 01:21:35.724	\N	\N	1
45	45	2	2	GUIA-1-0045	2026-05-06 01:21:35.726	Direccion contrato 45	ACTIVO	2026-05-06 01:21:35.726	2026-05-06 01:21:35.726	\N	\N	1
46	46	\N	1	GUIA-5-0046	2026-05-06 01:21:35.729	Direccion contrato 46	ACTIVO	2026-05-06 01:21:35.729	2026-05-06 01:21:35.729	\N	\N	5
47	47	3	3	GUIA-1-0047	2026-05-06 01:21:35.731	Direccion contrato 47	ACTIVO	2026-05-06 01:21:35.731	2026-05-06 01:21:35.731	\N	\N	1
48	48	\N	3	GUIA-3-0048	2026-05-06 01:21:35.732	Direccion contrato 48	ACTIVO	2026-05-06 01:21:35.732	2026-05-06 01:21:35.732	\N	\N	3
49	49	3	3	GUIA-1-0049	2026-05-06 01:21:35.735	Direccion contrato 49	ACTIVO	2026-05-06 01:21:35.735	2026-05-06 01:21:35.735	\N	\N	1
50	50	\N	2	GUIA-5-0050	2026-05-06 01:21:35.737	Direccion contrato 50	ACTIVO	2026-05-06 01:21:35.737	2026-05-06 01:21:35.737	\N	\N	5
\.


--
-- Data for Name: convenios; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.convenios (convenio_id, numero_cuotas, abono_inicial, contrato_id, deuda_total, dias_mora_actual, estado_convenio, fecha_aprobacion, fecha_primer_pago, fecha_proximo_pago, monto_pagado_actual, motivo, actualizado_en, creado_en, borrado_en) FROM stdin;
\.


--
-- Data for Name: cuota_convenio; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.cuota_convenio (cuota_convenio_id, convenio_id, numero_cuota, valor_cuota, fecha_vencimiento, estado_convenio, fecha_pago, monto_pagado, dias_retraso, interes_mora_aplicado, pago_completo, fecha_pago_anticipado, creado_en, actualizado_en, borrado_en, saldo_pendiente) FROM stdin;
\.


--
-- Data for Name: descuento_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.descuento_detalle (descuento_detalle_id, monto_descontado, motivo, autorizado_por, creado_en, catalogo_descuento_id, es_porcentaje, valor_applied, prefactura_detalle_id) FROM stdin;
1	2.5000	\N	\N	2026-05-06 01:21:37.174	1	t	50.0000	1
\.


--
-- Data for Name: detalle_pago; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.detalle_pago (detalle_pago_id, pago_id, factura_id, cuota_convenio_id, tipo_pago, monto_abonado, creado_en, borrado_en, fecha_transaccion, forma_pago_id, referencia, nota_debito_id) FROM stdin;
\.


--
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.empresa (empresa_id, ruc, razon_social, nombre_comercial, direccion_matriz, obligado_contabilidad, contribuyente_especial, agente_retencion, regimen, logotipo_url, ambiente, tipo_emision, certificado_p12, password_certificado, creado_en, actualizado_en) FROM stdin;
1	2490012345001	JUNTA ADMINISTRADORA DE AGUA POTABLE OLON	JAAP OLON	Calle Principal Olón	f	\N	\N	\N	\N	PRUEBAS	1	\N	\N	2026-05-06 01:21:35.331	2026-05-06 01:21:35.331
\.


--
-- Data for Name: establecimientos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.establecimientos (establecimiento_id, empresa_id, codigo, nombre, direccion, creado_en, actualizado_en) FROM stdin;
1	1	001	OFICINA CENTRAL OLON	Calle Principal Olón	2026-05-06 01:21:35.34	2026-05-06 01:21:35.34
\.


--
-- Data for Name: estado_lote; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.estado_lote (estado_id, codigo, nombre, activo, orden, actualizado_en, creado_en, borrado_en) FROM stdin;
1	BORRADOR	Borrador	t	1	2026-05-06 01:21:35.453	2026-05-06 01:21:35.453	\N
2	DEFINITIVO	Definitivo	t	2	2026-05-06 01:21:35.456	2026-05-06 01:21:35.456	\N
3	ENVIADO	Enviado	t	3	2026-05-06 01:21:35.459	2026-05-06 01:21:35.459	\N
\.


--
-- Data for Name: estado_medidor; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.estado_medidor (estado_id, codigo, nombre, activo, orden, actualizado_en, creado_en, borrado_en) FROM stdin;
1	BODEGA	En Bodega	t	1	2026-05-06 01:21:35.438	2026-05-06 01:21:35.438	\N
2	INSTALADO	Instalado	t	2	2026-05-06 01:21:35.438	2026-05-06 01:21:35.438	\N
3	DANADO	Dañado	t	3	2026-05-06 01:21:35.438	2026-05-06 01:21:35.438	\N
4	PENDIENTE	Pendiente	t	4	2026-05-06 01:21:35.438	2026-05-06 01:21:35.438	\N
5	BAJA	Dado de Baja	t	5	2026-05-06 01:21:35.438	2026-05-06 01:21:35.438	\N
\.


--
-- Data for Name: facturas; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.facturas (factura_id, uuid, prefactura_id, tipo_comprobante_id, saldo_pendiente, clave_acceso, secuencial, numero_autorizacion, enviado_sri, fecha_enviado_sri, pdf_url, respuesta_sri, estado_sri, estado_pago, fecha_emision, fecha_vencimiento, creado_por, actualizado_por, creado_en, actualizado_en, borrado_en, xml_autorizado_url, xml_firmado_url, anulado_por, fecha_anulacion, motivo_anulacion, total) FROM stdin;
\.


--
-- Data for Name: historial_medidores; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.historial_medidores (historial_id, medidor_id, contrato_id, fecha_desde, fecha_hasta, lectura_inicial_historial, lectura_final_historial, motivo, observacion, creado_en, actualizado_en, saldo_pendiente_cambio) FROM stdin;
\.


--
-- Data for Name: identificacion; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.identificacion (identificacion_id, codigo, nombre, activo, orden, actualizado_en, creado_en) FROM stdin;
1	CEDULA	Cédula de Identidad	t	1	2026-05-06 01:21:35.425	2026-05-06 01:21:35.425
2	RUC	RUC	t	2	2026-05-06 01:21:35.43	2026-05-06 01:21:35.43
3	PASAPORTE	Pasaporte	t	3	2026-05-06 01:21:35.432	2026-05-06 01:21:35.432
4	CONSUMIDOR_FINAL	Consumidor Final	t	4	2026-05-06 01:21:35.434	2026-05-06 01:21:35.434
5	IDENTIFICACION_EXTRANJERA	Identificación Extranjera	t	5	2026-05-06 01:21:35.437	2026-05-06 01:21:35.437
\.


--
-- Data for Name: lectura_anomalia; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.lectura_anomalia (anomalia_id, lectura_id, observacion, tipo, estado, creado_en, actualizado_en, borrado_en, foto_url_minio) FROM stdin;
\.


--
-- Data for Name: lecturas; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.lecturas (lectura_id, fecha, lectura_anterior, lectura_actual, consumo_calculado, borrado_en, contrato_id, creado_en, fecha_validacion, foto_url_minio, lectura_inicial, periodo_id, actualizado_en, medidor_id, estado, descripcion_anomalia) FROM stdin;
1	2026-05-06 01:21:35.775	0	27	27	\N	1	2026-05-06 01:21:35.776	\N	\N	t	1	2026-05-06 01:21:35.776	\N	APROBADA	\N
2	2026-05-06 01:21:35.779	27	56	29	\N	1	2026-05-06 01:21:35.78	\N	\N	f	2	2026-05-06 01:21:35.78	\N	APROBADA	\N
3	2026-05-06 01:21:35.782	56	81	25	\N	1	2026-05-06 01:21:35.783	\N	\N	f	3	2026-05-06 01:21:35.783	\N	APROBADA	\N
4	2026-05-06 01:21:35.784	81	108	27	\N	1	2026-05-06 01:21:35.785	\N	\N	f	4	2026-05-06 01:21:35.785	\N	APROBADA	\N
5	2026-05-06 01:21:35.787	108	125	17	\N	1	2026-05-06 01:21:35.787	\N	\N	f	5	2026-05-06 01:21:35.787	\N	APROBADA	\N
6	2026-05-06 01:21:35.789	125	139	14	\N	1	2026-05-06 01:21:35.79	\N	\N	f	6	2026-05-06 01:21:35.79	\N	APROBADA	\N
7	2026-05-06 01:21:35.792	139	151	12	\N	1	2026-05-06 01:21:35.793	\N	\N	f	7	2026-05-06 01:21:35.793	\N	APROBADA	\N
8	2026-05-06 01:21:35.795	151	164	13	\N	1	2026-05-06 01:21:35.796	\N	\N	f	8	2026-05-06 01:21:35.796	\N	APROBADA	\N
9	2026-05-06 01:21:35.797	164	169	5	\N	1	2026-05-06 01:21:35.798	\N	\N	f	9	2026-05-06 01:21:35.798	\N	APROBADA	\N
10	2026-05-06 01:21:35.8	169	192	23	\N	1	2026-05-06 01:21:35.802	\N	\N	f	10	2026-05-06 01:21:35.802	\N	APROBADA	\N
11	2026-05-06 01:21:35.804	192	224	32	\N	1	2026-05-06 01:21:35.804	\N	\N	f	11	2026-05-06 01:21:35.804	\N	APROBADA	\N
12	2026-05-06 01:21:35.806	224	255	31	\N	1	2026-05-06 01:21:35.807	\N	\N	f	12	2026-05-06 01:21:35.807	\N	APROBADA	\N
13	2026-05-06 01:21:35.809	0	22	22	\N	2	2026-05-06 01:21:35.81	\N	\N	t	1	2026-05-06 01:21:35.81	\N	APROBADA	\N
14	2026-05-06 01:21:35.812	22	48	26	\N	2	2026-05-06 01:21:35.813	\N	\N	f	2	2026-05-06 01:21:35.813	\N	APROBADA	\N
15	2026-05-06 01:21:35.815	48	61	13	\N	2	2026-05-06 01:21:35.816	\N	\N	f	3	2026-05-06 01:21:35.816	\N	APROBADA	\N
16	2026-05-06 01:21:35.819	61	73	12	\N	2	2026-05-06 01:21:35.82	\N	\N	f	4	2026-05-06 01:21:35.82	\N	APROBADA	\N
17	2026-05-06 01:21:35.822	73	84	11	\N	2	2026-05-06 01:21:35.822	\N	\N	f	5	2026-05-06 01:21:35.822	\N	APROBADA	\N
18	2026-05-06 01:21:35.824	84	112	28	\N	2	2026-05-06 01:21:35.825	\N	\N	f	6	2026-05-06 01:21:35.825	\N	APROBADA	\N
19	2026-05-06 01:21:35.827	112	119	7	\N	2	2026-05-06 01:21:35.827	\N	\N	f	7	2026-05-06 01:21:35.827	\N	APROBADA	\N
20	2026-05-06 01:21:35.828	119	134	15	\N	2	2026-05-06 01:21:35.829	\N	\N	f	8	2026-05-06 01:21:35.829	\N	APROBADA	\N
21	2026-05-06 01:21:35.831	134	139	5	\N	2	2026-05-06 01:21:35.831	\N	\N	f	9	2026-05-06 01:21:35.831	\N	APROBADA	\N
22	2026-05-06 01:21:35.833	139	163	24	\N	2	2026-05-06 01:21:35.833	\N	\N	f	10	2026-05-06 01:21:35.833	\N	APROBADA	\N
23	2026-05-06 01:21:35.835	163	181	18	\N	2	2026-05-06 01:21:35.835	\N	\N	f	11	2026-05-06 01:21:35.835	\N	APROBADA	\N
24	2026-05-06 01:21:35.836	181	194	13	\N	2	2026-05-06 01:21:35.838	\N	\N	f	12	2026-05-06 01:21:35.838	\N	APROBADA	\N
25	2026-05-06 01:21:35.839	0	11	11	\N	3	2026-05-06 01:21:35.84	\N	\N	t	1	2026-05-06 01:21:35.84	\N	APROBADA	\N
26	2026-05-06 01:21:35.841	11	23	12	\N	3	2026-05-06 01:21:35.842	\N	\N	f	2	2026-05-06 01:21:35.842	\N	APROBADA	\N
27	2026-05-06 01:21:35.844	23	36	13	\N	3	2026-05-06 01:21:35.845	\N	\N	f	3	2026-05-06 01:21:35.845	\N	APROBADA	\N
28	2026-05-06 01:21:35.847	36	49	13	\N	3	2026-05-06 01:21:35.847	\N	\N	f	4	2026-05-06 01:21:35.847	\N	APROBADA	\N
29	2026-05-06 01:21:35.849	49	75	26	\N	3	2026-05-06 01:21:35.851	\N	\N	f	5	2026-05-06 01:21:35.851	\N	APROBADA	\N
30	2026-05-06 01:21:35.852	75	102	27	\N	3	2026-05-06 01:21:35.853	\N	\N	f	6	2026-05-06 01:21:35.853	\N	APROBADA	\N
31	2026-05-06 01:21:35.855	102	107	5	\N	3	2026-05-06 01:21:35.856	\N	\N	f	7	2026-05-06 01:21:35.856	\N	APROBADA	\N
32	2026-05-06 01:21:35.857	107	120	13	\N	3	2026-05-06 01:21:35.858	\N	\N	f	8	2026-05-06 01:21:35.858	\N	APROBADA	\N
33	2026-05-06 01:21:35.859	120	129	9	\N	3	2026-05-06 01:21:35.86	\N	\N	f	9	2026-05-06 01:21:35.86	\N	APROBADA	\N
34	2026-05-06 01:21:35.861	129	149	20	\N	3	2026-05-06 01:21:35.862	\N	\N	f	10	2026-05-06 01:21:35.862	\N	APROBADA	\N
35	2026-05-06 01:21:35.864	149	177	28	\N	3	2026-05-06 01:21:35.865	\N	\N	f	11	2026-05-06 01:21:35.865	\N	APROBADA	\N
36	2026-05-06 01:21:35.867	177	190	13	\N	3	2026-05-06 01:21:35.868	\N	\N	f	12	2026-05-06 01:21:35.868	\N	APROBADA	\N
37	2026-05-06 01:21:35.87	0	13	13	\N	4	2026-05-06 01:21:35.871	\N	\N	t	1	2026-05-06 01:21:35.871	\N	APROBADA	\N
38	2026-05-06 01:21:35.873	13	20	7	\N	4	2026-05-06 01:21:35.874	\N	\N	f	2	2026-05-06 01:21:35.874	\N	APROBADA	\N
39	2026-05-06 01:21:35.876	20	47	27	\N	4	2026-05-06 01:21:35.877	\N	\N	f	3	2026-05-06 01:21:35.877	\N	APROBADA	\N
40	2026-05-06 01:21:35.879	47	66	19	\N	4	2026-05-06 01:21:35.879	\N	\N	f	4	2026-05-06 01:21:35.879	\N	APROBADA	\N
41	2026-05-06 01:21:35.881	66	71	5	\N	4	2026-05-06 01:21:35.882	\N	\N	f	5	2026-05-06 01:21:35.882	\N	APROBADA	\N
42	2026-05-06 01:21:35.884	71	99	28	\N	4	2026-05-06 01:21:35.885	\N	\N	f	6	2026-05-06 01:21:35.885	\N	APROBADA	\N
43	2026-05-06 01:21:35.886	99	121	22	\N	4	2026-05-06 01:21:35.887	\N	\N	f	7	2026-05-06 01:21:35.887	\N	APROBADA	\N
44	2026-05-06 01:21:35.889	121	127	6	\N	4	2026-05-06 01:21:35.89	\N	\N	f	8	2026-05-06 01:21:35.89	\N	APROBADA	\N
45	2026-05-06 01:21:35.892	127	134	7	\N	4	2026-05-06 01:21:35.893	\N	\N	f	9	2026-05-06 01:21:35.893	\N	APROBADA	\N
46	2026-05-06 01:21:35.895	134	155	21	\N	4	2026-05-06 01:21:35.896	\N	\N	f	10	2026-05-06 01:21:35.896	\N	APROBADA	\N
47	2026-05-06 01:21:35.898	155	181	26	\N	4	2026-05-06 01:21:35.899	\N	\N	f	11	2026-05-06 01:21:35.899	\N	APROBADA	\N
48	2026-05-06 01:21:35.901	181	214	33	\N	4	2026-05-06 01:21:35.901	\N	\N	f	12	2026-05-06 01:21:35.901	\N	APROBADA	\N
49	2026-05-06 01:21:35.903	0	24	24	\N	5	2026-05-06 01:21:35.904	\N	\N	t	1	2026-05-06 01:21:35.904	\N	APROBADA	\N
50	2026-05-06 01:21:35.905	24	42	18	\N	5	2026-05-06 01:21:35.906	\N	\N	f	2	2026-05-06 01:21:35.906	\N	APROBADA	\N
51	2026-05-06 01:21:35.908	42	48	6	\N	5	2026-05-06 01:21:35.909	\N	\N	f	3	2026-05-06 01:21:35.909	\N	APROBADA	\N
52	2026-05-06 01:21:35.911	48	59	11	\N	5	2026-05-06 01:21:35.911	\N	\N	f	4	2026-05-06 01:21:35.911	\N	APROBADA	\N
53	2026-05-06 01:21:35.913	59	86	27	\N	5	2026-05-06 01:21:35.914	\N	\N	f	5	2026-05-06 01:21:35.914	\N	APROBADA	\N
54	2026-05-06 01:21:35.916	86	99	13	\N	5	2026-05-06 01:21:35.917	\N	\N	f	6	2026-05-06 01:21:35.917	\N	APROBADA	\N
55	2026-05-06 01:21:35.919	99	122	23	\N	5	2026-05-06 01:21:35.919	\N	\N	f	7	2026-05-06 01:21:35.919	\N	APROBADA	\N
56	2026-05-06 01:21:35.921	122	145	23	\N	5	2026-05-06 01:21:35.922	\N	\N	f	8	2026-05-06 01:21:35.922	\N	APROBADA	\N
57	2026-05-06 01:21:35.924	145	171	26	\N	5	2026-05-06 01:21:35.925	\N	\N	f	9	2026-05-06 01:21:35.925	\N	APROBADA	\N
58	2026-05-06 01:21:35.926	171	176	5	\N	5	2026-05-06 01:21:35.927	\N	\N	f	10	2026-05-06 01:21:35.927	\N	APROBADA	\N
59	2026-05-06 01:21:35.929	176	206	30	\N	5	2026-05-06 01:21:35.929	\N	\N	f	11	2026-05-06 01:21:35.929	\N	APROBADA	\N
60	2026-05-06 01:21:35.931	206	240	34	\N	5	2026-05-06 01:21:35.932	\N	\N	f	12	2026-05-06 01:21:35.932	\N	APROBADA	\N
61	2026-05-06 01:21:35.934	0	19	19	\N	6	2026-05-06 01:21:35.935	\N	\N	t	1	2026-05-06 01:21:35.935	\N	APROBADA	\N
62	2026-05-06 01:21:35.937	19	44	25	\N	6	2026-05-06 01:21:35.938	\N	\N	f	2	2026-05-06 01:21:35.938	\N	APROBADA	\N
63	2026-05-06 01:21:35.94	44	62	18	\N	6	2026-05-06 01:21:35.94	\N	\N	f	3	2026-05-06 01:21:35.94	\N	APROBADA	\N
64	2026-05-06 01:21:35.942	62	90	28	\N	6	2026-05-06 01:21:35.943	\N	\N	f	4	2026-05-06 01:21:35.943	\N	APROBADA	\N
65	2026-05-06 01:21:35.944	90	111	21	\N	6	2026-05-06 01:21:35.945	\N	\N	f	5	2026-05-06 01:21:35.945	\N	APROBADA	\N
66	2026-05-06 01:21:35.947	111	124	13	\N	6	2026-05-06 01:21:35.947	\N	\N	f	6	2026-05-06 01:21:35.947	\N	APROBADA	\N
67	2026-05-06 01:21:35.949	124	144	20	\N	6	2026-05-06 01:21:35.949	\N	\N	f	7	2026-05-06 01:21:35.949	\N	APROBADA	\N
68	2026-05-06 01:21:35.951	144	159	15	\N	6	2026-05-06 01:21:35.952	\N	\N	f	8	2026-05-06 01:21:35.952	\N	APROBADA	\N
69	2026-05-06 01:21:35.954	159	173	14	\N	6	2026-05-06 01:21:35.955	\N	\N	f	9	2026-05-06 01:21:35.955	\N	APROBADA	\N
70	2026-05-06 01:21:35.957	173	184	11	\N	6	2026-05-06 01:21:35.958	\N	\N	f	10	2026-05-06 01:21:35.958	\N	APROBADA	\N
71	2026-05-06 01:21:35.96	184	193	9	\N	6	2026-05-06 01:21:35.96	\N	\N	f	11	2026-05-06 01:21:35.96	\N	APROBADA	\N
72	2026-05-06 01:21:35.962	193	211	18	\N	6	2026-05-06 01:21:35.963	\N	\N	f	12	2026-05-06 01:21:35.963	\N	APROBADA	\N
73	2026-05-06 01:21:35.965	0	34	34	\N	7	2026-05-06 01:21:35.966	\N	\N	t	1	2026-05-06 01:21:35.966	\N	APROBADA	\N
74	2026-05-06 01:21:35.968	34	55	21	\N	7	2026-05-06 01:21:35.968	\N	\N	f	2	2026-05-06 01:21:35.968	\N	APROBADA	\N
75	2026-05-06 01:21:35.971	55	83	28	\N	7	2026-05-06 01:21:35.972	\N	\N	f	3	2026-05-06 01:21:35.972	\N	APROBADA	\N
76	2026-05-06 01:21:35.974	83	104	21	\N	7	2026-05-06 01:21:35.975	\N	\N	f	4	2026-05-06 01:21:35.975	\N	APROBADA	\N
77	2026-05-06 01:21:35.977	104	115	11	\N	7	2026-05-06 01:21:35.977	\N	\N	f	5	2026-05-06 01:21:35.977	\N	APROBADA	\N
78	2026-05-06 01:21:35.979	115	140	25	\N	7	2026-05-06 01:21:35.98	\N	\N	f	6	2026-05-06 01:21:35.98	\N	APROBADA	\N
79	2026-05-06 01:21:35.981	140	151	11	\N	7	2026-05-06 01:21:35.982	\N	\N	f	7	2026-05-06 01:21:35.982	\N	APROBADA	\N
80	2026-05-06 01:21:35.983	151	167	16	\N	7	2026-05-06 01:21:35.984	\N	\N	f	8	2026-05-06 01:21:35.984	\N	APROBADA	\N
81	2026-05-06 01:21:35.985	167	180	13	\N	7	2026-05-06 01:21:35.987	\N	\N	f	9	2026-05-06 01:21:35.987	\N	APROBADA	\N
82	2026-05-06 01:21:35.988	180	192	12	\N	7	2026-05-06 01:21:35.989	\N	\N	f	10	2026-05-06 01:21:35.989	\N	APROBADA	\N
83	2026-05-06 01:21:35.99	192	213	21	\N	7	2026-05-06 01:21:35.991	\N	\N	f	11	2026-05-06 01:21:35.991	\N	APROBADA	\N
84	2026-05-06 01:21:35.993	213	227	14	\N	7	2026-05-06 01:21:35.994	\N	\N	f	12	2026-05-06 01:21:35.994	\N	APROBADA	\N
85	2026-05-06 01:21:35.996	0	14	14	\N	8	2026-05-06 01:21:35.996	\N	\N	t	1	2026-05-06 01:21:35.996	\N	APROBADA	\N
86	2026-05-06 01:21:35.998	14	44	30	\N	8	2026-05-06 01:21:35.999	\N	\N	f	2	2026-05-06 01:21:35.999	\N	APROBADA	\N
87	2026-05-06 01:21:36.002	44	76	32	\N	8	2026-05-06 01:21:36.003	\N	\N	f	3	2026-05-06 01:21:36.003	\N	APROBADA	\N
88	2026-05-06 01:21:36.005	76	101	25	\N	8	2026-05-06 01:21:36.006	\N	\N	f	4	2026-05-06 01:21:36.006	\N	APROBADA	\N
89	2026-05-06 01:21:36.008	101	107	6	\N	8	2026-05-06 01:21:36.008	\N	\N	f	5	2026-05-06 01:21:36.008	\N	APROBADA	\N
90	2026-05-06 01:21:36.01	107	141	34	\N	8	2026-05-06 01:21:36.011	\N	\N	f	6	2026-05-06 01:21:36.011	\N	APROBADA	\N
91	2026-05-06 01:21:36.012	141	149	8	\N	8	2026-05-06 01:21:36.013	\N	\N	f	7	2026-05-06 01:21:36.013	\N	APROBADA	\N
92	2026-05-06 01:21:36.015	149	179	30	\N	8	2026-05-06 01:21:36.016	\N	\N	f	8	2026-05-06 01:21:36.016	\N	APROBADA	\N
93	2026-05-06 01:21:36.018	179	190	11	\N	8	2026-05-06 01:21:36.019	\N	\N	f	9	2026-05-06 01:21:36.019	\N	APROBADA	\N
94	2026-05-06 01:21:36.021	190	196	6	\N	8	2026-05-06 01:21:36.022	\N	\N	f	10	2026-05-06 01:21:36.022	\N	APROBADA	\N
95	2026-05-06 01:21:36.024	196	214	18	\N	8	2026-05-06 01:21:36.024	\N	\N	f	11	2026-05-06 01:21:36.024	\N	APROBADA	\N
96	2026-05-06 01:21:36.026	214	241	27	\N	8	2026-05-06 01:21:36.027	\N	\N	f	12	2026-05-06 01:21:36.027	\N	APROBADA	\N
97	2026-05-06 01:21:36.029	0	24	24	\N	9	2026-05-06 01:21:36.029	\N	\N	t	1	2026-05-06 01:21:36.029	\N	APROBADA	\N
98	2026-05-06 01:21:36.031	24	36	12	\N	9	2026-05-06 01:21:36.031	\N	\N	f	2	2026-05-06 01:21:36.031	\N	APROBADA	\N
99	2026-05-06 01:21:36.033	36	42	6	\N	9	2026-05-06 01:21:36.034	\N	\N	f	3	2026-05-06 01:21:36.034	\N	APROBADA	\N
100	2026-05-06 01:21:36.036	42	75	33	\N	9	2026-05-06 01:21:36.036	\N	\N	f	4	2026-05-06 01:21:36.036	\N	APROBADA	\N
101	2026-05-06 01:21:36.038	75	89	14	\N	9	2026-05-06 01:21:36.039	\N	\N	f	5	2026-05-06 01:21:36.039	\N	APROBADA	\N
102	2026-05-06 01:21:36.04	89	97	8	\N	9	2026-05-06 01:21:36.041	\N	\N	f	6	2026-05-06 01:21:36.041	\N	APROBADA	\N
103	2026-05-06 01:21:36.043	97	124	27	\N	9	2026-05-06 01:21:36.044	\N	\N	f	7	2026-05-06 01:21:36.044	\N	APROBADA	\N
104	2026-05-06 01:21:36.045	124	141	17	\N	9	2026-05-06 01:21:36.046	\N	\N	f	8	2026-05-06 01:21:36.046	\N	APROBADA	\N
105	2026-05-06 01:21:36.048	141	163	22	\N	9	2026-05-06 01:21:36.049	\N	\N	f	9	2026-05-06 01:21:36.049	\N	APROBADA	\N
106	2026-05-06 01:21:36.051	163	182	19	\N	9	2026-05-06 01:21:36.051	\N	\N	f	10	2026-05-06 01:21:36.051	\N	APROBADA	\N
107	2026-05-06 01:21:36.053	182	187	5	\N	9	2026-05-06 01:21:36.054	\N	\N	f	11	2026-05-06 01:21:36.054	\N	APROBADA	\N
108	2026-05-06 01:21:36.056	187	196	9	\N	9	2026-05-06 01:21:36.056	\N	\N	f	12	2026-05-06 01:21:36.056	\N	APROBADA	\N
109	2026-05-06 01:21:36.058	0	26	26	\N	10	2026-05-06 01:21:36.059	\N	\N	t	1	2026-05-06 01:21:36.059	\N	APROBADA	\N
110	2026-05-06 01:21:36.061	26	47	21	\N	10	2026-05-06 01:21:36.062	\N	\N	f	2	2026-05-06 01:21:36.062	\N	APROBADA	\N
111	2026-05-06 01:21:36.063	47	80	33	\N	10	2026-05-06 01:21:36.064	\N	\N	f	3	2026-05-06 01:21:36.064	\N	APROBADA	\N
112	2026-05-06 01:21:36.067	80	98	18	\N	10	2026-05-06 01:21:36.067	\N	\N	f	4	2026-05-06 01:21:36.067	\N	APROBADA	\N
113	2026-05-06 01:21:36.069	98	125	27	\N	10	2026-05-06 01:21:36.07	\N	\N	f	5	2026-05-06 01:21:36.07	\N	APROBADA	\N
114	2026-05-06 01:21:36.072	125	134	9	\N	10	2026-05-06 01:21:36.072	\N	\N	f	6	2026-05-06 01:21:36.072	\N	APROBADA	\N
115	2026-05-06 01:21:36.074	134	140	6	\N	10	2026-05-06 01:21:36.075	\N	\N	f	7	2026-05-06 01:21:36.075	\N	APROBADA	\N
116	2026-05-06 01:21:36.077	140	158	18	\N	10	2026-05-06 01:21:36.077	\N	\N	f	8	2026-05-06 01:21:36.077	\N	APROBADA	\N
117	2026-05-06 01:21:36.079	158	175	17	\N	10	2026-05-06 01:21:36.079	\N	\N	f	9	2026-05-06 01:21:36.079	\N	APROBADA	\N
118	2026-05-06 01:21:36.081	175	205	30	\N	10	2026-05-06 01:21:36.081	\N	\N	f	10	2026-05-06 01:21:36.081	\N	APROBADA	\N
119	2026-05-06 01:21:36.083	205	217	12	\N	10	2026-05-06 01:21:36.084	\N	\N	f	11	2026-05-06 01:21:36.084	\N	APROBADA	\N
120	2026-05-06 01:21:36.086	217	239	22	\N	10	2026-05-06 01:21:36.087	\N	\N	f	12	2026-05-06 01:21:36.087	\N	APROBADA	\N
121	2026-05-06 01:21:36.089	0	22	22	\N	11	2026-05-06 01:21:36.089	\N	\N	t	1	2026-05-06 01:21:36.089	\N	APROBADA	\N
122	2026-05-06 01:21:36.091	22	46	24	\N	11	2026-05-06 01:21:36.092	\N	\N	f	2	2026-05-06 01:21:36.092	\N	APROBADA	\N
123	2026-05-06 01:21:36.093	46	72	26	\N	11	2026-05-06 01:21:36.094	\N	\N	f	3	2026-05-06 01:21:36.094	\N	APROBADA	\N
124	2026-05-06 01:21:36.095	72	106	34	\N	11	2026-05-06 01:21:36.096	\N	\N	f	4	2026-05-06 01:21:36.096	\N	APROBADA	\N
125	2026-05-06 01:21:36.098	106	128	22	\N	11	2026-05-06 01:21:36.099	\N	\N	f	5	2026-05-06 01:21:36.099	\N	APROBADA	\N
126	2026-05-06 01:21:36.101	128	139	11	\N	11	2026-05-06 01:21:36.101	\N	\N	f	6	2026-05-06 01:21:36.101	\N	APROBADA	\N
127	2026-05-06 01:21:36.103	139	157	18	\N	11	2026-05-06 01:21:36.104	\N	\N	f	7	2026-05-06 01:21:36.104	\N	APROBADA	\N
128	2026-05-06 01:21:36.106	157	183	26	\N	11	2026-05-06 01:21:36.107	\N	\N	f	8	2026-05-06 01:21:36.107	\N	APROBADA	\N
129	2026-05-06 01:21:36.109	183	196	13	\N	11	2026-05-06 01:21:36.109	\N	\N	f	9	2026-05-06 01:21:36.109	\N	APROBADA	\N
130	2026-05-06 01:21:36.111	196	211	15	\N	11	2026-05-06 01:21:36.112	\N	\N	f	10	2026-05-06 01:21:36.112	\N	APROBADA	\N
131	2026-05-06 01:21:36.113	211	231	20	\N	11	2026-05-06 01:21:36.113	\N	\N	f	11	2026-05-06 01:21:36.113	\N	APROBADA	\N
132	2026-05-06 01:21:36.115	231	257	26	\N	11	2026-05-06 01:21:36.115	\N	\N	f	12	2026-05-06 01:21:36.115	\N	APROBADA	\N
133	2026-05-06 01:21:36.117	0	30	30	\N	12	2026-05-06 01:21:36.118	\N	\N	t	1	2026-05-06 01:21:36.118	\N	APROBADA	\N
134	2026-05-06 01:21:36.12	30	38	8	\N	12	2026-05-06 01:21:36.12	\N	\N	f	2	2026-05-06 01:21:36.12	\N	APROBADA	\N
135	2026-05-06 01:21:36.122	38	68	30	\N	12	2026-05-06 01:21:36.123	\N	\N	f	3	2026-05-06 01:21:36.123	\N	APROBADA	\N
136	2026-05-06 01:21:36.125	68	100	32	\N	12	2026-05-06 01:21:36.126	\N	\N	f	4	2026-05-06 01:21:36.126	\N	APROBADA	\N
137	2026-05-06 01:21:36.127	100	129	29	\N	12	2026-05-06 01:21:36.128	\N	\N	f	5	2026-05-06 01:21:36.128	\N	APROBADA	\N
138	2026-05-06 01:21:36.129	129	150	21	\N	12	2026-05-06 01:21:36.13	\N	\N	f	6	2026-05-06 01:21:36.13	\N	APROBADA	\N
139	2026-05-06 01:21:36.131	150	166	16	\N	12	2026-05-06 01:21:36.132	\N	\N	f	7	2026-05-06 01:21:36.132	\N	APROBADA	\N
140	2026-05-06 01:21:36.134	166	198	32	\N	12	2026-05-06 01:21:36.134	\N	\N	f	8	2026-05-06 01:21:36.134	\N	APROBADA	\N
141	2026-05-06 01:21:36.136	198	230	32	\N	12	2026-05-06 01:21:36.137	\N	\N	f	9	2026-05-06 01:21:36.137	\N	APROBADA	\N
142	2026-05-06 01:21:36.138	230	253	23	\N	12	2026-05-06 01:21:36.139	\N	\N	f	10	2026-05-06 01:21:36.139	\N	APROBADA	\N
143	2026-05-06 01:21:36.141	253	267	14	\N	12	2026-05-06 01:21:36.141	\N	\N	f	11	2026-05-06 01:21:36.141	\N	APROBADA	\N
144	2026-05-06 01:21:36.143	267	290	23	\N	12	2026-05-06 01:21:36.143	\N	\N	f	12	2026-05-06 01:21:36.143	\N	APROBADA	\N
145	2026-05-06 01:21:36.145	0	33	33	\N	13	2026-05-06 01:21:36.145	\N	\N	t	1	2026-05-06 01:21:36.145	\N	APROBADA	\N
146	2026-05-06 01:21:36.147	33	64	31	\N	13	2026-05-06 01:21:36.148	\N	\N	f	2	2026-05-06 01:21:36.148	\N	APROBADA	\N
147	2026-05-06 01:21:36.15	64	82	18	\N	13	2026-05-06 01:21:36.151	\N	\N	f	3	2026-05-06 01:21:36.151	\N	APROBADA	\N
148	2026-05-06 01:21:36.153	82	109	27	\N	13	2026-05-06 01:21:36.154	\N	\N	f	4	2026-05-06 01:21:36.154	\N	APROBADA	\N
149	2026-05-06 01:21:36.155	109	121	12	\N	13	2026-05-06 01:21:36.156	\N	\N	f	5	2026-05-06 01:21:36.156	\N	APROBADA	\N
150	2026-05-06 01:21:36.157	121	155	34	\N	13	2026-05-06 01:21:36.158	\N	\N	f	6	2026-05-06 01:21:36.158	\N	APROBADA	\N
151	2026-05-06 01:21:36.16	155	170	15	\N	13	2026-05-06 01:21:36.16	\N	\N	f	7	2026-05-06 01:21:36.16	\N	APROBADA	\N
152	2026-05-06 01:21:36.162	170	204	34	\N	13	2026-05-06 01:21:36.162	\N	\N	f	8	2026-05-06 01:21:36.162	\N	APROBADA	\N
153	2026-05-06 01:21:36.163	204	228	24	\N	13	2026-05-06 01:21:36.164	\N	\N	f	9	2026-05-06 01:21:36.164	\N	APROBADA	\N
154	2026-05-06 01:21:36.165	228	246	18	\N	13	2026-05-06 01:21:36.166	\N	\N	f	10	2026-05-06 01:21:36.166	\N	APROBADA	\N
155	2026-05-06 01:21:36.168	246	254	8	\N	13	2026-05-06 01:21:36.169	\N	\N	f	11	2026-05-06 01:21:36.169	\N	APROBADA	\N
156	2026-05-06 01:21:36.171	254	285	31	\N	13	2026-05-06 01:21:36.172	\N	\N	f	12	2026-05-06 01:21:36.172	\N	APROBADA	\N
157	2026-05-06 01:21:36.174	0	23	23	\N	14	2026-05-06 01:21:36.174	\N	\N	t	1	2026-05-06 01:21:36.174	\N	APROBADA	\N
158	2026-05-06 01:21:36.176	23	39	16	\N	14	2026-05-06 01:21:36.176	\N	\N	f	2	2026-05-06 01:21:36.176	\N	APROBADA	\N
159	2026-05-06 01:21:36.178	39	59	20	\N	14	2026-05-06 01:21:36.179	\N	\N	f	3	2026-05-06 01:21:36.179	\N	APROBADA	\N
160	2026-05-06 01:21:36.18	59	93	34	\N	14	2026-05-06 01:21:36.181	\N	\N	f	4	2026-05-06 01:21:36.181	\N	APROBADA	\N
161	2026-05-06 01:21:36.183	93	98	5	\N	14	2026-05-06 01:21:36.184	\N	\N	f	5	2026-05-06 01:21:36.184	\N	APROBADA	\N
162	2026-05-06 01:21:36.185	98	119	21	\N	14	2026-05-06 01:21:36.186	\N	\N	f	6	2026-05-06 01:21:36.186	\N	APROBADA	\N
163	2026-05-06 01:21:36.188	119	147	28	\N	14	2026-05-06 01:21:36.189	\N	\N	f	7	2026-05-06 01:21:36.189	\N	APROBADA	\N
164	2026-05-06 01:21:36.191	147	163	16	\N	14	2026-05-06 01:21:36.192	\N	\N	f	8	2026-05-06 01:21:36.192	\N	APROBADA	\N
165	2026-05-06 01:21:36.194	163	191	28	\N	14	2026-05-06 01:21:36.194	\N	\N	f	9	2026-05-06 01:21:36.194	\N	APROBADA	\N
166	2026-05-06 01:21:36.196	191	199	8	\N	14	2026-05-06 01:21:36.196	\N	\N	f	10	2026-05-06 01:21:36.196	\N	APROBADA	\N
167	2026-05-06 01:21:36.198	199	214	15	\N	14	2026-05-06 01:21:36.199	\N	\N	f	11	2026-05-06 01:21:36.199	\N	APROBADA	\N
168	2026-05-06 01:21:36.201	214	241	27	\N	14	2026-05-06 01:21:36.201	\N	\N	f	12	2026-05-06 01:21:36.201	\N	APROBADA	\N
169	2026-05-06 01:21:36.203	0	15	15	\N	15	2026-05-06 01:21:36.204	\N	\N	t	1	2026-05-06 01:21:36.204	\N	APROBADA	\N
170	2026-05-06 01:21:36.205	15	35	20	\N	15	2026-05-06 01:21:36.206	\N	\N	f	2	2026-05-06 01:21:36.206	\N	APROBADA	\N
171	2026-05-06 01:21:36.208	35	50	15	\N	15	2026-05-06 01:21:36.209	\N	\N	f	3	2026-05-06 01:21:36.209	\N	APROBADA	\N
172	2026-05-06 01:21:36.21	50	66	16	\N	15	2026-05-06 01:21:36.211	\N	\N	f	4	2026-05-06 01:21:36.211	\N	APROBADA	\N
173	2026-05-06 01:21:36.212	66	76	10	\N	15	2026-05-06 01:21:36.213	\N	\N	f	5	2026-05-06 01:21:36.213	\N	APROBADA	\N
174	2026-05-06 01:21:36.214	76	105	29	\N	15	2026-05-06 01:21:36.215	\N	\N	f	6	2026-05-06 01:21:36.215	\N	APROBADA	\N
175	2026-05-06 01:21:36.217	105	114	9	\N	15	2026-05-06 01:21:36.217	\N	\N	f	7	2026-05-06 01:21:36.217	\N	APROBADA	\N
176	2026-05-06 01:21:36.219	114	143	29	\N	15	2026-05-06 01:21:36.22	\N	\N	f	8	2026-05-06 01:21:36.22	\N	APROBADA	\N
177	2026-05-06 01:21:36.221	143	176	33	\N	15	2026-05-06 01:21:36.222	\N	\N	f	9	2026-05-06 01:21:36.222	\N	APROBADA	\N
178	2026-05-06 01:21:36.224	176	204	28	\N	15	2026-05-06 01:21:36.224	\N	\N	f	10	2026-05-06 01:21:36.224	\N	APROBADA	\N
179	2026-05-06 01:21:36.225	204	226	22	\N	15	2026-05-06 01:21:36.226	\N	\N	f	11	2026-05-06 01:21:36.226	\N	APROBADA	\N
180	2026-05-06 01:21:36.227	226	253	27	\N	15	2026-05-06 01:21:36.228	\N	\N	f	12	2026-05-06 01:21:36.228	\N	APROBADA	\N
181	2026-05-06 01:21:36.23	0	7	7	\N	16	2026-05-06 01:21:36.23	\N	\N	t	1	2026-05-06 01:21:36.23	\N	APROBADA	\N
182	2026-05-06 01:21:36.232	7	32	25	\N	16	2026-05-06 01:21:36.232	\N	\N	f	2	2026-05-06 01:21:36.232	\N	APROBADA	\N
183	2026-05-06 01:21:36.234	32	49	17	\N	16	2026-05-06 01:21:36.235	\N	\N	f	3	2026-05-06 01:21:36.235	\N	APROBADA	\N
184	2026-05-06 01:21:36.237	49	83	34	\N	16	2026-05-06 01:21:36.238	\N	\N	f	4	2026-05-06 01:21:36.238	\N	APROBADA	\N
185	2026-05-06 01:21:36.24	83	96	13	\N	16	2026-05-06 01:21:36.24	\N	\N	f	5	2026-05-06 01:21:36.24	\N	APROBADA	\N
186	2026-05-06 01:21:36.242	96	105	9	\N	16	2026-05-06 01:21:36.243	\N	\N	f	6	2026-05-06 01:21:36.243	\N	APROBADA	\N
187	2026-05-06 01:21:36.244	105	136	31	\N	16	2026-05-06 01:21:36.245	\N	\N	f	7	2026-05-06 01:21:36.245	\N	APROBADA	\N
188	2026-05-06 01:21:36.246	136	142	6	\N	16	2026-05-06 01:21:36.246	\N	\N	f	8	2026-05-06 01:21:36.246	\N	APROBADA	\N
189	2026-05-06 01:21:36.251	142	156	14	\N	16	2026-05-06 01:21:36.251	\N	\N	f	9	2026-05-06 01:21:36.251	\N	APROBADA	\N
190	2026-05-06 01:21:36.253	156	162	6	\N	16	2026-05-06 01:21:36.254	\N	\N	f	10	2026-05-06 01:21:36.254	\N	APROBADA	\N
191	2026-05-06 01:21:36.256	162	181	19	\N	16	2026-05-06 01:21:36.257	\N	\N	f	11	2026-05-06 01:21:36.257	\N	APROBADA	\N
192	2026-05-06 01:21:36.259	181	208	27	\N	16	2026-05-06 01:21:36.259	\N	\N	f	12	2026-05-06 01:21:36.259	\N	APROBADA	\N
193	2026-05-06 01:21:36.261	0	10	10	\N	17	2026-05-06 01:21:36.261	\N	\N	t	1	2026-05-06 01:21:36.261	\N	APROBADA	\N
194	2026-05-06 01:21:36.263	10	34	24	\N	17	2026-05-06 01:21:36.264	\N	\N	f	2	2026-05-06 01:21:36.264	\N	APROBADA	\N
195	2026-05-06 01:21:36.266	34	67	33	\N	17	2026-05-06 01:21:36.267	\N	\N	f	3	2026-05-06 01:21:36.267	\N	APROBADA	\N
196	2026-05-06 01:21:36.269	67	88	21	\N	17	2026-05-06 01:21:36.27	\N	\N	f	4	2026-05-06 01:21:36.27	\N	APROBADA	\N
197	2026-05-06 01:21:36.272	88	107	19	\N	17	2026-05-06 01:21:36.273	\N	\N	f	5	2026-05-06 01:21:36.273	\N	APROBADA	\N
198	2026-05-06 01:21:36.275	107	128	21	\N	17	2026-05-06 01:21:36.276	\N	\N	f	6	2026-05-06 01:21:36.276	\N	APROBADA	\N
199	2026-05-06 01:21:36.277	128	137	9	\N	17	2026-05-06 01:21:36.278	\N	\N	f	7	2026-05-06 01:21:36.278	\N	APROBADA	\N
200	2026-05-06 01:21:36.279	137	149	12	\N	17	2026-05-06 01:21:36.28	\N	\N	f	8	2026-05-06 01:21:36.28	\N	APROBADA	\N
201	2026-05-06 01:21:36.281	149	170	21	\N	17	2026-05-06 01:21:36.282	\N	\N	f	9	2026-05-06 01:21:36.282	\N	APROBADA	\N
202	2026-05-06 01:21:36.283	170	200	30	\N	17	2026-05-06 01:21:36.284	\N	\N	f	10	2026-05-06 01:21:36.284	\N	APROBADA	\N
203	2026-05-06 01:21:36.286	200	211	11	\N	17	2026-05-06 01:21:36.287	\N	\N	f	11	2026-05-06 01:21:36.287	\N	APROBADA	\N
204	2026-05-06 01:21:36.289	211	227	16	\N	17	2026-05-06 01:21:36.29	\N	\N	f	12	2026-05-06 01:21:36.29	\N	APROBADA	\N
205	2026-05-06 01:21:36.292	0	8	8	\N	18	2026-05-06 01:21:36.292	\N	\N	t	1	2026-05-06 01:21:36.292	\N	APROBADA	\N
206	2026-05-06 01:21:36.294	8	20	12	\N	18	2026-05-06 01:21:36.294	\N	\N	f	2	2026-05-06 01:21:36.294	\N	APROBADA	\N
207	2026-05-06 01:21:36.296	20	49	29	\N	18	2026-05-06 01:21:36.296	\N	\N	f	3	2026-05-06 01:21:36.296	\N	APROBADA	\N
208	2026-05-06 01:21:36.298	49	76	27	\N	18	2026-05-06 01:21:36.298	\N	\N	f	4	2026-05-06 01:21:36.298	\N	APROBADA	\N
209	2026-05-06 01:21:36.3	76	96	20	\N	18	2026-05-06 01:21:36.301	\N	\N	f	5	2026-05-06 01:21:36.301	\N	APROBADA	\N
210	2026-05-06 01:21:36.303	96	102	6	\N	18	2026-05-06 01:21:36.304	\N	\N	f	6	2026-05-06 01:21:36.304	\N	APROBADA	\N
211	2026-05-06 01:21:36.305	102	120	18	\N	18	2026-05-06 01:21:36.306	\N	\N	f	7	2026-05-06 01:21:36.306	\N	APROBADA	\N
212	2026-05-06 01:21:36.308	120	125	5	\N	18	2026-05-06 01:21:36.308	\N	\N	f	8	2026-05-06 01:21:36.308	\N	APROBADA	\N
213	2026-05-06 01:21:36.309	125	146	21	\N	18	2026-05-06 01:21:36.31	\N	\N	f	9	2026-05-06 01:21:36.31	\N	APROBADA	\N
214	2026-05-06 01:21:36.311	146	168	22	\N	18	2026-05-06 01:21:36.312	\N	\N	f	10	2026-05-06 01:21:36.312	\N	APROBADA	\N
215	2026-05-06 01:21:36.314	168	180	12	\N	18	2026-05-06 01:21:36.314	\N	\N	f	11	2026-05-06 01:21:36.314	\N	APROBADA	\N
216	2026-05-06 01:21:36.316	180	196	16	\N	18	2026-05-06 01:21:36.317	\N	\N	f	12	2026-05-06 01:21:36.317	\N	APROBADA	\N
217	2026-05-06 01:21:36.319	0	22	22	\N	19	2026-05-06 01:21:36.319	\N	\N	t	1	2026-05-06 01:21:36.319	\N	APROBADA	\N
218	2026-05-06 01:21:36.321	22	47	25	\N	19	2026-05-06 01:21:36.321	\N	\N	f	2	2026-05-06 01:21:36.321	\N	APROBADA	\N
219	2026-05-06 01:21:36.323	47	60	13	\N	19	2026-05-06 01:21:36.323	\N	\N	f	3	2026-05-06 01:21:36.323	\N	APROBADA	\N
220	2026-05-06 01:21:36.325	60	65	5	\N	19	2026-05-06 01:21:36.326	\N	\N	f	4	2026-05-06 01:21:36.326	\N	APROBADA	\N
221	2026-05-06 01:21:36.327	65	96	31	\N	19	2026-05-06 01:21:36.328	\N	\N	f	5	2026-05-06 01:21:36.328	\N	APROBADA	\N
222	2026-05-06 01:21:36.329	96	122	26	\N	19	2026-05-06 01:21:36.33	\N	\N	f	6	2026-05-06 01:21:36.33	\N	APROBADA	\N
223	2026-05-06 01:21:36.331	122	151	29	\N	19	2026-05-06 01:21:36.332	\N	\N	f	7	2026-05-06 01:21:36.332	\N	APROBADA	\N
224	2026-05-06 01:21:36.335	151	185	34	\N	19	2026-05-06 01:21:36.335	\N	\N	f	8	2026-05-06 01:21:36.335	\N	APROBADA	\N
225	2026-05-06 01:21:36.337	185	194	9	\N	19	2026-05-06 01:21:36.338	\N	\N	f	9	2026-05-06 01:21:36.338	\N	APROBADA	\N
226	2026-05-06 01:21:36.341	194	228	34	\N	19	2026-05-06 01:21:36.342	\N	\N	f	10	2026-05-06 01:21:36.342	\N	APROBADA	\N
227	2026-05-06 01:21:36.343	228	235	7	\N	19	2026-05-06 01:21:36.344	\N	\N	f	11	2026-05-06 01:21:36.344	\N	APROBADA	\N
228	2026-05-06 01:21:36.345	235	252	17	\N	19	2026-05-06 01:21:36.346	\N	\N	f	12	2026-05-06 01:21:36.346	\N	APROBADA	\N
229	2026-05-06 01:21:36.348	0	22	22	\N	20	2026-05-06 01:21:36.348	\N	\N	t	1	2026-05-06 01:21:36.348	\N	APROBADA	\N
230	2026-05-06 01:21:36.35	22	46	24	\N	20	2026-05-06 01:21:36.35	\N	\N	f	2	2026-05-06 01:21:36.35	\N	APROBADA	\N
231	2026-05-06 01:21:36.351	46	52	6	\N	20	2026-05-06 01:21:36.352	\N	\N	f	3	2026-05-06 01:21:36.352	\N	APROBADA	\N
232	2026-05-06 01:21:36.354	52	59	7	\N	20	2026-05-06 01:21:36.355	\N	\N	f	4	2026-05-06 01:21:36.355	\N	APROBADA	\N
233	2026-05-06 01:21:36.356	59	65	6	\N	20	2026-05-06 01:21:36.357	\N	\N	f	5	2026-05-06 01:21:36.357	\N	APROBADA	\N
234	2026-05-06 01:21:36.358	65	95	30	\N	20	2026-05-06 01:21:36.359	\N	\N	f	6	2026-05-06 01:21:36.359	\N	APROBADA	\N
235	2026-05-06 01:21:36.36	95	105	10	\N	20	2026-05-06 01:21:36.361	\N	\N	f	7	2026-05-06 01:21:36.361	\N	APROBADA	\N
236	2026-05-06 01:21:36.362	105	138	33	\N	20	2026-05-06 01:21:36.363	\N	\N	f	8	2026-05-06 01:21:36.363	\N	APROBADA	\N
237	2026-05-06 01:21:36.364	138	144	6	\N	20	2026-05-06 01:21:36.365	\N	\N	f	9	2026-05-06 01:21:36.365	\N	APROBADA	\N
238	2026-05-06 01:21:36.366	144	158	14	\N	20	2026-05-06 01:21:36.367	\N	\N	f	10	2026-05-06 01:21:36.367	\N	APROBADA	\N
239	2026-05-06 01:21:36.369	158	169	11	\N	20	2026-05-06 01:21:36.369	\N	\N	f	11	2026-05-06 01:21:36.369	\N	APROBADA	\N
240	2026-05-06 01:21:36.371	169	185	16	\N	20	2026-05-06 01:21:36.371	\N	\N	f	12	2026-05-06 01:21:36.371	\N	APROBADA	\N
241	2026-05-06 01:21:36.374	0	31	31	\N	21	2026-05-06 01:21:36.374	\N	\N	t	1	2026-05-06 01:21:36.374	\N	APROBADA	\N
242	2026-05-06 01:21:36.376	31	39	8	\N	21	2026-05-06 01:21:36.377	\N	\N	f	2	2026-05-06 01:21:36.377	\N	APROBADA	\N
243	2026-05-06 01:21:36.378	39	47	8	\N	21	2026-05-06 01:21:36.379	\N	\N	f	3	2026-05-06 01:21:36.379	\N	APROBADA	\N
244	2026-05-06 01:21:36.38	47	56	9	\N	21	2026-05-06 01:21:36.38	\N	\N	f	4	2026-05-06 01:21:36.38	\N	APROBADA	\N
245	2026-05-06 01:21:36.382	56	82	26	\N	21	2026-05-06 01:21:36.383	\N	\N	f	5	2026-05-06 01:21:36.383	\N	APROBADA	\N
246	2026-05-06 01:21:36.385	82	106	24	\N	21	2026-05-06 01:21:36.385	\N	\N	f	6	2026-05-06 01:21:36.385	\N	APROBADA	\N
247	2026-05-06 01:21:36.387	106	133	27	\N	21	2026-05-06 01:21:36.387	\N	\N	f	7	2026-05-06 01:21:36.387	\N	APROBADA	\N
248	2026-05-06 01:21:36.389	133	147	14	\N	21	2026-05-06 01:21:36.389	\N	\N	f	8	2026-05-06 01:21:36.389	\N	APROBADA	\N
249	2026-05-06 01:21:36.391	147	169	22	\N	21	2026-05-06 01:21:36.391	\N	\N	f	9	2026-05-06 01:21:36.391	\N	APROBADA	\N
250	2026-05-06 01:21:36.393	169	193	24	\N	21	2026-05-06 01:21:36.393	\N	\N	f	10	2026-05-06 01:21:36.393	\N	APROBADA	\N
251	2026-05-06 01:21:36.395	193	208	15	\N	21	2026-05-06 01:21:36.395	\N	\N	f	11	2026-05-06 01:21:36.395	\N	APROBADA	\N
252	2026-05-06 01:21:36.396	208	237	29	\N	21	2026-05-06 01:21:36.397	\N	\N	f	12	2026-05-06 01:21:36.397	\N	APROBADA	\N
253	2026-05-06 01:21:36.398	0	22	22	\N	22	2026-05-06 01:21:36.398	\N	\N	t	1	2026-05-06 01:21:36.398	\N	APROBADA	\N
254	2026-05-06 01:21:36.4	22	43	21	\N	22	2026-05-06 01:21:36.401	\N	\N	f	2	2026-05-06 01:21:36.401	\N	APROBADA	\N
255	2026-05-06 01:21:36.402	43	76	33	\N	22	2026-05-06 01:21:36.403	\N	\N	f	3	2026-05-06 01:21:36.403	\N	APROBADA	\N
256	2026-05-06 01:21:36.404	76	97	21	\N	22	2026-05-06 01:21:36.405	\N	\N	f	4	2026-05-06 01:21:36.405	\N	APROBADA	\N
257	2026-05-06 01:21:36.407	97	122	25	\N	22	2026-05-06 01:21:36.407	\N	\N	f	5	2026-05-06 01:21:36.407	\N	APROBADA	\N
258	2026-05-06 01:21:36.408	122	135	13	\N	22	2026-05-06 01:21:36.409	\N	\N	f	6	2026-05-06 01:21:36.409	\N	APROBADA	\N
259	2026-05-06 01:21:36.41	135	169	34	\N	22	2026-05-06 01:21:36.411	\N	\N	f	7	2026-05-06 01:21:36.411	\N	APROBADA	\N
260	2026-05-06 01:21:36.412	169	203	34	\N	22	2026-05-06 01:21:36.412	\N	\N	f	8	2026-05-06 01:21:36.412	\N	APROBADA	\N
261	2026-05-06 01:21:36.413	203	230	27	\N	22	2026-05-06 01:21:36.414	\N	\N	f	9	2026-05-06 01:21:36.414	\N	APROBADA	\N
262	2026-05-06 01:21:36.415	230	235	5	\N	22	2026-05-06 01:21:36.416	\N	\N	f	10	2026-05-06 01:21:36.416	\N	APROBADA	\N
263	2026-05-06 01:21:36.418	235	260	25	\N	22	2026-05-06 01:21:36.418	\N	\N	f	11	2026-05-06 01:21:36.418	\N	APROBADA	\N
264	2026-05-06 01:21:36.42	260	291	31	\N	22	2026-05-06 01:21:36.42	\N	\N	f	12	2026-05-06 01:21:36.42	\N	APROBADA	\N
265	2026-05-06 01:21:36.422	0	17	17	\N	23	2026-05-06 01:21:36.422	\N	\N	t	1	2026-05-06 01:21:36.422	\N	APROBADA	\N
266	2026-05-06 01:21:36.423	17	22	5	\N	23	2026-05-06 01:21:36.424	\N	\N	f	2	2026-05-06 01:21:36.424	\N	APROBADA	\N
267	2026-05-06 01:21:36.425	22	51	29	\N	23	2026-05-06 01:21:36.426	\N	\N	f	3	2026-05-06 01:21:36.426	\N	APROBADA	\N
268	2026-05-06 01:21:36.427	51	62	11	\N	23	2026-05-06 01:21:36.427	\N	\N	f	4	2026-05-06 01:21:36.427	\N	APROBADA	\N
269	2026-05-06 01:21:36.429	62	69	7	\N	23	2026-05-06 01:21:36.429	\N	\N	f	5	2026-05-06 01:21:36.429	\N	APROBADA	\N
270	2026-05-06 01:21:36.43	69	77	8	\N	23	2026-05-06 01:21:36.431	\N	\N	f	6	2026-05-06 01:21:36.431	\N	APROBADA	\N
271	2026-05-06 01:21:36.432	77	110	33	\N	23	2026-05-06 01:21:36.432	\N	\N	f	7	2026-05-06 01:21:36.432	\N	APROBADA	\N
272	2026-05-06 01:21:36.434	110	120	10	\N	23	2026-05-06 01:21:36.435	\N	\N	f	8	2026-05-06 01:21:36.435	\N	APROBADA	\N
273	2026-05-06 01:21:36.437	120	136	16	\N	23	2026-05-06 01:21:36.438	\N	\N	f	9	2026-05-06 01:21:36.438	\N	APROBADA	\N
274	2026-05-06 01:21:36.44	136	160	24	\N	23	2026-05-06 01:21:36.44	\N	\N	f	10	2026-05-06 01:21:36.44	\N	APROBADA	\N
275	2026-05-06 01:21:36.442	160	194	34	\N	23	2026-05-06 01:21:36.443	\N	\N	f	11	2026-05-06 01:21:36.443	\N	APROBADA	\N
276	2026-05-06 01:21:36.445	194	217	23	\N	23	2026-05-06 01:21:36.446	\N	\N	f	12	2026-05-06 01:21:36.446	\N	APROBADA	\N
277	2026-05-06 01:21:36.447	0	25	25	\N	24	2026-05-06 01:21:36.448	\N	\N	t	1	2026-05-06 01:21:36.448	\N	APROBADA	\N
278	2026-05-06 01:21:36.451	25	41	16	\N	24	2026-05-06 01:21:36.452	\N	\N	f	2	2026-05-06 01:21:36.452	\N	APROBADA	\N
279	2026-05-06 01:21:36.454	41	54	13	\N	24	2026-05-06 01:21:36.455	\N	\N	f	3	2026-05-06 01:21:36.455	\N	APROBADA	\N
280	2026-05-06 01:21:36.456	54	76	22	\N	24	2026-05-06 01:21:36.457	\N	\N	f	4	2026-05-06 01:21:36.457	\N	APROBADA	\N
281	2026-05-06 01:21:36.459	76	101	25	\N	24	2026-05-06 01:21:36.459	\N	\N	f	5	2026-05-06 01:21:36.459	\N	APROBADA	\N
282	2026-05-06 01:21:36.46	101	107	6	\N	24	2026-05-06 01:21:36.46	\N	\N	f	6	2026-05-06 01:21:36.46	\N	APROBADA	\N
283	2026-05-06 01:21:36.462	107	130	23	\N	24	2026-05-06 01:21:36.462	\N	\N	f	7	2026-05-06 01:21:36.462	\N	APROBADA	\N
284	2026-05-06 01:21:36.464	130	158	28	\N	24	2026-05-06 01:21:36.464	\N	\N	f	8	2026-05-06 01:21:36.464	\N	APROBADA	\N
285	2026-05-06 01:21:36.466	158	173	15	\N	24	2026-05-06 01:21:36.467	\N	\N	f	9	2026-05-06 01:21:36.467	\N	APROBADA	\N
286	2026-05-06 01:21:36.468	173	193	20	\N	24	2026-05-06 01:21:36.469	\N	\N	f	10	2026-05-06 01:21:36.469	\N	APROBADA	\N
287	2026-05-06 01:21:36.471	193	215	22	\N	24	2026-05-06 01:21:36.471	\N	\N	f	11	2026-05-06 01:21:36.471	\N	APROBADA	\N
288	2026-05-06 01:21:36.473	215	232	17	\N	24	2026-05-06 01:21:36.473	\N	\N	f	12	2026-05-06 01:21:36.473	\N	APROBADA	\N
289	2026-05-06 01:21:36.475	0	18	18	\N	25	2026-05-06 01:21:36.475	\N	\N	t	1	2026-05-06 01:21:36.475	\N	APROBADA	\N
290	2026-05-06 01:21:36.477	18	49	31	\N	25	2026-05-06 01:21:36.477	\N	\N	f	2	2026-05-06 01:21:36.477	\N	APROBADA	\N
291	2026-05-06 01:21:36.479	49	56	7	\N	25	2026-05-06 01:21:36.479	\N	\N	f	3	2026-05-06 01:21:36.479	\N	APROBADA	\N
292	2026-05-06 01:21:36.481	56	88	32	\N	25	2026-05-06 01:21:36.482	\N	\N	f	4	2026-05-06 01:21:36.482	\N	APROBADA	\N
293	2026-05-06 01:21:36.484	88	110	22	\N	25	2026-05-06 01:21:36.484	\N	\N	f	5	2026-05-06 01:21:36.484	\N	APROBADA	\N
294	2026-05-06 01:21:36.486	110	140	30	\N	25	2026-05-06 01:21:36.486	\N	\N	f	6	2026-05-06 01:21:36.486	\N	APROBADA	\N
295	2026-05-06 01:21:36.488	140	151	11	\N	25	2026-05-06 01:21:36.488	\N	\N	f	7	2026-05-06 01:21:36.488	\N	APROBADA	\N
296	2026-05-06 01:21:36.489	151	175	24	\N	25	2026-05-06 01:21:36.49	\N	\N	f	8	2026-05-06 01:21:36.49	\N	APROBADA	\N
297	2026-05-06 01:21:36.492	175	192	17	\N	25	2026-05-06 01:21:36.493	\N	\N	f	9	2026-05-06 01:21:36.493	\N	APROBADA	\N
298	2026-05-06 01:21:36.495	192	209	17	\N	25	2026-05-06 01:21:36.495	\N	\N	f	10	2026-05-06 01:21:36.495	\N	APROBADA	\N
299	2026-05-06 01:21:36.496	209	222	13	\N	25	2026-05-06 01:21:36.497	\N	\N	f	11	2026-05-06 01:21:36.497	\N	APROBADA	\N
300	2026-05-06 01:21:36.499	222	237	15	\N	25	2026-05-06 01:21:36.5	\N	\N	f	12	2026-05-06 01:21:36.5	\N	APROBADA	\N
301	2026-05-06 01:21:36.502	0	7	7	\N	26	2026-05-06 01:21:36.502	\N	\N	t	1	2026-05-06 01:21:36.502	\N	APROBADA	\N
302	2026-05-06 01:21:36.503	7	34	27	\N	26	2026-05-06 01:21:36.504	\N	\N	f	2	2026-05-06 01:21:36.504	\N	APROBADA	\N
303	2026-05-06 01:21:36.506	34	51	17	\N	26	2026-05-06 01:21:36.507	\N	\N	f	3	2026-05-06 01:21:36.507	\N	APROBADA	\N
304	2026-05-06 01:21:36.508	51	63	12	\N	26	2026-05-06 01:21:36.509	\N	\N	f	4	2026-05-06 01:21:36.509	\N	APROBADA	\N
305	2026-05-06 01:21:36.51	63	76	13	\N	26	2026-05-06 01:21:36.51	\N	\N	f	5	2026-05-06 01:21:36.51	\N	APROBADA	\N
306	2026-05-06 01:21:36.512	76	95	19	\N	26	2026-05-06 01:21:36.513	\N	\N	f	6	2026-05-06 01:21:36.513	\N	APROBADA	\N
307	2026-05-06 01:21:36.515	95	122	27	\N	26	2026-05-06 01:21:36.515	\N	\N	f	7	2026-05-06 01:21:36.515	\N	APROBADA	\N
308	2026-05-06 01:21:36.517	122	151	29	\N	26	2026-05-06 01:21:36.517	\N	\N	f	8	2026-05-06 01:21:36.517	\N	APROBADA	\N
309	2026-05-06 01:21:36.519	151	171	20	\N	26	2026-05-06 01:21:36.519	\N	\N	f	9	2026-05-06 01:21:36.519	\N	APROBADA	\N
310	2026-05-06 01:21:36.521	171	199	28	\N	26	2026-05-06 01:21:36.521	\N	\N	f	10	2026-05-06 01:21:36.521	\N	APROBADA	\N
311	2026-05-06 01:21:36.523	199	226	27	\N	26	2026-05-06 01:21:36.523	\N	\N	f	11	2026-05-06 01:21:36.523	\N	APROBADA	\N
312	2026-05-06 01:21:36.525	226	252	26	\N	26	2026-05-06 01:21:36.525	\N	\N	f	12	2026-05-06 01:21:36.525	\N	APROBADA	\N
313	2026-05-06 01:21:36.527	0	9	9	\N	27	2026-05-06 01:21:36.528	\N	\N	t	1	2026-05-06 01:21:36.528	\N	APROBADA	\N
314	2026-05-06 01:21:36.529	9	41	32	\N	27	2026-05-06 01:21:36.53	\N	\N	f	2	2026-05-06 01:21:36.53	\N	APROBADA	\N
315	2026-05-06 01:21:36.531	41	65	24	\N	27	2026-05-06 01:21:36.531	\N	\N	f	3	2026-05-06 01:21:36.531	\N	APROBADA	\N
316	2026-05-06 01:21:36.533	65	78	13	\N	27	2026-05-06 01:21:36.534	\N	\N	f	4	2026-05-06 01:21:36.534	\N	APROBADA	\N
317	2026-05-06 01:21:36.536	78	86	8	\N	27	2026-05-06 01:21:36.537	\N	\N	f	5	2026-05-06 01:21:36.537	\N	APROBADA	\N
318	2026-05-06 01:21:36.539	86	108	22	\N	27	2026-05-06 01:21:36.539	\N	\N	f	6	2026-05-06 01:21:36.539	\N	APROBADA	\N
319	2026-05-06 01:21:36.541	108	117	9	\N	27	2026-05-06 01:21:36.542	\N	\N	f	7	2026-05-06 01:21:36.542	\N	APROBADA	\N
320	2026-05-06 01:21:36.543	117	141	24	\N	27	2026-05-06 01:21:36.544	\N	\N	f	8	2026-05-06 01:21:36.544	\N	APROBADA	\N
321	2026-05-06 01:21:36.545	141	164	23	\N	27	2026-05-06 01:21:36.546	\N	\N	f	9	2026-05-06 01:21:36.546	\N	APROBADA	\N
322	2026-05-06 01:21:36.547	164	169	5	\N	27	2026-05-06 01:21:36.547	\N	\N	f	10	2026-05-06 01:21:36.547	\N	APROBADA	\N
323	2026-05-06 01:21:36.549	169	201	32	\N	27	2026-05-06 01:21:36.55	\N	\N	f	11	2026-05-06 01:21:36.55	\N	APROBADA	\N
324	2026-05-06 01:21:36.551	201	227	26	\N	27	2026-05-06 01:21:36.552	\N	\N	f	12	2026-05-06 01:21:36.552	\N	APROBADA	\N
325	2026-05-06 01:21:36.553	0	20	20	\N	28	2026-05-06 01:21:36.553	\N	\N	t	1	2026-05-06 01:21:36.553	\N	APROBADA	\N
326	2026-05-06 01:21:36.556	20	54	34	\N	28	2026-05-06 01:21:36.556	\N	\N	f	2	2026-05-06 01:21:36.556	\N	APROBADA	\N
327	2026-05-06 01:21:36.558	54	88	34	\N	28	2026-05-06 01:21:36.558	\N	\N	f	3	2026-05-06 01:21:36.558	\N	APROBADA	\N
328	2026-05-06 01:21:36.559	88	95	7	\N	28	2026-05-06 01:21:36.56	\N	\N	f	4	2026-05-06 01:21:36.56	\N	APROBADA	\N
329	2026-05-06 01:21:36.561	95	113	18	\N	28	2026-05-06 01:21:36.562	\N	\N	f	5	2026-05-06 01:21:36.562	\N	APROBADA	\N
330	2026-05-06 01:21:36.564	113	133	20	\N	28	2026-05-06 01:21:36.564	\N	\N	f	6	2026-05-06 01:21:36.564	\N	APROBADA	\N
331	2026-05-06 01:21:36.566	133	152	19	\N	28	2026-05-06 01:21:36.566	\N	\N	f	7	2026-05-06 01:21:36.566	\N	APROBADA	\N
332	2026-05-06 01:21:36.568	152	175	23	\N	28	2026-05-06 01:21:36.569	\N	\N	f	8	2026-05-06 01:21:36.569	\N	APROBADA	\N
333	2026-05-06 01:21:36.57	175	203	28	\N	28	2026-05-06 01:21:36.571	\N	\N	f	9	2026-05-06 01:21:36.571	\N	APROBADA	\N
334	2026-05-06 01:21:36.572	203	233	30	\N	28	2026-05-06 01:21:36.573	\N	\N	f	10	2026-05-06 01:21:36.573	\N	APROBADA	\N
335	2026-05-06 01:21:36.574	233	251	18	\N	28	2026-05-06 01:21:36.575	\N	\N	f	11	2026-05-06 01:21:36.575	\N	APROBADA	\N
336	2026-05-06 01:21:36.576	251	260	9	\N	28	2026-05-06 01:21:36.577	\N	\N	f	12	2026-05-06 01:21:36.577	\N	APROBADA	\N
337	2026-05-06 01:21:36.578	0	23	23	\N	29	2026-05-06 01:21:36.578	\N	\N	t	1	2026-05-06 01:21:36.578	\N	APROBADA	\N
338	2026-05-06 01:21:36.58	23	48	25	\N	29	2026-05-06 01:21:36.58	\N	\N	f	2	2026-05-06 01:21:36.58	\N	APROBADA	\N
339	2026-05-06 01:21:36.582	48	80	32	\N	29	2026-05-06 01:21:36.583	\N	\N	f	3	2026-05-06 01:21:36.583	\N	APROBADA	\N
340	2026-05-06 01:21:36.584	80	85	5	\N	29	2026-05-06 01:21:36.585	\N	\N	f	4	2026-05-06 01:21:36.585	\N	APROBADA	\N
341	2026-05-06 01:21:36.587	85	108	23	\N	29	2026-05-06 01:21:36.587	\N	\N	f	5	2026-05-06 01:21:36.587	\N	APROBADA	\N
342	2026-05-06 01:21:36.588	108	116	8	\N	29	2026-05-06 01:21:36.589	\N	\N	f	6	2026-05-06 01:21:36.589	\N	APROBADA	\N
343	2026-05-06 01:21:36.591	116	149	33	\N	29	2026-05-06 01:21:36.591	\N	\N	f	7	2026-05-06 01:21:36.591	\N	APROBADA	\N
344	2026-05-06 01:21:36.593	149	164	15	\N	29	2026-05-06 01:21:36.593	\N	\N	f	8	2026-05-06 01:21:36.593	\N	APROBADA	\N
345	2026-05-06 01:21:36.595	164	195	31	\N	29	2026-05-06 01:21:36.595	\N	\N	f	9	2026-05-06 01:21:36.595	\N	APROBADA	\N
346	2026-05-06 01:21:36.597	195	212	17	\N	29	2026-05-06 01:21:36.597	\N	\N	f	10	2026-05-06 01:21:36.597	\N	APROBADA	\N
347	2026-05-06 01:21:36.599	212	240	28	\N	29	2026-05-06 01:21:36.6	\N	\N	f	11	2026-05-06 01:21:36.6	\N	APROBADA	\N
348	2026-05-06 01:21:36.601	240	250	10	\N	29	2026-05-06 01:21:36.601	\N	\N	f	12	2026-05-06 01:21:36.601	\N	APROBADA	\N
349	2026-05-06 01:21:36.603	0	14	14	\N	30	2026-05-06 01:21:36.603	\N	\N	t	1	2026-05-06 01:21:36.603	\N	APROBADA	\N
350	2026-05-06 01:21:36.605	14	46	32	\N	30	2026-05-06 01:21:36.605	\N	\N	f	2	2026-05-06 01:21:36.605	\N	APROBADA	\N
351	2026-05-06 01:21:36.608	46	74	28	\N	30	2026-05-06 01:21:36.609	\N	\N	f	3	2026-05-06 01:21:36.609	\N	APROBADA	\N
352	2026-05-06 01:21:36.611	74	100	26	\N	30	2026-05-06 01:21:36.612	\N	\N	f	4	2026-05-06 01:21:36.612	\N	APROBADA	\N
353	2026-05-06 01:21:36.613	100	115	15	\N	30	2026-05-06 01:21:36.613	\N	\N	f	5	2026-05-06 01:21:36.613	\N	APROBADA	\N
354	2026-05-06 01:21:36.615	115	138	23	\N	30	2026-05-06 01:21:36.615	\N	\N	f	6	2026-05-06 01:21:36.615	\N	APROBADA	\N
355	2026-05-06 01:21:36.617	138	154	16	\N	30	2026-05-06 01:21:36.617	\N	\N	f	7	2026-05-06 01:21:36.617	\N	APROBADA	\N
356	2026-05-06 01:21:36.619	154	184	30	\N	30	2026-05-06 01:21:36.619	\N	\N	f	8	2026-05-06 01:21:36.619	\N	APROBADA	\N
357	2026-05-06 01:21:36.621	184	208	24	\N	30	2026-05-06 01:21:36.621	\N	\N	f	9	2026-05-06 01:21:36.621	\N	APROBADA	\N
358	2026-05-06 01:21:36.622	208	227	19	\N	30	2026-05-06 01:21:36.623	\N	\N	f	10	2026-05-06 01:21:36.623	\N	APROBADA	\N
359	2026-05-06 01:21:36.625	227	238	11	\N	30	2026-05-06 01:21:36.625	\N	\N	f	11	2026-05-06 01:21:36.625	\N	APROBADA	\N
360	2026-05-06 01:21:36.627	238	247	9	\N	30	2026-05-06 01:21:36.627	\N	\N	f	12	2026-05-06 01:21:36.627	\N	APROBADA	\N
361	2026-05-06 01:21:36.628	0	24	24	\N	31	2026-05-06 01:21:36.628	\N	\N	t	1	2026-05-06 01:21:36.628	\N	APROBADA	\N
362	2026-05-06 01:21:36.63	24	57	33	\N	31	2026-05-06 01:21:36.63	\N	\N	f	2	2026-05-06 01:21:36.63	\N	APROBADA	\N
363	2026-05-06 01:21:36.632	57	64	7	\N	31	2026-05-06 01:21:36.632	\N	\N	f	3	2026-05-06 01:21:36.632	\N	APROBADA	\N
364	2026-05-06 01:21:36.634	64	77	13	\N	31	2026-05-06 01:21:36.634	\N	\N	f	4	2026-05-06 01:21:36.634	\N	APROBADA	\N
365	2026-05-06 01:21:36.635	77	91	14	\N	31	2026-05-06 01:21:36.636	\N	\N	f	5	2026-05-06 01:21:36.636	\N	APROBADA	\N
366	2026-05-06 01:21:36.637	91	97	6	\N	31	2026-05-06 01:21:36.638	\N	\N	f	6	2026-05-06 01:21:36.638	\N	APROBADA	\N
367	2026-05-06 01:21:36.639	97	127	30	\N	31	2026-05-06 01:21:36.64	\N	\N	f	7	2026-05-06 01:21:36.64	\N	APROBADA	\N
368	2026-05-06 01:21:36.641	127	159	32	\N	31	2026-05-06 01:21:36.642	\N	\N	f	8	2026-05-06 01:21:36.642	\N	APROBADA	\N
369	2026-05-06 01:21:36.643	159	174	15	\N	31	2026-05-06 01:21:36.644	\N	\N	f	9	2026-05-06 01:21:36.644	\N	APROBADA	\N
370	2026-05-06 01:21:36.645	174	193	19	\N	31	2026-05-06 01:21:36.646	\N	\N	f	10	2026-05-06 01:21:36.646	\N	APROBADA	\N
371	2026-05-06 01:21:36.648	193	218	25	\N	31	2026-05-06 01:21:36.648	\N	\N	f	11	2026-05-06 01:21:36.648	\N	APROBADA	\N
372	2026-05-06 01:21:36.65	218	225	7	\N	31	2026-05-06 01:21:36.65	\N	\N	f	12	2026-05-06 01:21:36.65	\N	APROBADA	\N
373	2026-05-06 01:21:36.652	0	21	21	\N	32	2026-05-06 01:21:36.653	\N	\N	t	1	2026-05-06 01:21:36.653	\N	APROBADA	\N
374	2026-05-06 01:21:36.654	21	33	12	\N	32	2026-05-06 01:21:36.655	\N	\N	f	2	2026-05-06 01:21:36.655	\N	APROBADA	\N
375	2026-05-06 01:21:36.656	33	60	27	\N	32	2026-05-06 01:21:36.656	\N	\N	f	3	2026-05-06 01:21:36.656	\N	APROBADA	\N
376	2026-05-06 01:21:36.658	60	82	22	\N	32	2026-05-06 01:21:36.658	\N	\N	f	4	2026-05-06 01:21:36.658	\N	APROBADA	\N
377	2026-05-06 01:21:36.66	82	100	18	\N	32	2026-05-06 01:21:36.66	\N	\N	f	5	2026-05-06 01:21:36.66	\N	APROBADA	\N
378	2026-05-06 01:21:36.662	100	122	22	\N	32	2026-05-06 01:21:36.663	\N	\N	f	6	2026-05-06 01:21:36.663	\N	APROBADA	\N
379	2026-05-06 01:21:36.664	122	131	9	\N	32	2026-05-06 01:21:36.665	\N	\N	f	7	2026-05-06 01:21:36.665	\N	APROBADA	\N
380	2026-05-06 01:21:36.666	131	165	34	\N	32	2026-05-06 01:21:36.667	\N	\N	f	8	2026-05-06 01:21:36.667	\N	APROBADA	\N
381	2026-05-06 01:21:36.668	165	170	5	\N	32	2026-05-06 01:21:36.669	\N	\N	f	9	2026-05-06 01:21:36.669	\N	APROBADA	\N
382	2026-05-06 01:21:36.67	170	179	9	\N	32	2026-05-06 01:21:36.671	\N	\N	f	10	2026-05-06 01:21:36.671	\N	APROBADA	\N
383	2026-05-06 01:21:36.672	179	202	23	\N	32	2026-05-06 01:21:36.672	\N	\N	f	11	2026-05-06 01:21:36.672	\N	APROBADA	\N
384	2026-05-06 01:21:36.674	202	224	22	\N	32	2026-05-06 01:21:36.674	\N	\N	f	12	2026-05-06 01:21:36.674	\N	APROBADA	\N
385	2026-05-06 01:21:36.676	0	28	28	\N	33	2026-05-06 01:21:36.676	\N	\N	t	1	2026-05-06 01:21:36.676	\N	APROBADA	\N
386	2026-05-06 01:21:36.677	28	39	11	\N	33	2026-05-06 01:21:36.678	\N	\N	f	2	2026-05-06 01:21:36.678	\N	APROBADA	\N
387	2026-05-06 01:21:36.679	39	68	29	\N	33	2026-05-06 01:21:36.68	\N	\N	f	3	2026-05-06 01:21:36.68	\N	APROBADA	\N
388	2026-05-06 01:21:36.681	68	83	15	\N	33	2026-05-06 01:21:36.682	\N	\N	f	4	2026-05-06 01:21:36.682	\N	APROBADA	\N
389	2026-05-06 01:21:36.683	83	115	32	\N	33	2026-05-06 01:21:36.684	\N	\N	f	5	2026-05-06 01:21:36.684	\N	APROBADA	\N
390	2026-05-06 01:21:36.685	115	142	27	\N	33	2026-05-06 01:21:36.686	\N	\N	f	6	2026-05-06 01:21:36.686	\N	APROBADA	\N
391	2026-05-06 01:21:36.687	142	150	8	\N	33	2026-05-06 01:21:36.688	\N	\N	f	7	2026-05-06 01:21:36.688	\N	APROBADA	\N
392	2026-05-06 01:21:36.689	150	173	23	\N	33	2026-05-06 01:21:36.689	\N	\N	f	8	2026-05-06 01:21:36.689	\N	APROBADA	\N
393	2026-05-06 01:21:36.691	173	198	25	\N	33	2026-05-06 01:21:36.691	\N	\N	f	9	2026-05-06 01:21:36.691	\N	APROBADA	\N
394	2026-05-06 01:21:36.693	198	225	27	\N	33	2026-05-06 01:21:36.693	\N	\N	f	10	2026-05-06 01:21:36.693	\N	APROBADA	\N
395	2026-05-06 01:21:36.695	225	236	11	\N	33	2026-05-06 01:21:36.695	\N	\N	f	11	2026-05-06 01:21:36.695	\N	APROBADA	\N
396	2026-05-06 01:21:36.697	236	253	17	\N	33	2026-05-06 01:21:36.697	\N	\N	f	12	2026-05-06 01:21:36.697	\N	APROBADA	\N
397	2026-05-06 01:21:36.699	0	27	27	\N	34	2026-05-06 01:21:36.699	\N	\N	t	1	2026-05-06 01:21:36.699	\N	APROBADA	\N
398	2026-05-06 01:21:36.7	27	41	14	\N	34	2026-05-06 01:21:36.701	\N	\N	f	2	2026-05-06 01:21:36.701	\N	APROBADA	\N
399	2026-05-06 01:21:36.702	41	59	18	\N	34	2026-05-06 01:21:36.703	\N	\N	f	3	2026-05-06 01:21:36.703	\N	APROBADA	\N
400	2026-05-06 01:21:36.705	59	81	22	\N	34	2026-05-06 01:21:36.705	\N	\N	f	4	2026-05-06 01:21:36.705	\N	APROBADA	\N
401	2026-05-06 01:21:36.706	81	114	33	\N	34	2026-05-06 01:21:36.707	\N	\N	f	5	2026-05-06 01:21:36.707	\N	APROBADA	\N
402	2026-05-06 01:21:36.708	114	130	16	\N	34	2026-05-06 01:21:36.709	\N	\N	f	6	2026-05-06 01:21:36.709	\N	APROBADA	\N
403	2026-05-06 01:21:36.71	130	144	14	\N	34	2026-05-06 01:21:36.711	\N	\N	f	7	2026-05-06 01:21:36.711	\N	APROBADA	\N
404	2026-05-06 01:21:36.712	144	150	6	\N	34	2026-05-06 01:21:36.712	\N	\N	f	8	2026-05-06 01:21:36.712	\N	APROBADA	\N
405	2026-05-06 01:21:36.714	150	182	32	\N	34	2026-05-06 01:21:36.714	\N	\N	f	9	2026-05-06 01:21:36.714	\N	APROBADA	\N
406	2026-05-06 01:21:36.716	182	194	12	\N	34	2026-05-06 01:21:36.716	\N	\N	f	10	2026-05-06 01:21:36.716	\N	APROBADA	\N
407	2026-05-06 01:21:36.717	194	199	5	\N	34	2026-05-06 01:21:36.718	\N	\N	f	11	2026-05-06 01:21:36.718	\N	APROBADA	\N
408	2026-05-06 01:21:36.719	199	210	11	\N	34	2026-05-06 01:21:36.719	\N	\N	f	12	2026-05-06 01:21:36.719	\N	APROBADA	\N
409	2026-05-06 01:21:36.721	0	33	33	\N	35	2026-05-06 01:21:36.721	\N	\N	t	1	2026-05-06 01:21:36.721	\N	APROBADA	\N
410	2026-05-06 01:21:36.722	33	53	20	\N	35	2026-05-06 01:21:36.723	\N	\N	f	2	2026-05-06 01:21:36.723	\N	APROBADA	\N
411	2026-05-06 01:21:36.724	53	75	22	\N	35	2026-05-06 01:21:36.725	\N	\N	f	3	2026-05-06 01:21:36.725	\N	APROBADA	\N
412	2026-05-06 01:21:36.726	75	98	23	\N	35	2026-05-06 01:21:36.726	\N	\N	f	4	2026-05-06 01:21:36.726	\N	APROBADA	\N
413	2026-05-06 01:21:36.728	98	108	10	\N	35	2026-05-06 01:21:36.728	\N	\N	f	5	2026-05-06 01:21:36.728	\N	APROBADA	\N
414	2026-05-06 01:21:36.73	108	134	26	\N	35	2026-05-06 01:21:36.73	\N	\N	f	6	2026-05-06 01:21:36.73	\N	APROBADA	\N
415	2026-05-06 01:21:36.731	134	139	5	\N	35	2026-05-06 01:21:36.732	\N	\N	f	7	2026-05-06 01:21:36.732	\N	APROBADA	\N
416	2026-05-06 01:21:36.733	139	169	30	\N	35	2026-05-06 01:21:36.733	\N	\N	f	8	2026-05-06 01:21:36.733	\N	APROBADA	\N
417	2026-05-06 01:21:36.734	169	179	10	\N	35	2026-05-06 01:21:36.735	\N	\N	f	9	2026-05-06 01:21:36.735	\N	APROBADA	\N
418	2026-05-06 01:21:36.736	179	202	23	\N	35	2026-05-06 01:21:36.736	\N	\N	f	10	2026-05-06 01:21:36.736	\N	APROBADA	\N
419	2026-05-06 01:21:36.738	202	211	9	\N	35	2026-05-06 01:21:36.738	\N	\N	f	11	2026-05-06 01:21:36.738	\N	APROBADA	\N
420	2026-05-06 01:21:36.74	211	217	6	\N	35	2026-05-06 01:21:36.74	\N	\N	f	12	2026-05-06 01:21:36.74	\N	APROBADA	\N
421	2026-05-06 01:21:36.741	0	13	13	\N	36	2026-05-06 01:21:36.742	\N	\N	t	1	2026-05-06 01:21:36.742	\N	APROBADA	\N
422	2026-05-06 01:21:36.743	13	44	31	\N	36	2026-05-06 01:21:36.744	\N	\N	f	2	2026-05-06 01:21:36.744	\N	APROBADA	\N
423	2026-05-06 01:21:36.745	44	77	33	\N	36	2026-05-06 01:21:36.746	\N	\N	f	3	2026-05-06 01:21:36.746	\N	APROBADA	\N
424	2026-05-06 01:21:36.747	77	103	26	\N	36	2026-05-06 01:21:36.748	\N	\N	f	4	2026-05-06 01:21:36.748	\N	APROBADA	\N
425	2026-05-06 01:21:36.75	103	115	12	\N	36	2026-05-06 01:21:36.75	\N	\N	f	5	2026-05-06 01:21:36.75	\N	APROBADA	\N
426	2026-05-06 01:21:36.752	115	138	23	\N	36	2026-05-06 01:21:36.752	\N	\N	f	6	2026-05-06 01:21:36.752	\N	APROBADA	\N
427	2026-05-06 01:21:36.753	138	150	12	\N	36	2026-05-06 01:21:36.754	\N	\N	f	7	2026-05-06 01:21:36.754	\N	APROBADA	\N
428	2026-05-06 01:21:36.755	150	157	7	\N	36	2026-05-06 01:21:36.756	\N	\N	f	8	2026-05-06 01:21:36.756	\N	APROBADA	\N
429	2026-05-06 01:21:36.758	157	187	30	\N	36	2026-05-06 01:21:36.758	\N	\N	f	9	2026-05-06 01:21:36.758	\N	APROBADA	\N
430	2026-05-06 01:21:36.76	187	216	29	\N	36	2026-05-06 01:21:36.76	\N	\N	f	10	2026-05-06 01:21:36.76	\N	APROBADA	\N
431	2026-05-06 01:21:36.762	216	231	15	\N	36	2026-05-06 01:21:36.762	\N	\N	f	11	2026-05-06 01:21:36.762	\N	APROBADA	\N
432	2026-05-06 01:21:36.764	231	251	20	\N	36	2026-05-06 01:21:36.764	\N	\N	f	12	2026-05-06 01:21:36.764	\N	APROBADA	\N
433	2026-05-06 01:21:36.766	0	23	23	\N	37	2026-05-06 01:21:36.766	\N	\N	t	1	2026-05-06 01:21:36.766	\N	APROBADA	\N
434	2026-05-06 01:21:36.767	23	53	30	\N	37	2026-05-06 01:21:36.768	\N	\N	f	2	2026-05-06 01:21:36.768	\N	APROBADA	\N
435	2026-05-06 01:21:36.769	53	82	29	\N	37	2026-05-06 01:21:36.77	\N	\N	f	3	2026-05-06 01:21:36.77	\N	APROBADA	\N
436	2026-05-06 01:21:36.771	82	96	14	\N	37	2026-05-06 01:21:36.772	\N	\N	f	4	2026-05-06 01:21:36.772	\N	APROBADA	\N
437	2026-05-06 01:21:36.773	96	110	14	\N	37	2026-05-06 01:21:36.774	\N	\N	f	5	2026-05-06 01:21:36.774	\N	APROBADA	\N
438	2026-05-06 01:21:36.775	110	126	16	\N	37	2026-05-06 01:21:36.776	\N	\N	f	6	2026-05-06 01:21:36.776	\N	APROBADA	\N
439	2026-05-06 01:21:36.777	126	147	21	\N	37	2026-05-06 01:21:36.778	\N	\N	f	7	2026-05-06 01:21:36.778	\N	APROBADA	\N
440	2026-05-06 01:21:36.779	147	155	8	\N	37	2026-05-06 01:21:36.78	\N	\N	f	8	2026-05-06 01:21:36.78	\N	APROBADA	\N
441	2026-05-06 01:21:36.781	155	162	7	\N	37	2026-05-06 01:21:36.781	\N	\N	f	9	2026-05-06 01:21:36.781	\N	APROBADA	\N
442	2026-05-06 01:21:36.782	162	179	17	\N	37	2026-05-06 01:21:36.783	\N	\N	f	10	2026-05-06 01:21:36.783	\N	APROBADA	\N
443	2026-05-06 01:21:36.784	179	188	9	\N	37	2026-05-06 01:21:36.785	\N	\N	f	11	2026-05-06 01:21:36.785	\N	APROBADA	\N
444	2026-05-06 01:21:36.786	188	198	10	\N	37	2026-05-06 01:21:36.787	\N	\N	f	12	2026-05-06 01:21:36.787	\N	APROBADA	\N
445	2026-05-06 01:21:36.788	0	21	21	\N	38	2026-05-06 01:21:36.788	\N	\N	t	1	2026-05-06 01:21:36.788	\N	APROBADA	\N
446	2026-05-06 01:21:36.79	21	54	33	\N	38	2026-05-06 01:21:36.79	\N	\N	f	2	2026-05-06 01:21:36.79	\N	APROBADA	\N
447	2026-05-06 01:21:36.792	54	77	23	\N	38	2026-05-06 01:21:36.793	\N	\N	f	3	2026-05-06 01:21:36.793	\N	APROBADA	\N
448	2026-05-06 01:21:36.794	77	95	18	\N	38	2026-05-06 01:21:36.795	\N	\N	f	4	2026-05-06 01:21:36.795	\N	APROBADA	\N
449	2026-05-06 01:21:36.796	95	120	25	\N	38	2026-05-06 01:21:36.796	\N	\N	f	5	2026-05-06 01:21:36.796	\N	APROBADA	\N
450	2026-05-06 01:21:36.798	120	132	12	\N	38	2026-05-06 01:21:36.798	\N	\N	f	6	2026-05-06 01:21:36.798	\N	APROBADA	\N
451	2026-05-06 01:21:36.8	132	145	13	\N	38	2026-05-06 01:21:36.8	\N	\N	f	7	2026-05-06 01:21:36.8	\N	APROBADA	\N
452	2026-05-06 01:21:36.801	145	155	10	\N	38	2026-05-06 01:21:36.802	\N	\N	f	8	2026-05-06 01:21:36.802	\N	APROBADA	\N
453	2026-05-06 01:21:36.803	155	172	17	\N	38	2026-05-06 01:21:36.804	\N	\N	f	9	2026-05-06 01:21:36.804	\N	APROBADA	\N
454	2026-05-06 01:21:36.806	172	190	18	\N	38	2026-05-06 01:21:36.806	\N	\N	f	10	2026-05-06 01:21:36.806	\N	APROBADA	\N
455	2026-05-06 01:21:36.807	190	206	16	\N	38	2026-05-06 01:21:36.808	\N	\N	f	11	2026-05-06 01:21:36.808	\N	APROBADA	\N
456	2026-05-06 01:21:36.809	206	236	30	\N	38	2026-05-06 01:21:36.81	\N	\N	f	12	2026-05-06 01:21:36.81	\N	APROBADA	\N
457	2026-05-06 01:21:36.811	0	8	8	\N	39	2026-05-06 01:21:36.812	\N	\N	t	1	2026-05-06 01:21:36.812	\N	APROBADA	\N
458	2026-05-06 01:21:36.813	8	25	17	\N	39	2026-05-06 01:21:36.814	\N	\N	f	2	2026-05-06 01:21:36.814	\N	APROBADA	\N
459	2026-05-06 01:21:36.815	25	43	18	\N	39	2026-05-06 01:21:36.815	\N	\N	f	3	2026-05-06 01:21:36.815	\N	APROBADA	\N
460	2026-05-06 01:21:36.816	43	66	23	\N	39	2026-05-06 01:21:36.817	\N	\N	f	4	2026-05-06 01:21:36.817	\N	APROBADA	\N
461	2026-05-06 01:21:36.818	66	79	13	\N	39	2026-05-06 01:21:36.819	\N	\N	f	5	2026-05-06 01:21:36.819	\N	APROBADA	\N
462	2026-05-06 01:21:36.82	79	95	16	\N	39	2026-05-06 01:21:36.821	\N	\N	f	6	2026-05-06 01:21:36.821	\N	APROBADA	\N
463	2026-05-06 01:21:36.822	95	125	30	\N	39	2026-05-06 01:21:36.822	\N	\N	f	7	2026-05-06 01:21:36.822	\N	APROBADA	\N
464	2026-05-06 01:21:36.823	125	155	30	\N	39	2026-05-06 01:21:36.824	\N	\N	f	8	2026-05-06 01:21:36.824	\N	APROBADA	\N
465	2026-05-06 01:21:36.825	155	180	25	\N	39	2026-05-06 01:21:36.826	\N	\N	f	9	2026-05-06 01:21:36.826	\N	APROBADA	\N
466	2026-05-06 01:21:36.827	180	200	20	\N	39	2026-05-06 01:21:36.828	\N	\N	f	10	2026-05-06 01:21:36.828	\N	APROBADA	\N
467	2026-05-06 01:21:36.829	200	223	23	\N	39	2026-05-06 01:21:36.83	\N	\N	f	11	2026-05-06 01:21:36.83	\N	APROBADA	\N
468	2026-05-06 01:21:36.831	223	251	28	\N	39	2026-05-06 01:21:36.832	\N	\N	f	12	2026-05-06 01:21:36.832	\N	APROBADA	\N
469	2026-05-06 01:21:36.833	0	8	8	\N	40	2026-05-06 01:21:36.833	\N	\N	t	1	2026-05-06 01:21:36.833	\N	APROBADA	\N
470	2026-05-06 01:21:36.835	8	24	16	\N	40	2026-05-06 01:21:36.835	\N	\N	f	2	2026-05-06 01:21:36.835	\N	APROBADA	\N
471	2026-05-06 01:21:36.836	24	32	8	\N	40	2026-05-06 01:21:36.837	\N	\N	f	3	2026-05-06 01:21:36.837	\N	APROBADA	\N
472	2026-05-06 01:21:36.838	32	62	30	\N	40	2026-05-06 01:21:36.838	\N	\N	f	4	2026-05-06 01:21:36.838	\N	APROBADA	\N
473	2026-05-06 01:21:36.84	62	72	10	\N	40	2026-05-06 01:21:36.84	\N	\N	f	5	2026-05-06 01:21:36.84	\N	APROBADA	\N
474	2026-05-06 01:21:36.842	72	94	22	\N	40	2026-05-06 01:21:36.842	\N	\N	f	6	2026-05-06 01:21:36.842	\N	APROBADA	\N
475	2026-05-06 01:21:36.844	94	106	12	\N	40	2026-05-06 01:21:36.844	\N	\N	f	7	2026-05-06 01:21:36.844	\N	APROBADA	\N
476	2026-05-06 01:21:36.846	106	117	11	\N	40	2026-05-06 01:21:36.846	\N	\N	f	8	2026-05-06 01:21:36.846	\N	APROBADA	\N
477	2026-05-06 01:21:36.847	117	133	16	\N	40	2026-05-06 01:21:36.848	\N	\N	f	9	2026-05-06 01:21:36.848	\N	APROBADA	\N
478	2026-05-06 01:21:36.849	133	144	11	\N	40	2026-05-06 01:21:36.85	\N	\N	f	10	2026-05-06 01:21:36.85	\N	APROBADA	\N
479	2026-05-06 01:21:36.851	144	151	7	\N	40	2026-05-06 01:21:36.851	\N	\N	f	11	2026-05-06 01:21:36.851	\N	APROBADA	\N
480	2026-05-06 01:21:36.853	151	174	23	\N	40	2026-05-06 01:21:36.854	\N	\N	f	12	2026-05-06 01:21:36.854	\N	APROBADA	\N
481	2026-05-06 01:21:36.855	0	14	14	\N	41	2026-05-06 01:21:36.856	\N	\N	t	1	2026-05-06 01:21:36.856	\N	APROBADA	\N
482	2026-05-06 01:21:36.857	14	23	9	\N	41	2026-05-06 01:21:36.858	\N	\N	f	2	2026-05-06 01:21:36.858	\N	APROBADA	\N
483	2026-05-06 01:21:36.859	23	52	29	\N	41	2026-05-06 01:21:36.859	\N	\N	f	3	2026-05-06 01:21:36.859	\N	APROBADA	\N
484	2026-05-06 01:21:36.861	52	61	9	\N	41	2026-05-06 01:21:36.862	\N	\N	f	4	2026-05-06 01:21:36.862	\N	APROBADA	\N
485	2026-05-06 01:21:36.863	61	76	15	\N	41	2026-05-06 01:21:36.864	\N	\N	f	5	2026-05-06 01:21:36.864	\N	APROBADA	\N
486	2026-05-06 01:21:36.865	76	109	33	\N	41	2026-05-06 01:21:36.865	\N	\N	f	6	2026-05-06 01:21:36.865	\N	APROBADA	\N
487	2026-05-06 01:21:36.867	109	136	27	\N	41	2026-05-06 01:21:36.867	\N	\N	f	7	2026-05-06 01:21:36.867	\N	APROBADA	\N
488	2026-05-06 01:21:36.869	136	150	14	\N	41	2026-05-06 01:21:36.869	\N	\N	f	8	2026-05-06 01:21:36.869	\N	APROBADA	\N
489	2026-05-06 01:21:36.87	150	163	13	\N	41	2026-05-06 01:21:36.871	\N	\N	f	9	2026-05-06 01:21:36.871	\N	APROBADA	\N
490	2026-05-06 01:21:36.872	163	183	20	\N	41	2026-05-06 01:21:36.873	\N	\N	f	10	2026-05-06 01:21:36.873	\N	APROBADA	\N
491	2026-05-06 01:21:36.874	183	211	28	\N	41	2026-05-06 01:21:36.875	\N	\N	f	11	2026-05-06 01:21:36.875	\N	APROBADA	\N
492	2026-05-06 01:21:36.876	211	238	27	\N	41	2026-05-06 01:21:36.877	\N	\N	f	12	2026-05-06 01:21:36.877	\N	APROBADA	\N
493	2026-05-06 01:21:36.878	0	9	9	\N	42	2026-05-06 01:21:36.878	\N	\N	t	1	2026-05-06 01:21:36.878	\N	APROBADA	\N
494	2026-05-06 01:21:36.879	9	20	11	\N	42	2026-05-06 01:21:36.88	\N	\N	f	2	2026-05-06 01:21:36.88	\N	APROBADA	\N
495	2026-05-06 01:21:36.881	20	39	19	\N	42	2026-05-06 01:21:36.882	\N	\N	f	3	2026-05-06 01:21:36.882	\N	APROBADA	\N
496	2026-05-06 01:21:36.884	39	69	30	\N	42	2026-05-06 01:21:36.884	\N	\N	f	4	2026-05-06 01:21:36.884	\N	APROBADA	\N
497	2026-05-06 01:21:36.885	69	97	28	\N	42	2026-05-06 01:21:36.886	\N	\N	f	5	2026-05-06 01:21:36.886	\N	APROBADA	\N
498	2026-05-06 01:21:36.887	97	105	8	\N	42	2026-05-06 01:21:36.888	\N	\N	f	6	2026-05-06 01:21:36.888	\N	APROBADA	\N
499	2026-05-06 01:21:36.889	105	125	20	\N	42	2026-05-06 01:21:36.89	\N	\N	f	7	2026-05-06 01:21:36.89	\N	APROBADA	\N
500	2026-05-06 01:21:36.891	125	151	26	\N	42	2026-05-06 01:21:36.891	\N	\N	f	8	2026-05-06 01:21:36.891	\N	APROBADA	\N
501	2026-05-06 01:21:36.893	151	169	18	\N	42	2026-05-06 01:21:36.893	\N	\N	f	9	2026-05-06 01:21:36.893	\N	APROBADA	\N
502	2026-05-06 01:21:36.894	169	195	26	\N	42	2026-05-06 01:21:36.895	\N	\N	f	10	2026-05-06 01:21:36.895	\N	APROBADA	\N
503	2026-05-06 01:21:36.897	195	224	29	\N	42	2026-05-06 01:21:36.897	\N	\N	f	11	2026-05-06 01:21:36.897	\N	APROBADA	\N
504	2026-05-06 01:21:36.899	224	243	19	\N	42	2026-05-06 01:21:36.899	\N	\N	f	12	2026-05-06 01:21:36.899	\N	APROBADA	\N
505	2026-05-06 01:21:36.9	0	32	32	\N	43	2026-05-06 01:21:36.901	\N	\N	t	1	2026-05-06 01:21:36.901	\N	APROBADA	\N
506	2026-05-06 01:21:36.902	32	63	31	\N	43	2026-05-06 01:21:36.903	\N	\N	f	2	2026-05-06 01:21:36.903	\N	APROBADA	\N
507	2026-05-06 01:21:36.904	63	96	33	\N	43	2026-05-06 01:21:36.905	\N	\N	f	3	2026-05-06 01:21:36.905	\N	APROBADA	\N
508	2026-05-06 01:21:36.906	96	111	15	\N	43	2026-05-06 01:21:36.907	\N	\N	f	4	2026-05-06 01:21:36.907	\N	APROBADA	\N
509	2026-05-06 01:21:36.908	111	121	10	\N	43	2026-05-06 01:21:36.908	\N	\N	f	5	2026-05-06 01:21:36.908	\N	APROBADA	\N
510	2026-05-06 01:21:36.91	121	142	21	\N	43	2026-05-06 01:21:36.91	\N	\N	f	6	2026-05-06 01:21:36.91	\N	APROBADA	\N
511	2026-05-06 01:21:36.913	142	170	28	\N	43	2026-05-06 01:21:36.914	\N	\N	f	7	2026-05-06 01:21:36.914	\N	APROBADA	\N
512	2026-05-06 01:21:36.916	170	195	25	\N	43	2026-05-06 01:21:36.916	\N	\N	f	8	2026-05-06 01:21:36.916	\N	APROBADA	\N
513	2026-05-06 01:21:36.918	195	226	31	\N	43	2026-05-06 01:21:36.919	\N	\N	f	9	2026-05-06 01:21:36.919	\N	APROBADA	\N
514	2026-05-06 01:21:36.92	226	249	23	\N	43	2026-05-06 01:21:36.921	\N	\N	f	10	2026-05-06 01:21:36.921	\N	APROBADA	\N
515	2026-05-06 01:21:36.922	249	262	13	\N	43	2026-05-06 01:21:36.922	\N	\N	f	11	2026-05-06 01:21:36.922	\N	APROBADA	\N
516	2026-05-06 01:21:36.924	262	296	34	\N	43	2026-05-06 01:21:36.925	\N	\N	f	12	2026-05-06 01:21:36.925	\N	APROBADA	\N
517	2026-05-06 01:21:36.926	0	7	7	\N	44	2026-05-06 01:21:36.926	\N	\N	t	1	2026-05-06 01:21:36.926	\N	APROBADA	\N
518	2026-05-06 01:21:36.927	7	39	32	\N	44	2026-05-06 01:21:36.928	\N	\N	f	2	2026-05-06 01:21:36.928	\N	APROBADA	\N
519	2026-05-06 01:21:36.929	39	56	17	\N	44	2026-05-06 01:21:36.929	\N	\N	f	3	2026-05-06 01:21:36.929	\N	APROBADA	\N
520	2026-05-06 01:21:36.931	56	72	16	\N	44	2026-05-06 01:21:36.932	\N	\N	f	4	2026-05-06 01:21:36.932	\N	APROBADA	\N
521	2026-05-06 01:21:36.933	72	100	28	\N	44	2026-05-06 01:21:36.934	\N	\N	f	5	2026-05-06 01:21:36.934	\N	APROBADA	\N
522	2026-05-06 01:21:36.935	100	116	16	\N	44	2026-05-06 01:21:36.936	\N	\N	f	6	2026-05-06 01:21:36.936	\N	APROBADA	\N
523	2026-05-06 01:21:36.938	116	140	24	\N	44	2026-05-06 01:21:36.939	\N	\N	f	7	2026-05-06 01:21:36.939	\N	APROBADA	\N
524	2026-05-06 01:21:36.94	140	150	10	\N	44	2026-05-06 01:21:36.941	\N	\N	f	8	2026-05-06 01:21:36.941	\N	APROBADA	\N
525	2026-05-06 01:21:36.942	150	184	34	\N	44	2026-05-06 01:21:36.942	\N	\N	f	9	2026-05-06 01:21:36.942	\N	APROBADA	\N
526	2026-05-06 01:21:36.944	184	192	8	\N	44	2026-05-06 01:21:36.945	\N	\N	f	10	2026-05-06 01:21:36.945	\N	APROBADA	\N
527	2026-05-06 01:21:36.946	192	205	13	\N	44	2026-05-06 01:21:36.947	\N	\N	f	11	2026-05-06 01:21:36.947	\N	APROBADA	\N
528	2026-05-06 01:21:36.948	205	227	22	\N	44	2026-05-06 01:21:36.949	\N	\N	f	12	2026-05-06 01:21:36.949	\N	APROBADA	\N
529	2026-05-06 01:21:36.95	0	27	27	\N	45	2026-05-06 01:21:36.95	\N	\N	t	1	2026-05-06 01:21:36.95	\N	APROBADA	\N
530	2026-05-06 01:21:36.952	27	44	17	\N	45	2026-05-06 01:21:36.952	\N	\N	f	2	2026-05-06 01:21:36.952	\N	APROBADA	\N
531	2026-05-06 01:21:36.954	44	57	13	\N	45	2026-05-06 01:21:36.955	\N	\N	f	3	2026-05-06 01:21:36.955	\N	APROBADA	\N
532	2026-05-06 01:21:36.957	57	90	33	\N	45	2026-05-06 01:21:36.957	\N	\N	f	4	2026-05-06 01:21:36.957	\N	APROBADA	\N
533	2026-05-06 01:21:36.959	90	122	32	\N	45	2026-05-06 01:21:36.959	\N	\N	f	5	2026-05-06 01:21:36.959	\N	APROBADA	\N
534	2026-05-06 01:21:36.961	122	140	18	\N	45	2026-05-06 01:21:36.961	\N	\N	f	6	2026-05-06 01:21:36.961	\N	APROBADA	\N
535	2026-05-06 01:21:36.963	140	145	5	\N	45	2026-05-06 01:21:36.963	\N	\N	f	7	2026-05-06 01:21:36.963	\N	APROBADA	\N
536	2026-05-06 01:21:36.965	145	155	10	\N	45	2026-05-06 01:21:36.965	\N	\N	f	8	2026-05-06 01:21:36.965	\N	APROBADA	\N
537	2026-05-06 01:21:36.966	155	170	15	\N	45	2026-05-06 01:21:36.966	\N	\N	f	9	2026-05-06 01:21:36.966	\N	APROBADA	\N
538	2026-05-06 01:21:36.967	170	175	5	\N	45	2026-05-06 01:21:36.968	\N	\N	f	10	2026-05-06 01:21:36.968	\N	APROBADA	\N
539	2026-05-06 01:21:36.969	175	205	30	\N	45	2026-05-06 01:21:36.969	\N	\N	f	11	2026-05-06 01:21:36.969	\N	APROBADA	\N
540	2026-05-06 01:21:36.971	205	216	11	\N	45	2026-05-06 01:21:36.972	\N	\N	f	12	2026-05-06 01:21:36.972	\N	APROBADA	\N
541	2026-05-06 01:21:36.973	0	28	28	\N	46	2026-05-06 01:21:36.973	\N	\N	t	1	2026-05-06 01:21:36.973	\N	APROBADA	\N
542	2026-05-06 01:21:36.974	28	60	32	\N	46	2026-05-06 01:21:36.975	\N	\N	f	2	2026-05-06 01:21:36.975	\N	APROBADA	\N
543	2026-05-06 01:21:36.977	60	70	10	\N	46	2026-05-06 01:21:36.977	\N	\N	f	3	2026-05-06 01:21:36.977	\N	APROBADA	\N
544	2026-05-06 01:21:36.979	70	85	15	\N	46	2026-05-06 01:21:36.979	\N	\N	f	4	2026-05-06 01:21:36.979	\N	APROBADA	\N
545	2026-05-06 01:21:36.981	85	90	5	\N	46	2026-05-06 01:21:36.981	\N	\N	f	5	2026-05-06 01:21:36.981	\N	APROBADA	\N
546	2026-05-06 01:21:36.983	90	106	16	\N	46	2026-05-06 01:21:36.983	\N	\N	f	6	2026-05-06 01:21:36.983	\N	APROBADA	\N
547	2026-05-06 01:21:36.985	106	117	11	\N	46	2026-05-06 01:21:36.985	\N	\N	f	7	2026-05-06 01:21:36.985	\N	APROBADA	\N
548	2026-05-06 01:21:36.986	117	144	27	\N	46	2026-05-06 01:21:36.987	\N	\N	f	8	2026-05-06 01:21:36.987	\N	APROBADA	\N
549	2026-05-06 01:21:36.989	144	171	27	\N	46	2026-05-06 01:21:36.989	\N	\N	f	9	2026-05-06 01:21:36.989	\N	APROBADA	\N
550	2026-05-06 01:21:36.99	171	203	32	\N	46	2026-05-06 01:21:36.991	\N	\N	f	10	2026-05-06 01:21:36.991	\N	APROBADA	\N
551	2026-05-06 01:21:36.992	203	228	25	\N	46	2026-05-06 01:21:36.993	\N	\N	f	11	2026-05-06 01:21:36.993	\N	APROBADA	\N
552	2026-05-06 01:21:36.994	228	261	33	\N	46	2026-05-06 01:21:36.995	\N	\N	f	12	2026-05-06 01:21:36.995	\N	APROBADA	\N
553	2026-05-06 01:21:36.996	0	23	23	\N	47	2026-05-06 01:21:36.996	\N	\N	t	1	2026-05-06 01:21:36.996	\N	APROBADA	\N
554	2026-05-06 01:21:36.998	23	39	16	\N	47	2026-05-06 01:21:36.998	\N	\N	f	2	2026-05-06 01:21:36.998	\N	APROBADA	\N
555	2026-05-06 01:21:36.999	39	53	14	\N	47	2026-05-06 01:21:37	\N	\N	f	3	2026-05-06 01:21:37	\N	APROBADA	\N
556	2026-05-06 01:21:37.001	53	77	24	\N	47	2026-05-06 01:21:37.002	\N	\N	f	4	2026-05-06 01:21:37.002	\N	APROBADA	\N
557	2026-05-06 01:21:37.003	77	84	7	\N	47	2026-05-06 01:21:37.004	\N	\N	f	5	2026-05-06 01:21:37.004	\N	APROBADA	\N
558	2026-05-06 01:21:37.005	84	101	17	\N	47	2026-05-06 01:21:37.005	\N	\N	f	6	2026-05-06 01:21:37.005	\N	APROBADA	\N
559	2026-05-06 01:21:37.007	101	108	7	\N	47	2026-05-06 01:21:37.007	\N	\N	f	7	2026-05-06 01:21:37.007	\N	APROBADA	\N
560	2026-05-06 01:21:37.009	108	133	25	\N	47	2026-05-06 01:21:37.009	\N	\N	f	8	2026-05-06 01:21:37.009	\N	APROBADA	\N
561	2026-05-06 01:21:37.011	133	146	13	\N	47	2026-05-06 01:21:37.012	\N	\N	f	9	2026-05-06 01:21:37.012	\N	APROBADA	\N
562	2026-05-06 01:21:37.013	146	157	11	\N	47	2026-05-06 01:21:37.013	\N	\N	f	10	2026-05-06 01:21:37.013	\N	APROBADA	\N
563	2026-05-06 01:21:37.014	157	165	8	\N	47	2026-05-06 01:21:37.015	\N	\N	f	11	2026-05-06 01:21:37.015	\N	APROBADA	\N
564	2026-05-06 01:21:37.016	165	186	21	\N	47	2026-05-06 01:21:37.017	\N	\N	f	12	2026-05-06 01:21:37.017	\N	APROBADA	\N
565	2026-05-06 01:21:37.018	0	18	18	\N	48	2026-05-06 01:21:37.018	\N	\N	t	1	2026-05-06 01:21:37.018	\N	APROBADA	\N
566	2026-05-06 01:21:37.019	18	51	33	\N	48	2026-05-06 01:21:37.02	\N	\N	f	2	2026-05-06 01:21:37.02	\N	APROBADA	\N
567	2026-05-06 01:21:37.021	51	68	17	\N	48	2026-05-06 01:21:37.022	\N	\N	f	3	2026-05-06 01:21:37.022	\N	APROBADA	\N
568	2026-05-06 01:21:37.023	68	88	20	\N	48	2026-05-06 01:21:37.023	\N	\N	f	4	2026-05-06 01:21:37.023	\N	APROBADA	\N
569	2026-05-06 01:21:37.025	88	116	28	\N	48	2026-05-06 01:21:37.025	\N	\N	f	5	2026-05-06 01:21:37.025	\N	APROBADA	\N
570	2026-05-06 01:21:37.026	116	132	16	\N	48	2026-05-06 01:21:37.027	\N	\N	f	6	2026-05-06 01:21:37.027	\N	APROBADA	\N
571	2026-05-06 01:21:37.029	132	145	13	\N	48	2026-05-06 01:21:37.029	\N	\N	f	7	2026-05-06 01:21:37.029	\N	APROBADA	\N
572	2026-05-06 01:21:37.031	145	177	32	\N	48	2026-05-06 01:21:37.031	\N	\N	f	8	2026-05-06 01:21:37.031	\N	APROBADA	\N
573	2026-05-06 01:21:37.033	177	184	7	\N	48	2026-05-06 01:21:37.033	\N	\N	f	9	2026-05-06 01:21:37.033	\N	APROBADA	\N
574	2026-05-06 01:21:37.036	184	212	28	\N	48	2026-05-06 01:21:37.037	\N	\N	f	10	2026-05-06 01:21:37.037	\N	APROBADA	\N
575	2026-05-06 01:21:37.039	212	225	13	\N	48	2026-05-06 01:21:37.04	\N	\N	f	11	2026-05-06 01:21:37.04	\N	APROBADA	\N
576	2026-05-06 01:21:37.042	225	244	19	\N	48	2026-05-06 01:21:37.043	\N	\N	f	12	2026-05-06 01:21:37.043	\N	APROBADA	\N
577	2026-05-06 01:21:37.046	0	29	29	\N	49	2026-05-06 01:21:37.046	\N	\N	t	1	2026-05-06 01:21:37.046	\N	APROBADA	\N
578	2026-05-06 01:21:37.05	29	59	30	\N	49	2026-05-06 01:21:37.051	\N	\N	f	2	2026-05-06 01:21:37.051	\N	APROBADA	\N
579	2026-05-06 01:21:37.054	59	72	13	\N	49	2026-05-06 01:21:37.055	\N	\N	f	3	2026-05-06 01:21:37.055	\N	APROBADA	\N
580	2026-05-06 01:21:37.058	72	87	15	\N	49	2026-05-06 01:21:37.059	\N	\N	f	4	2026-05-06 01:21:37.059	\N	APROBADA	\N
581	2026-05-06 01:21:37.06	87	113	26	\N	49	2026-05-06 01:21:37.061	\N	\N	f	5	2026-05-06 01:21:37.061	\N	APROBADA	\N
582	2026-05-06 01:21:37.063	113	145	32	\N	49	2026-05-06 01:21:37.063	\N	\N	f	6	2026-05-06 01:21:37.063	\N	APROBADA	\N
583	2026-05-06 01:21:37.065	145	160	15	\N	49	2026-05-06 01:21:37.066	\N	\N	f	7	2026-05-06 01:21:37.066	\N	APROBADA	\N
584	2026-05-06 01:21:37.069	160	187	27	\N	49	2026-05-06 01:21:37.07	\N	\N	f	8	2026-05-06 01:21:37.07	\N	APROBADA	\N
585	2026-05-06 01:21:37.072	187	197	10	\N	49	2026-05-06 01:21:37.073	\N	\N	f	9	2026-05-06 01:21:37.073	\N	APROBADA	\N
586	2026-05-06 01:21:37.074	197	215	18	\N	49	2026-05-06 01:21:37.075	\N	\N	f	10	2026-05-06 01:21:37.075	\N	APROBADA	\N
587	2026-05-06 01:21:37.077	215	242	27	\N	49	2026-05-06 01:21:37.078	\N	\N	f	11	2026-05-06 01:21:37.078	\N	APROBADA	\N
588	2026-05-06 01:21:37.08	242	250	8	\N	49	2026-05-06 01:21:37.081	\N	\N	f	12	2026-05-06 01:21:37.081	\N	APROBADA	\N
589	2026-05-06 01:21:37.082	0	19	19	\N	50	2026-05-06 01:21:37.083	\N	\N	t	1	2026-05-06 01:21:37.083	\N	APROBADA	\N
590	2026-05-06 01:21:37.086	19	41	22	\N	50	2026-05-06 01:21:37.087	\N	\N	f	2	2026-05-06 01:21:37.087	\N	APROBADA	\N
591	2026-05-06 01:21:37.089	41	65	24	\N	50	2026-05-06 01:21:37.089	\N	\N	f	3	2026-05-06 01:21:37.089	\N	APROBADA	\N
592	2026-05-06 01:21:37.091	65	95	30	\N	50	2026-05-06 01:21:37.091	\N	\N	f	4	2026-05-06 01:21:37.091	\N	APROBADA	\N
593	2026-05-06 01:21:37.093	95	103	8	\N	50	2026-05-06 01:21:37.094	\N	\N	f	5	2026-05-06 01:21:37.094	\N	APROBADA	\N
594	2026-05-06 01:21:37.096	103	119	16	\N	50	2026-05-06 01:21:37.097	\N	\N	f	6	2026-05-06 01:21:37.097	\N	APROBADA	\N
595	2026-05-06 01:21:37.099	119	149	30	\N	50	2026-05-06 01:21:37.1	\N	\N	f	7	2026-05-06 01:21:37.1	\N	APROBADA	\N
596	2026-05-06 01:21:37.102	149	158	9	\N	50	2026-05-06 01:21:37.102	\N	\N	f	8	2026-05-06 01:21:37.102	\N	APROBADA	\N
597	2026-05-06 01:21:37.105	158	168	10	\N	50	2026-05-06 01:21:37.106	\N	\N	f	9	2026-05-06 01:21:37.106	\N	APROBADA	\N
598	2026-05-06 01:21:37.108	168	202	34	\N	50	2026-05-06 01:21:37.109	\N	\N	f	10	2026-05-06 01:21:37.109	\N	APROBADA	\N
599	2026-05-06 01:21:37.111	202	219	17	\N	50	2026-05-06 01:21:37.111	\N	\N	f	11	2026-05-06 01:21:37.111	\N	APROBADA	\N
600	2026-05-06 01:21:37.114	219	253	34	\N	50	2026-05-06 01:21:37.117	\N	\N	f	12	2026-05-06 01:21:37.117	\N	APROBADA	\N
\.


--
-- Data for Name: lote; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.lote (lote_id, comunidad_id, periodo_id, total_monto, notas, creado_en, actualizado_en, creado_por, total_emisiones, estado_id) FROM stdin;
2	2	1	184.80	Iniciado: 2026-05-06 01:22:15.265197+00\nCompletado: 2026-05-06 01:22:15.265197+00	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	\N	6	1
\.


--
-- Data for Name: medidores; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.medidores (medidor_id, contrato_id, marca, modelo, serie, fecha_instalacion, fecha_baja, creado_en, actualizado_en, borrado_en, latitud, longitud, motivo, estado_id) FROM stdin;
1	\N	Itron	CEntra 500	SER001	\N	\N	2026-05-06 01:21:35.461	2026-05-06 01:21:35.461	\N	-0.22810000	-78.00230000	\N	1
2	\N	Itron	CEntra 500	SER002	\N	\N	2026-05-06 01:21:35.461	2026-05-06 01:21:35.461	\N	-0.22820000	-78.00240000	\N	1
3	\N	Itron	CEntra 500	SER003	\N	\N	2026-05-06 01:21:35.461	2026-05-06 01:21:35.461	\N	-0.22830000	-78.00250000	\N	1
4	\N	Sensus	iPerl	SEN001	\N	\N	2026-05-06 01:21:35.461	2026-05-06 01:21:35.461	\N	-0.22840000	-78.00260000	\N	1
5	\N	Sensus	iPerl	SEN002	\N	\N	2026-05-06 01:21:35.461	2026-05-06 01:21:35.461	\N	-0.22850000	-78.00270000	\N	1
\.


--
-- Data for Name: menu_permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.menu_permisos (menu_permiso_id, permiso_id, menu_id, borrado_en) FROM stdin;
1	1	19	\N
2	2	20	\N
3	3	21	\N
4	4	22	\N
5	5	23	\N
6	6	24	\N
7	7	25	\N
8	8	26	\N
9	9	27	\N
10	10	28	\N
11	11	29	\N
12	12	30	\N
13	13	31	\N
14	14	32	\N
15	15	33	\N
16	16	34	\N
17	17	35	\N
18	18	36	\N
19	19	37	\N
20	20	38	\N
21	21	39	\N
22	22	40	\N
23	23	41	\N
24	24	42	\N
25	25	43	\N
26	26	44	\N
27	27	45	\N
28	28	46	\N
29	29	47	\N
30	30	48	\N
31	31	49	\N
32	32	50	\N
33	33	51	\N
34	34	52	\N
35	35	53	\N
36	36	54	\N
37	37	55	\N
38	38	56	\N
39	39	57	\N
40	40	58	\N
41	41	59	\N
42	42	60	\N
43	43	61	\N
44	44	62	\N
45	45	63	\N
46	46	64	\N
47	47	65	\N
48	48	66	\N
49	49	67	\N
50	50	68	\N
51	51	69	\N
52	52	70	\N
53	53	71	\N
54	54	72	\N
55	55	73	\N
56	56	74	\N
57	57	75	\N
58	58	76	\N
59	59	77	\N
60	60	78	\N
61	62	81	\N
62	61	82	\N
63	63	83	\N
64	64	84	\N
\.


--
-- Data for Name: menus; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.menus (menu_id, menu_padre_id, icono, nombre, ruta, activo, borrado_en) FROM stdin;
1	\N	contract	Contratos	/Contratos	t	\N
2	1	inbox_text_person	Cliente	/Contratos/Cliente	t	\N
3	1	clean_hands	Contratos de Servicios	/Contratos/ContratosDeServicios	t	\N
4	1	valve	Medidores	/Contratos/Medidores	t	\N
5	1	price_change	Tarifas y Categorias	/Contratos/TarifasYCategorias	t	\N
6	1	dishwasher_gen	Lectura de Consumo	/Contratos/LecturaDeConsumo	t	\N
7	1	handshake	Convenios de pago	/Contratos/ConveniosDePago	t	\N
8	\N	receipt	Facturacion	/Facturacion	t	\N
9	8	assignment	Generacion de Planillas	/Facturacion/GeneracionPlanilla	t	\N
10	8	receipt_long	Facturacion Electronica	/Facturacion/FacturacionElectronica	t	\N
11	8	point_of_sale	Recaudación y pagos	/Facturacion/RecaudacionYPagos	t	\N
12	8	universal_currency	Notas de Credito o Debito	/Facturacion/NotasDeCreditoDebito	t	\N
13	8	export_notes	Envio de Facturas	/Facturacion/EnvioDeFacturacion	t	\N
14	\N	menu_book	Reportes	/Reportes	t	\N
15	14	article_person	Estado de cuenta Cliente	/Reportes/EstadoCuentaCliente	t	\N
16	14	money_off	Recaudación y Morosida	/Reportes/RecaudacionMorosida	t	\N
17	14	location_on	ConsumoPorZonas	/Reportes/ConsumoZonas	t	\N
18	14	dashboard	DashboardKpi	/Reportes/DashboardKpi	t	\N
19	2	\N	Listar Cliente	/Contratos/Cliente/Listar	t	\N
20	2	\N	Crear Cliente	/Contratos/Cliente/Crear	t	\N
21	2	\N	Actualizar Cliente	/Contratos/Cliente/Actualizar	t	\N
22	2	\N	Eliminar Cliente	/Contratos/Cliente/Eliminar	t	\N
23	3	\N	Listar Contratos de Servicios	/Contratos/ContratosDeServicios/Listar	t	\N
24	3	\N	Crear Contratos de Servicios	/Contratos/ContratosDeServicios/Crear	t	\N
25	3	\N	Actualizar Contratos de Servicios	/Contratos/ContratosDeServicios/Actualizar	t	\N
26	3	\N	Eliminar Contratos de Servicios	/Contratos/ContratosDeServicios/Eliminar	t	\N
27	4	\N	Listar Medidores	/Contratos/Medidores/Listar	t	\N
28	4	\N	Crear Medidores	/Contratos/Medidores/Crear	t	\N
29	4	\N	Actualizar Medidores	/Contratos/Medidores/Actualizar	t	\N
30	4	\N	Eliminar Medidores	/Contratos/Medidores/Eliminar	t	\N
31	5	\N	Listar Tarifas y Categorias	/Contratos/TarifasYCategorias/Listar	t	\N
32	5	\N	Crear Tarifas y Categorias	/Contratos/TarifasYCategorias/Crear	t	\N
33	5	\N	Actualizar Tarifas y Categorias	/Contratos/TarifasYCategorias/Actualizar	t	\N
34	5	\N	Eliminar Tarifas y Categorias	/Contratos/TarifasYCategorias/Eliminar	t	\N
35	6	\N	Listar Lectura de Consumo	/Contratos/LecturaDeConsumo/Listar	t	\N
36	6	\N	Crear Lectura de Consumo	/Contratos/LecturaDeConsumo/Crear	t	\N
37	6	\N	Actualizar Lectura de Consumo	/Contratos/LecturaDeConsumo/Actualizar	t	\N
38	6	\N	Eliminar Lectura de Consumo	/Contratos/LecturaDeConsumo/Eliminar	t	\N
39	7	\N	Listar Convenios de pago	/Contratos/ConveniosDePago/Listar	t	\N
40	7	\N	Crear Convenios de pago	/Contratos/ConveniosDePago/Crear	t	\N
41	7	\N	Actualizar Convenios de pago	/Contratos/ConveniosDePago/Actualizar	t	\N
42	7	\N	Eliminar Convenios de pago	/Contratos/ConveniosDePago/Eliminar	t	\N
43	9	\N	Listar Generacion de Planillas	/Facturacion/GeneracionPlanilla/Listar	t	\N
44	9	\N	Crear Generacion de Planillas	/Facturacion/GeneracionPlanilla/Crear	t	\N
45	9	\N	Actualizar Generacion de Planillas	/Facturacion/GeneracionPlanilla/Actualizar	t	\N
46	9	\N	Eliminar Generacion de Planillas	/Facturacion/GeneracionPlanilla/Eliminar	t	\N
47	10	\N	Listar Facturacion Electronica	/Facturacion/FacturacionElectronica/Listar	t	\N
48	10	\N	Crear Facturacion Electronica	/Facturacion/FacturacionElectronica/Crear	t	\N
49	10	\N	Actualizar Facturacion Electronica	/Facturacion/FacturacionElectronica/Actualizar	t	\N
50	10	\N	Eliminar Facturacion Electronica	/Facturacion/FacturacionElectronica/Eliminar	t	\N
51	11	\N	Listar Recaudación y pagos	/Facturacion/RecaudacionYPagos/Listar	t	\N
52	11	\N	Crear Recaudación y pagos	/Facturacion/RecaudacionYPagos/Crear	t	\N
53	11	\N	Actualizar Recaudación y pagos	/Facturacion/RecaudacionYPagos/Actualizar	t	\N
54	11	\N	Eliminar Recaudación y pagos	/Facturacion/RecaudacionYPagos/Eliminar	t	\N
55	12	\N	Listar Notas de Credito o Debito	/Facturacion/NotasDeCreditoDebito/Listar	t	\N
56	12	\N	Crear Notas de Credito o Debito	/Facturacion/NotasDeCreditoDebito/Crear	t	\N
57	12	\N	Actualizar Notas de Credito o Debito	/Facturacion/NotasDeCreditoDebito/Actualizar	t	\N
58	12	\N	Eliminar Notas de Credito o Debito	/Facturacion/NotasDeCreditoDebito/Eliminar	t	\N
59	13	\N	Listar Envio de Facturas	/Facturacion/EnvioDeFacturacion/Listar	t	\N
60	13	\N	Crear Envio de Facturas	/Facturacion/EnvioDeFacturacion/Crear	t	\N
61	13	\N	Actualizar Envio de Facturas	/Facturacion/EnvioDeFacturacion/Actualizar	t	\N
62	13	\N	Eliminar Envio de Facturas	/Facturacion/EnvioDeFacturacion/Eliminar	t	\N
63	15	\N	Listar Estado de cuenta Cliente	/Reportes/EstadoCuentaCliente/Listar	t	\N
64	15	\N	Crear Estado de cuenta Cliente	/Reportes/EstadoCuentaCliente/Crear	t	\N
65	15	\N	Actualizar Estado de cuenta Cliente	/Reportes/EstadoCuentaCliente/Actualizar	t	\N
66	15	\N	Eliminar Estado de cuenta Cliente	/Reportes/EstadoCuentaCliente/Eliminar	t	\N
67	16	\N	Listar Recaudación y Morosida	/Reportes/RecaudacionMorosida/Listar	t	\N
68	16	\N	Crear Recaudación y Morosida	/Reportes/RecaudacionMorosida/Crear	t	\N
69	16	\N	Actualizar Recaudación y Morosida	/Reportes/RecaudacionMorosida/Actualizar	t	\N
70	16	\N	Eliminar Recaudación y Morosida	/Reportes/RecaudacionMorosida/Eliminar	t	\N
71	17	\N	Listar ConsumoPorZonas	/Reportes/ConsumoZonas/Listar	t	\N
72	17	\N	Crear ConsumoPorZonas	/Reportes/ConsumoZonas/Crear	t	\N
73	17	\N	Actualizar ConsumoPorZonas	/Reportes/ConsumoZonas/Actualizar	t	\N
74	17	\N	Eliminar ConsumoPorZonas	/Reportes/ConsumoZonas/Eliminar	t	\N
75	18	\N	Listar DashboardKpi	/Reportes/DashboardKpi/Listar	t	\N
76	18	\N	Crear DashboardKpi	/Reportes/DashboardKpi/Crear	t	\N
77	18	\N	Actualizar DashboardKpi	/Reportes/DashboardKpi/Actualizar	t	\N
78	18	\N	Eliminar DashboardKpi	/Reportes/DashboardKpi/Eliminar	t	\N
79	\N	admin_panel_settings	Administracion Sistema	/admin	t	\N
80	79	group	Usuarios y Roles	/admin/users	t	\N
81	80	\N	Lectura Usuarios	/admin/users	t	\N
82	80	\N	Escritura Usuarios	/admin/users	t	\N
83	80	\N	Actualizacion Usuarios	/admin/users	t	\N
84	80	\N	Eliminacion Usuarios	/admin/users	t	\N
\.


--
-- Data for Name: notas_credito; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.notas_credito (id, uuid, factura_id, punto_emision_id, periodo_id, tipo_comprobante_id, clave_acceso, secuencial, numero_autorizacion, fecha_emision, motivo, subtotal, iva, total, xml_firmado_url, xml_autorizado_url, estado_sri, creado_en, actualizado_en) FROM stdin;
\.


--
-- Data for Name: notas_credito_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.notas_credito_detalle (id, nota_credito_id, descripcion, cantidad, precio_unitario, descuento, subtotal, iva, total) FROM stdin;
\.


--
-- Data for Name: notas_debito; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.notas_debito (id, uuid, factura_id, punto_emision_id, periodo_id, tipo_comprobante_id, forma_pago_id, clave_acceso, secuencial, numero_autorizacion, fecha_emision, subtotal, iva, total, xml_firmado_url, xml_autorizado_url, estado_sri, creado_en, actualizado_en, codigo_impuesto_sri, codigo_porcentaje_sri, motivo, tarifa_impuesto) FROM stdin;
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.pagos (pago_id, caja_id, comprobante_url_minio, fecha_pago, monto_total_recibido, numero_operacion, observaciones, referencia_banco, actualizado_en, creado_en, borrado_en, usuario_id, cliente_id, anulado_por, estado_validacion, fecha_anulacion, motivo_anulacion) FROM stdin;
\.


--
-- Data for Name: parametro_tasa_interes; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.parametro_tasa_interes (parametro_id, tasa, vigente_desde, vigente_hasta, descripcion, activo, creado_en, actualizado_en, borrado_en) FROM stdin;
\.


--
-- Data for Name: perfiles; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.perfiles (perfil_id, primer_nombre, apellido, telefono, avatar, creado_en, actualizado_en, usuario_id) FROM stdin;
\.


--
-- Data for Name: periodos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.periodos (periodo_id, nombre, fecha_inicio, fecha_fin, fecha_vencimiento, estado, creado_en, actualizado_en) FROM stdin;
1	2025-04	2025-04-01 00:00:00	2025-04-28 00:00:00	2025-04-30 00:00:00	ABIERTO	2026-05-06 01:21:35.742	2026-05-06 01:21:35.742
2	2025-05	2025-05-01 00:00:00	2025-05-28 00:00:00	2025-05-30 00:00:00	ABIERTO	2026-05-06 01:21:35.745	2026-05-06 01:21:35.745
3	2025-06	2025-06-01 00:00:00	2025-06-28 00:00:00	2025-06-30 00:00:00	ABIERTO	2026-05-06 01:21:35.749	2026-05-06 01:21:35.749
4	2025-07	2025-07-01 00:00:00	2025-07-28 00:00:00	2025-07-30 00:00:00	ABIERTO	2026-05-06 01:21:35.752	2026-05-06 01:21:35.752
5	2025-08	2025-08-01 00:00:00	2025-08-28 00:00:00	2025-08-30 00:00:00	ABIERTO	2026-05-06 01:21:35.755	2026-05-06 01:21:35.755
6	2025-09	2025-09-01 00:00:00	2025-09-28 00:00:00	2025-09-30 00:00:00	ABIERTO	2026-05-06 01:21:35.757	2026-05-06 01:21:35.757
7	2025-10	2025-10-01 00:00:00	2025-10-28 00:00:00	2025-10-30 00:00:00	ABIERTO	2026-05-06 01:21:35.76	2026-05-06 01:21:35.76
8	2025-11	2025-11-01 00:00:00	2025-11-28 00:00:00	2025-11-30 00:00:00	ABIERTO	2026-05-06 01:21:35.762	2026-05-06 01:21:35.762
9	2025-12	2025-12-01 00:00:00	2025-12-28 00:00:00	2025-12-30 00:00:00	ABIERTO	2026-05-06 01:21:35.764	2026-05-06 01:21:35.764
10	2026-01	2026-01-01 00:00:00	2026-01-28 00:00:00	2026-01-30 00:00:00	ABIERTO	2026-05-06 01:21:35.767	2026-05-06 01:21:35.767
11	2026-02	2026-02-01 00:00:00	2026-02-28 00:00:00	2026-03-02 00:00:00	ABIERTO	2026-05-06 01:21:35.769	2026-05-06 01:21:35.769
12	2026-03	2026-03-01 00:00:00	2026-03-28 00:00:00	2026-03-30 00:00:00	ABIERTO	2026-05-06 01:21:35.771	2026-05-06 01:21:35.771
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.permisos (permiso_id, recurso, accion, borrado_en) FROM stdin;
1	clientes	read	\N
2	clientes	create	\N
3	clientes	update	\N
4	clientes	delete	\N
5	contratos	read	\N
6	contratos	create	\N
7	contratos	update	\N
8	contratos	delete	\N
9	medidores	read	\N
10	medidores	create	\N
11	medidores	update	\N
12	medidores	delete	\N
13	tarifas	read	\N
14	tarifas	create	\N
15	tarifas	update	\N
16	tarifas	delete	\N
17	lecturas	read	\N
18	lecturas	create	\N
19	lecturas	update	\N
20	lecturas	delete	\N
21	convenios	read	\N
22	convenios	create	\N
23	convenios	update	\N
24	convenios	delete	\N
25	planillas	read	\N
26	planillas	create	\N
27	planillas	update	\N
28	planillas	delete	\N
29	facturacion_electronica	read	\N
30	facturacion_electronica	create	\N
31	facturacion_electronica	update	\N
32	facturacion_electronica	delete	\N
33	recaudacion	read	\N
34	recaudacion	create	\N
35	recaudacion	update	\N
36	recaudacion	delete	\N
37	notas_credito	read	\N
38	notas_credito	create	\N
39	notas_credito	update	\N
40	notas_credito	delete	\N
41	envio_facturas	read	\N
42	envio_facturas	create	\N
43	envio_facturas	update	\N
44	envio_facturas	delete	\N
45	estado_cuenta	read	\N
46	estado_cuenta	create	\N
47	estado_cuenta	update	\N
48	estado_cuenta	delete	\N
49	recaudacion_morosidad	read	\N
50	recaudacion_morosidad	create	\N
51	recaudacion_morosidad	update	\N
52	recaudacion_morosidad	delete	\N
53	consumo_zonas	read	\N
54	consumo_zonas	create	\N
55	consumo_zonas	update	\N
56	consumo_zonas	delete	\N
57	dashboard	read	\N
58	dashboard	create	\N
59	dashboard	update	\N
60	dashboard	delete	\N
61	users	create	\N
62	users	read	\N
63	users	update	\N
64	users	delete	\N
65	roles	create	\N
66	roles	read	\N
67	roles	update	\N
68	roles	delete	\N
69	permissions	create	\N
70	permissions	read	\N
71	permissions	update	\N
72	permissions	delete	\N
\.


--
-- Data for Name: prefactura_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.prefactura_detalle (prefactura_detalle_id, prefactura_id, rubro_id, descripcion, cantidad, precio_unitario, subtotal, iva, total, codigo_impuesto_sri, creado_en, actualizado_en, descuento, cuota_convenio_id, codigo_porcentaje_sri, tarifa_impuesto) FROM stdin;
1	1	1	Consumo de agua potable m3	1.00	5.00	5.00	0.00	2.50	\N	2026-05-06 01:21:37.169	2026-05-06 01:21:37.169	2.50	\N	\N	0.00
2	1	2	Cargo Fijo Mensual	1.00	5.00	5.00	0.00	5.00	\N	2026-05-06 01:21:37.179	2026-05-06 01:21:37.179	0.00	\N	\N	0.00
3	1	4	Tasa Seguridad Ciudadana	1.00	5.00	5.00	0.00	5.00	\N	2026-05-06 01:21:37.184	2026-05-06 01:21:37.184	0.00	\N	\N	0.00
4	2	2	Cargo Fijo	1.00	4.00	4.00	0.48	4.48	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
5	2	1	Excedente Consumo	11.00	0.40	4.40	0.53	4.93	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
6	3	2	Cargo Fijo	1.00	4.00	4.00	0.48	4.48	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
7	3	1	Excedente Consumo	14.00	0.40	5.60	0.67	6.27	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
8	4	2	Cargo Fijo	1.00	7.50	7.50	0.90	8.40	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
9	4	1	Excedente Consumo	33.00	0.75	24.75	2.97	27.72	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
10	5	2	Cargo Fijo	1.00	15.00	15.00	1.80	16.80	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
11	5	1	Excedente Consumo	22.00	1.50	33.00	3.96	36.96	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
12	6	2	Cargo Fijo	1.00	15.00	15.00	1.80	16.80	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
13	6	1	Excedente Consumo	25.00	1.50	37.50	4.50	42.00	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
14	7	2	Cargo Fijo	1.00	7.50	7.50	0.90	8.40	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
15	7	1	Excedente Consumo	9.00	0.75	6.75	0.81	7.56	2	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	0.00	\N	2	12.00
\.


--
-- Data for Name: prefacturas; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.prefacturas (prefactura_id, uuid, contrato_id, lote_id, periodo_id, punto_emision_id, lectura_anterior, lectura_actual, consumo_m3, subtotal, iva, descuento_total, total_pagar, deuda_anterior, saldo_vencido, abono, saldo_actual, meses_atrasado, estado, aprobada_por, fecha_aprobacion, motivo_rechazo, creado_por, actualizado_por, creado_en, actualizado_en, borrado_en, interes_mora, cliente_direccion, cliente_email, cliente_identificacion, cliente_nombre, tarifa_nombre, tarifa_valor_base, tarifa_valor_excedente, lectura_id, tasa_interes_usada) FROM stdin;
1	5f211df7-600e-48ee-a953-6cbba1d7eaad	1	\N	1	1	\N	\N	\N	15.00	0.00	2.50	12.50	0.00	0.00	0.00	12.50	0	GENERADA	\N	\N	\N	\N	\N	2026-05-06 01:21:37.162	2026-05-06 01:21:37.162	\N	0.00	Olón	juan@test.com	1234567890	Juan Perez	\N	\N	\N	\N	0.0000
2	b34fc7a2-8fc0-4c78-90c2-2d4bdea84516	3	2	1	1	0.00	11.00	11.00	8.40	1.01	0.00	9.41	0.00	0.00	0.00	9.41	0	GENERADA	\N	\N	\N	admin	\N	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	\N	0.00	Direccion contrato 3	pedro@test.com	1234567892	Pedro Lopez	\N	4.00	0.40	25	0.3333
3	09ceea5d-d3d5-474b-8295-8ec62bb843d0	8	2	1	1	0.00	14.00	14.00	9.60	1.15	0.00	10.75	0.00	0.00	0.00	10.75	0	GENERADA	\N	\N	\N	admin	\N	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	\N	0.00	Direccion contrato 8	cliente8@test.com	13100000008	Cliente 8 Apellido 8	\N	4.00	0.40	85	0.3333
4	f88e4713-ac98-4a08-8f82-4a0776e2b524	13	2	1	1	0.00	33.00	33.00	32.25	3.87	0.00	36.12	0.00	0.00	0.00	36.12	0	GENERADA	\N	\N	\N	admin	\N	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	\N	0.00	Direccion contrato 13	cliente13@test.com	13100000013	Cliente 13 Apellido 13	\N	7.50	0.75	145	0.6250
5	91193140-c21e-4783-b57e-20a825fbf3bb	20	2	1	1	0.00	22.00	22.00	48.00	5.76	0.00	53.76	0.00	0.00	0.00	53.76	0	GENERADA	\N	\N	\N	admin	\N	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	\N	0.00	Direccion contrato 20	cliente20@test.com	13100000020	Cliente 20 Apellido 20	\N	15.00	1.50	229	1.2500
6	683d18cb-2826-4782-a44b-8a2be2b22cae	24	2	1	1	0.00	25.00	25.00	52.50	6.30	0.00	58.80	0.00	0.00	0.00	58.80	0	GENERADA	\N	\N	\N	admin	\N	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	\N	0.00	Direccion contrato 24	cliente24@test.com	13100000024	Cliente 24 Apellido 24	\N	15.00	1.50	277	1.2500
7	237e5ef0-d925-4454-8f6a-95343557f99c	27	2	1	1	0.00	9.00	9.00	14.25	1.71	0.00	15.96	0.00	0.00	0.00	15.96	0	GENERADA	\N	\N	\N	admin	\N	2026-05-06 01:22:15.265	2026-05-06 01:22:15.265	\N	0.00	Direccion contrato 27	cliente27@test.com	13100000027	Cliente 27 Apellido 27	\N	7.50	0.75	313	0.6250
\.


--
-- Data for Name: preferencias_sistema; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.preferencias_sistema (id, clave, valor, descripcion, categoria, actualizado_en, actualizado_por) FROM stdin;
\.


--
-- Data for Name: puntos_emision; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.puntos_emision (punto_emision_id, establecimiento_id, codigo, nombre, secuencial_actual, creado_en, actualizado_en) FROM stdin;
1	1	001	VENTANILLA 1	1	2026-05-06 01:21:35.346	2026-05-06 01:21:35.346
\.


--
-- Data for Name: retencion_detalle; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.retencion_detalle (id, retencion_id, codigo_impuesto, codigo_retencion, base_imponible, porcentaje_retener, valor_retenido) FROM stdin;
\.


--
-- Data for Name: retenciones; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.retenciones (id, uuid, punto_emision_id, periodo_id, tipo_comprobante_id, clave_acceso, secuencial, numero_autorizacion, fecha_emision, xml_firmado_url, xml_autorizado_url, estado_sri, creado_en, actualizado_en) FROM stdin;
\.


--
-- Data for Name: rol_permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.rol_permisos (rol_permiso_id, rol_id, permiso_id, borrado_en) FROM stdin;
1	1	1	\N
2	1	2	\N
3	1	3	\N
4	1	4	\N
5	1	5	\N
6	1	6	\N
7	1	7	\N
8	1	8	\N
9	1	9	\N
10	1	10	\N
11	1	11	\N
12	1	12	\N
13	1	13	\N
14	1	14	\N
15	1	15	\N
16	1	16	\N
17	1	17	\N
18	1	18	\N
19	1	19	\N
20	1	20	\N
21	1	21	\N
22	1	22	\N
23	1	23	\N
24	1	24	\N
25	1	25	\N
26	1	26	\N
27	1	27	\N
28	1	28	\N
29	1	29	\N
30	1	30	\N
31	1	31	\N
32	1	32	\N
33	1	33	\N
34	1	34	\N
35	1	35	\N
36	1	36	\N
37	1	37	\N
38	1	38	\N
39	1	39	\N
40	1	40	\N
41	1	41	\N
42	1	42	\N
43	1	43	\N
44	1	44	\N
45	1	45	\N
46	1	46	\N
47	1	47	\N
48	1	48	\N
49	1	49	\N
50	1	50	\N
51	1	51	\N
52	1	52	\N
53	1	53	\N
54	1	54	\N
55	1	55	\N
56	1	56	\N
57	1	57	\N
58	1	58	\N
59	1	59	\N
60	1	60	\N
61	1	61	\N
62	1	62	\N
63	1	63	\N
64	1	64	\N
65	1	65	\N
66	1	66	\N
67	1	67	\N
68	1	68	\N
69	1	69	\N
70	1	70	\N
71	1	71	\N
72	1	72	\N
73	2	1	\N
74	2	2	\N
75	2	3	\N
76	2	4	\N
77	2	5	\N
78	2	6	\N
79	2	7	\N
80	2	8	\N
81	2	9	\N
82	2	10	\N
83	2	11	\N
84	2	12	\N
85	2	13	\N
86	2	14	\N
87	2	15	\N
88	2	16	\N
89	2	17	\N
90	2	18	\N
91	2	19	\N
92	2	20	\N
93	2	21	\N
94	2	22	\N
95	2	23	\N
96	2	24	\N
97	3	25	\N
98	3	26	\N
99	3	27	\N
100	3	28	\N
101	3	29	\N
102	3	30	\N
103	3	31	\N
104	3	32	\N
105	3	33	\N
106	3	34	\N
107	3	35	\N
108	3	36	\N
109	3	37	\N
110	3	38	\N
111	3	39	\N
112	3	40	\N
113	3	41	\N
114	3	42	\N
115	3	43	\N
116	3	44	\N
117	4	45	\N
118	4	49	\N
119	4	53	\N
120	4	57	\N
121	5	1	\N
122	5	2	\N
123	5	3	\N
124	5	5	\N
125	5	6	\N
126	5	7	\N
127	5	9	\N
128	5	10	\N
129	5	11	\N
130	5	17	\N
131	5	18	\N
132	5	19	\N
133	5	21	\N
134	5	22	\N
135	5	23	\N
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.roles (rol_id, nombre, borrado_en) FROM stdin;
1	admin	\N
2	secretaria	\N
3	recaudacion	\N
4	presidencia	\N
5	operadores	\N
6	contabilidad	\N
7	user	\N
\.


--
-- Data for Name: rubros; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.rubros (rubro_id, codigo_sri, nombre, descripcion, precio_unitario, tipo_rubro, impuesto_id, activo, creado_en, actualizado_en, borrado_en) FROM stdin;
1	001	Consumo Agua	Consumo de agua potable m3	0.50	VARIABLE	2	t	2026-05-06 01:21:37.134	2026-05-06 01:21:37.134	\N
2	002	Cargo Fijo	Mantenimiento básico de conexión	5.00	FIJO	2	t	2026-05-06 01:21:37.134	2026-05-06 01:21:37.134	\N
3	003	Interés Mora	Interés por falta de pago puntual	0.10	MULTA	1	t	2026-05-06 01:21:37.134	2026-05-06 01:21:37.134	\N
4	004	Tasa Seguridad Olón	Tasa de seguridad comunitaria (Solo Olón)	2.00	FIJO	1	t	2026-05-06 01:21:37.134	2026-05-06 01:21:37.134	\N
5	005	Instalación Medidor	Costo de nueva acometida e instalación	150.00	SERVICIO	2	t	2026-05-06 01:21:37.134	2026-05-06 01:21:37.134	\N
\.


--
-- Data for Name: saldo_favor_cliente; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.saldo_favor_cliente (saldo_favor_id, cliente_id, pago_id, monto_saldo, tipo_origen, disponible_para_aplicar, creado_en, borrado_en) FROM stdin;
\.


--
-- Data for Name: sectores; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.sectores (sector_id, comunidad_id, codigo, nombre, creado_en, actualizado_en, borrado_en) FROM stdin;
1	1	SEC-OLON-NORTE	Sector Norte Olón	2026-05-06 01:21:35.398	2026-05-06 01:21:35.398	\N
2	1	SEC-OLON-SUR	Sector Sur Olón	2026-05-06 01:21:35.402	2026-05-06 01:21:35.402	\N
3	1	SEC-OLON-CENTRO	Sector Centro Olón	2026-05-06 01:21:35.404	2026-05-06 01:21:35.404	\N
4	1	SEC-OLON-PLAYA	Sector Playa Olón	2026-05-06 01:21:35.406	2026-05-06 01:21:35.406	\N
\.


--
-- Data for Name: sesiones; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.sesiones (sesion_id, usuario_id, hash_token_actualizado, direccion_ip, usuario_agente, revocado, expira_en, creado_en) FROM stdin;
\.


--
-- Data for Name: sri_forma_pago; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.sri_forma_pago (id, codigo, nombre, activo) FROM stdin;
1	01	EFECTIVO (SIN UTILIZACION DEL SISTEMA FINANCIERO)	t
16	16	TARJETA DE DEBITO	t
19	19	TARJETA DE CREDITO	t
20	20	TRANSFERENCIA/OTROS (CON UTILIZACION DEL SISTEMA FINANCIERO)	t
\.


--
-- Data for Name: sri_impuesto; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.sri_impuesto (id, codigo, codigo_porcentaje, nombre, tarifa, activo, creado_en, actualizado_en) FROM stdin;
1	2	0	IVA 0%	0	t	2026-05-06 01:21:35.357	2026-05-06 01:21:35.357
2	2	2	IVA 12%	12	t	2026-05-06 01:21:35.361	2026-05-06 01:21:35.361
4	2	4	IVA 15%	15	t	2026-05-06 01:21:35.363	2026-05-06 01:21:35.363
5	2	5	IVA 5%	5	t	2026-05-06 01:21:35.366	2026-05-06 01:21:35.366
\.


--
-- Data for Name: sri_tipo_comprobante; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.sri_tipo_comprobante (id, codigo, nombre, descripcion, activo) FROM stdin;
1	01	FACTURA	\N	t
4	04	NOTA DE CRÉDITO	\N	t
5	05	NOTA DE DÉBITO	\N	t
6	06	GUÍA DE REMISIÓN	\N	t
7	07	COMPROBANTE DE RETENCIÓN	\N	t
\.


--
-- Data for Name: usuario_permisos; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.usuario_permisos (id_usuario_permiso, usuario_id, permiso_id, permitir, borrado_en) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: appuser
--

COPY public.usuarios (usuario_id, email, contrasenia, rol_id, borrado_en) FROM stdin;
1	admin@jasrapo.com	$2b$10$SxA1lMhs2svMcPPjVXHqU.p9qbsnNO/plt.uzMB2RkDOzGjTH.i9K	1	\N
2	secretaria@jasrapo.com	$2b$10$ZKeCMTlJt9DL5I.7BEc4J.JAwnQUTMsSDWgiRqZxahwnTnmnA5dI6	2	\N
3	recaudacion@jasrapo.com	$2b$10$PaaS96n2nb14KHFpq6FBCe3RnemIvFvge9rwWlKpGOweKsEqorleK	3	\N
4	presidencia@jasrapo.com	$2b$10$yse64JgT9RbX8Z7gxzcGoODydE8FOmQm6h/Dfxm2csFFpYdiIZ55C	4	\N
5	operadores@jasrapo.com	$2b$10$RGNLPqdYuYYGa2raimthaOYrHwAIQjPLcILfmeMxS.X2KF4QCfjNm	5	\N
6	contabilidad@jasrapo.com	$2b$10$Q2MQYULDRLUdOZhUp48mK.6Wxus9m19bX4KEa3Lf26HyAYxokfGp2	6	\N
7	user@jasrapo.com	$2b$10$K91wIJ5Y9u/m97LNvSIGz.D0qVkJWK280hCXZhfAAHA/zPkACa4Ky	7	\N
\.


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
-- Name: estado_lote_estado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.estado_lote_estado_id_seq', 3, true);


--
-- Name: estado_medidor_estado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.estado_medidor_estado_id_seq', 5, true);


--
-- Name: facturas_factura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.facturas_factura_id_seq', 1, true);


--
-- Name: historial_medidores_historial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.historial_medidores_historial_id_seq', 1, true);


--
-- Name: identificacion_identificacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.identificacion_identificacion_id_seq', 5, true);


--
-- Name: lectura_anomalia_anomalia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.lectura_anomalia_anomalia_id_seq', 1, true);


--
-- Name: lecturas_lectura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.lecturas_lectura_id_seq', 600, true);


--
-- Name: lote_lote_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.lote_lote_id_seq', 2, true);


--
-- Name: medidores_medidor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.medidores_medidor_id_seq', 5, true);


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

SELECT pg_catalog.setval('public.prefactura_detalle_prefactura_detalle_id_seq', 15, true);


--
-- Name: prefacturas_prefactura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: appuser
--

SELECT pg_catalog.setval('public.prefacturas_prefactura_id_seq', 7, true);


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
-- Name: estado_lote estado_lote_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.estado_lote
    ADD CONSTRAINT estado_lote_pkey PRIMARY KEY (estado_id);


--
-- Name: estado_medidor estado_medidor_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.estado_medidor
    ADD CONSTRAINT estado_medidor_pkey PRIMARY KEY (estado_id);


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
-- Name: identificacion identificacion_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.identificacion
    ADD CONSTRAINT identificacion_pkey PRIMARY KEY (identificacion_id);


--
-- Name: lectura_anomalia lectura_anomalia_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lectura_anomalia
    ADD CONSTRAINT lectura_anomalia_pkey PRIMARY KEY (anomalia_id);


--
-- Name: lecturas lecturas_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lecturas
    ADD CONSTRAINT lecturas_pkey PRIMARY KEY (lectura_id);


--
-- Name: lote lote_pkey; Type: CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_pkey PRIMARY KEY (lote_id);


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
-- Name: estado_lote_activo_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX estado_lote_activo_idx ON public.estado_lote USING btree (activo);


--
-- Name: estado_lote_codigo_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX estado_lote_codigo_idx ON public.estado_lote USING btree (codigo);


--
-- Name: estado_lote_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX estado_lote_codigo_key ON public.estado_lote USING btree (codigo);


--
-- Name: estado_medidor_activo_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX estado_medidor_activo_idx ON public.estado_medidor USING btree (activo);


--
-- Name: estado_medidor_codigo_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX estado_medidor_codigo_idx ON public.estado_medidor USING btree (codigo);


--
-- Name: estado_medidor_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX estado_medidor_codigo_key ON public.estado_medidor USING btree (codigo);


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
-- Name: identificacion_activo_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX identificacion_activo_idx ON public.identificacion USING btree (activo);


--
-- Name: identificacion_codigo_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX identificacion_codigo_idx ON public.identificacion USING btree (codigo);


--
-- Name: identificacion_codigo_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX identificacion_codigo_key ON public.identificacion USING btree (codigo);


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
-- Name: lote_comunidad_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lote_comunidad_id_idx ON public.lote USING btree (comunidad_id);


--
-- Name: lote_comunidad_id_periodo_id_key; Type: INDEX; Schema: public; Owner: appuser
--

CREATE UNIQUE INDEX lote_comunidad_id_periodo_id_key ON public.lote USING btree (comunidad_id, periodo_id);


--
-- Name: lote_periodo_id_idx; Type: INDEX; Schema: public; Owner: appuser
--

CREATE INDEX lote_periodo_id_idx ON public.lote USING btree (periodo_id);


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
-- Name: lecturas trg_actualizar_consumo_lectura; Type: TRIGGER; Schema: public; Owner: appuser
--

CREATE TRIGGER trg_actualizar_consumo_lectura BEFORE INSERT OR UPDATE ON public.lecturas FOR EACH ROW EXECUTE FUNCTION public.actualizar_consumo_lectura();


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
-- Name: clientes clientes_tipo_identificacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_tipo_identificacion_id_fkey FOREIGN KEY (tipo_identificacion_id) REFERENCES public.identificacion(identificacion_id) ON UPDATE CASCADE ON DELETE SET NULL;


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
-- Name: lectura_anomalia lectura_anomalia_lectura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lectura_anomalia
    ADD CONSTRAINT lectura_anomalia_lectura_id_fkey FOREIGN KEY (lectura_id) REFERENCES public.lecturas(lectura_id) ON UPDATE CASCADE ON DELETE RESTRICT;


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
-- Name: lote lote_comunidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_comunidad_id_fkey FOREIGN KEY (comunidad_id) REFERENCES public.comunidades(comunidad_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lote lote_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lote lote_estado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_estado_id_fkey FOREIGN KEY (estado_id) REFERENCES public.estado_lote(estado_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lote lote_periodo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.lote
    ADD CONSTRAINT lote_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos(periodo_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: medidores medidores_contrato_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.medidores
    ADD CONSTRAINT medidores_contrato_id_fkey FOREIGN KEY (contrato_id) REFERENCES public.contratos(contrato_id) ON DELETE RESTRICT;


--
-- Name: medidores medidores_estado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: appuser
--

ALTER TABLE ONLY public.medidores
    ADD CONSTRAINT medidores_estado_id_fkey FOREIGN KEY (estado_id) REFERENCES public.estado_medidor(estado_id) ON UPDATE CASCADE ON DELETE SET NULL;


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
    ADD CONSTRAINT prefacturas_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES public.lote(lote_id) ON DELETE SET NULL;


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

\unrestrict 8dOk84fJxfpbpgqvmfxjAerKgQRbUMQ6390ke4FaHblydoc3FpEa04gHr9uNLZ9

