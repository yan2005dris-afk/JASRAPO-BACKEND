-- Crear secuencia para auto-increment
CREATE SEQUENCE IF NOT EXISTS comunidades_comunidad_id_seq;

-- Drop FK de clientes primero
ALTER TABLE "clientes" DROP CONSTRAINT IF EXISTS "clientes_comunidad_id_fkey";

-- AlterTable comunidades: BigInt -> Integer
ALTER TABLE "comunidades" DROP CONSTRAINT "comunidades_pkey",
ALTER COLUMN "comunidad_id" TYPE INTEGER,
ALTER COLUMN "comunidad_id" SET DEFAULT nextval('comunidades_comunidad_id_seq'::regclass),
ADD CONSTRAINT "comunidades_pkey" PRIMARY KEY ("comunidad_id");

-- Recrear FK
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_comunidad_id_fkey" FOREIGN KEY ("comunidad_id") REFERENCES "comunidades"("comunidad_id") ON DELETE SET NULL ON UPDATE CASCADE;
