-- Migration: Add updated_at triggers
-- Created: 2026-03-28
-- Note: Uses DO blocks to handle missing tables gracefully

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to prefactura (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prefactura') THEN
        DROP TRIGGER IF EXISTS trg_updated_at_prefactura ON prefactura;
        CREATE TRIGGER trg_updated_at_prefactura
            BEFORE UPDATE ON prefactura
            FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
    END IF;
END $$;

-- Apply to contratos (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contratos') THEN
        DROP TRIGGER IF EXISTS trg_updated_at_contratos ON contratos;
        CREATE TRIGGER trg_updated_at_contratos
            BEFORE UPDATE ON contratos
            FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
    END IF;
END $$;

-- Apply to clientes (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes') THEN
        DROP TRIGGER IF EXISTS trg_updated_at_clientes ON clientes;
        CREATE TRIGGER trg_updated_at_clientes
            BEFORE UPDATE ON clientes
            FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
    END IF;
END $$;

-- Apply to comunidades (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comunidades') THEN
        DROP TRIGGER IF EXISTS trg_updated_at_comunidades ON comunidades;
        CREATE TRIGGER trg_updated_at_comunidades
            BEFORE UPDATE ON comunidades
            FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
    END IF;
END $$;

-- Apply to producto (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'producto') THEN
        DROP TRIGGER IF EXISTS trg_updated_at_producto ON producto;
        CREATE TRIGGER trg_updated_at_producto
            BEFORE UPDATE ON producto
            FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
    END IF;
END $$;

-- Apply to servicio (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'servicio') THEN
        DROP TRIGGER IF EXISTS trg_updated_at_servicio ON servicio;
        CREATE TRIGGER trg_updated_at_servicio
            BEFORE UPDATE ON servicio
            FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
    END IF;
END $$;
