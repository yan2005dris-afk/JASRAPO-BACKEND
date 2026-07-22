-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "intentos_fallidos" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "usuarios" ADD COLUMN "ultimo_intento_fallido_en" TIMESTAMP(3);
ALTER TABLE "usuarios" ADD COLUMN "bloqueado_hasta" TIMESTAMP(3);