--
-- PostgreSQL database dump
--

\restrict ZWbOTrPBwyfAbja9sxp0ewrfzc2qoBfemZlC6OdbFVJG6plQtLQb9ltqQkeogew

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

\unrestrict ZWbOTrPBwyfAbja9sxp0ewrfzc2qoBfemZlC6OdbFVJG6plQtLQb9ltqQkeogew

