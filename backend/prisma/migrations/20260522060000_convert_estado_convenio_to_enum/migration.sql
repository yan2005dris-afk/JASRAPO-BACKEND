-- CreateEnum
CREATE TYPE "EstadoConvenio" AS ENUM ('ACTIVO', 'PENDIENTE_ABONO', 'PREPARADO', 'ANULADO', 'PAGADO');
CREATE TYPE "EstadoCuotaConvenio" AS ENUM ('PENDIENTE', 'PAGADA');

-- DropForeignKey
ALTER TABLE "convenios" DROP CONSTRAINT IF EXISTS "convenios_estado_convenio_id_fkey";
ALTER TABLE "cuota_convenio" DROP CONSTRAINT IF EXISTS "cuota_convenio_estado_cuota_convenio_id_fkey";

-- AlterTable
ALTER TABLE "convenios" DROP COLUMN "estado_convenio_id",
ADD COLUMN "estado" "EstadoConvenio" NOT NULL DEFAULT 'PREPARADO';

ALTER TABLE "cuota_convenio" DROP COLUMN "estado_cuota_convenio_id",
ADD COLUMN "estado" "EstadoCuotaConvenio" NOT NULL DEFAULT 'PENDIENTE';

-- DropTable
DROP TABLE IF EXISTS "estado_convenio";
DROP TABLE IF EXISTS "estado_cuota_convenio";
