-- Unify TipoDetallePago enum: FACTURA + NOTA_DEBITO → COMPROBANTE
-- El modelo Facturas y NotasDebito ya no existen como tablas separadas,
-- ambos son tipos de Comprobantes.

-- 1. Add new COMPROBANTE value to existing enum
ALTER TYPE "TipoDetallePago" ADD VALUE 'COMPROBANTE';

-- 2. Update existing data: FACTURA → COMPROBANTE, NOTA_DEBITO → COMPROBANTE
UPDATE "detalle_pago" SET "tipo_pago" = 'COMPROBANTE' WHERE "tipo_pago" = 'FACTURA';
UPDATE "detalle_pago" SET "tipo_pago" = 'COMPROBANTE' WHERE "tipo_pago" = 'NOTA_DEBITO';

-- 3. Create new type without FACTURA and NOTA_DEBITO (not available in this PG build)
CREATE TYPE "TipoDetallePago_new" AS ENUM ('COMPROBANTE', 'CUOTA_CONVENIO', 'PAGO_LIBRE', 'SALDO_FAVOR');

-- 4. Migrate column to new type
ALTER TABLE "detalle_pago" ALTER COLUMN "tipo_pago" TYPE "TipoDetallePago_new" USING ("tipo_pago"::text::"TipoDetallePago_new");

-- 5. Drop old type
DROP TYPE "TipoDetallePago";

-- 6. Rename new type
ALTER TYPE "TipoDetallePago_new" RENAME TO "TipoDetallePago";
