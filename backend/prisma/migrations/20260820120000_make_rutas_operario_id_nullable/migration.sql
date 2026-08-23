-- Allow Rutas.operarioId to be nullable so routes can be created without
-- an operator assigned (dispatched later by secretaria via the new
-- "Asignar a ruta de instalación" flow in SC-174).
ALTER TABLE "rutas" ALTER COLUMN "operario_id" DROP NOT NULL;
