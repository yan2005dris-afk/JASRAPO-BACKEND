/*
  Warnings:

  - The values [Diners,Mastercard,Visa,AMEX] on the enum `Banco` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `actualizado_en` on the `caja_arqueo_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `actualizado_por` on the `caja_arqueo_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `borrado_en` on the `caja_arqueo_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `creado_por` on the `caja_arqueo_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `actualizado_por` on the `caja_sesion` table. All the data in the column will be lost.
  - You are about to drop the column `borrado_en` on the `caja_sesion` table. All the data in the column will be lost.
  - You are about to drop the column `actualizado_en` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `actualizado_por` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `borrado_en` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `creado_por` on the `descuento_detalle` table. All the data in the column will be lost.
  - You are about to drop the column `estado_asignacion` on the `lecturas` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Banco_new" AS ENUM ('PICHINCHA', 'GUAYAQUIL', 'PRODUBANC', 'PACIFICIO', 'BOLIVARIANO', 'LOJA', 'AUSTRO', 'RUMIÑAHUI', 'CNT', 'OTRO');
ALTER TABLE "pagos" ALTER COLUMN "banco" TYPE "Banco_new" USING ("banco"::text::"Banco_new");
ALTER TYPE "Banco" RENAME TO "Banco_old";
ALTER TYPE "Banco_new" RENAME TO "Banco";
DROP TYPE "public"."Banco_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "reemplazos_medidor" DROP CONSTRAINT "reemplazos_medidor_autorizador_fkey";

-- DropIndex
DROP INDEX "lecturas_estado_asignacion_idx";

-- DropIndex
DROP INDEX "reemplazos_medidor_mes_destino_idx";

-- DropIndex
DROP INDEX "reemplazos_medidor_mes_origen_idx";

-- AlterTable
ALTER TABLE "caja_arqueo_detalle" DROP COLUMN "actualizado_en",
DROP COLUMN "actualizado_por",
DROP COLUMN "borrado_en",
DROP COLUMN "creado_por";

-- AlterTable
ALTER TABLE "caja_sesion" DROP COLUMN "actualizado_por",
DROP COLUMN "borrado_en";

-- AlterTable
ALTER TABLE "categoria_tarifa" ALTER COLUMN "consumo_minimo_mensual" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "descuento_detalle" DROP COLUMN "actualizado_en",
DROP COLUMN "actualizado_por",
DROP COLUMN "borrado_en",
DROP COLUMN "creado_por";

-- AlterTable
ALTER TABLE "lecturas" DROP COLUMN "estado_asignacion";

-- AlterTable
ALTER TABLE "lote" ALTER COLUMN "mes" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "ordenes_trabajo" ALTER COLUMN "actualizado_en" DROP DEFAULT;

-- AlterTable
ALTER TABLE "usuarios" ALTER COLUMN "contrasenia" DROP NOT NULL;

-- CreateTable
CREATE TABLE "usuarios_invitaciones" (
    "usuario_invitacion_id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "token_hash" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "aceptado_en" TIMESTAMP(3),
    "version_terminos" TEXT NOT NULL DEFAULT 'v0',
    "invitado_por_usuario_id" INTEGER,
    "email_enviado_en" TIMESTAMP(3),
    "email_fallido_en" TIMESTAMP(3),
    "email_intentos" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "usuarios_invitaciones_pkey" PRIMARY KEY ("usuario_invitacion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_invitaciones_token_hash_key" ON "usuarios_invitaciones"("token_hash");

-- CreateIndex
CREATE INDEX "usuarios_invitaciones_usuario_id_aceptado_en_idx" ON "usuarios_invitaciones"("usuario_id", "aceptado_en");

-- CreateIndex
CREATE INDEX "usuarios_invitaciones_email_enviado_en_email_fallido_en_idx" ON "usuarios_invitaciones"("email_enviado_en", "email_fallido_en");

-- CreateIndex
CREATE INDEX "reemplazos_medidor_prefactura_detalle_entrante_id_idx" ON "reemplazos_medidor"("prefactura_detalle_entrante_id");

-- RenameForeignKey
ALTER TABLE "reemplazos_medidor" RENAME CONSTRAINT "reemplazos_medidor_solicitante_fkey" TO "reemplazos_medidor_solicitado_por_usuario_id_fkey";

-- AddForeignKey
ALTER TABLE "usuarios_invitaciones" ADD CONSTRAINT "usuarios_invitaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_invitaciones" ADD CONSTRAINT "usuarios_invitaciones_invitado_por_usuario_id_fkey" FOREIGN KEY ("invitado_por_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reemplazos_medidor" ADD CONSTRAINT "reemplazos_medidor_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "uk_prefacturas_contrato_periodo_mes" RENAME TO "prefacturas_contrato_id_periodo_id_mes_key";

-- RenameIndex
ALTER INDEX "reemplazos_medidor_aprobacion_ciclo_idx" RENAME TO "reemplazos_medidor_estado_aprobacion_periodo_origen_id_mes__idx";

-- RenameIndex
ALTER INDEX "reemplazos_medidor_autorizador_idx" RENAME TO "reemplazos_medidor_autorizado_por_usuario_id_idx";

-- RenameIndex
ALTER INDEX "reemplazos_medidor_solicitante_idempotencia_key" RENAME TO "reemplazos_medidor_solicitado_por_usuario_id_clave_idempote_key";
