-- SC-241: relacionar CategoriaTarifa con Rubros (1-N).
-- Cada CategoriaTarifa puede tener multiples Rubros asociados.
-- Nullable para preservar los Rubros existentes que no tienen categoria.

ALTER TABLE "rubros" ADD COLUMN "categoria_tarifa_id" INTEGER;
ALTER TABLE "rubros" ADD CONSTRAINT "rubros_categoria_tarifa_id_fkey"
  FOREIGN KEY ("categoria_tarifa_id") REFERENCES "categoria_tarifa"("categoria_tarifa_id")
  ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "rubros_categoria_tarifa_id_idx" ON "rubros"("categoria_tarifa_id");
