/*
  Warnings:

  - Added the required column `descripcion` to the `permisos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `permisos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable: add columns as nullable first
ALTER TABLE "permisos" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "nombre" TEXT;

-- Populate existing rows with derived values
UPDATE "permisos"
SET
  "nombre" = UPPER(LEFT("accion", 1)) || LOWER(SUBSTRING("accion", 2)) || ' ' || INITCAP(REPLACE("recurso", '_', ' ')),
  "descripcion" = 'Permite ' || LOWER(UPPER(LEFT("accion", 1)) || LOWER(SUBSTRING("accion", 2))) || ' registros de ' || LOWER(INITCAP(REPLACE("recurso", '_', ' ')));

-- Now make them NOT NULL
ALTER TABLE "permisos"
ALTER COLUMN "descripcion" SET NOT NULL,
ALTER COLUMN "nombre" SET NOT NULL;
