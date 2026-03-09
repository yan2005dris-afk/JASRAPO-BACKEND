/*
  Warnings:

  - You are about to alter the column `monto_cuota` on the `convenios` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `cantidad` on the `detalle_factura` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `precio_unitario` on the `detalle_factura` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `total` on the `detalle_factura` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `consumo` on the `facturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `tarifa` on the `facturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `interes_mora` on the `facturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `abono` on the `facturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `saldo` on the `facturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lectura_anterior` on the `lecturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `lectura_actual` on the `lecturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `consumo_calculado` on the `lecturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `valor_monetario` on the `lecturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `abono` on the `lecturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `saldo_pendiente` on the `lecturas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `monto` on the `pagos` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "clientes_medidores" ALTER COLUMN "fecha_asignacion" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "fecha_retiro" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "convenios" ALTER COLUMN "fecha_inicio" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "fecha_fin" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "monto_cuota" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "detalle_factura" ALTER COLUMN "cantidad" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "precio_unitario" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "total" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "facturas" ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "consumo" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "tarifa" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "interes_mora" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "abono" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "saldo" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "lecturas" ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lectura_anterior" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "lectura_actual" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "consumo_calculado" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "valor_monetario" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "abono" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "saldo_pendiente" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "pagos" ALTER COLUMN "fecha" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "monto" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "solicitudes" ALTER COLUMN "fecha_solicitud" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "fecha_resolucion" SET DATA TYPE TIMESTAMP(3);
