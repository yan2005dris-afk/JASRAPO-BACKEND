-- Migration: align_work_orders_permission
--
-- Purpose: introduce the canonical `work_orders` permission resource and re-assign
-- it to the roles that actually mutate work orders. This unblocks moving the
-- `PATCH /work-orders/:id` decorator from `('routes', 'update')` to
-- `('work_orders', 'update')` without losing access for the mobile operator
-- channel or the administrative UI.
--
-- The migration is idempotent so it can run safely on databases where the
-- seed has not been re-executed (production included). The companion
-- changes in `permission.seed.ts` and `rolePermission.seed.ts` keep the
-- dev seed aligned with this production baseline.
--
-- The `permisos` table only carries an INDEX on (recurso, accion), not a
-- UNIQUE constraint, so `ON CONFLICT` cannot be used. We use a
-- `WHERE NOT EXISTS` guard instead, which keeps the migration portable
-- across environments and avoids a schema change to add the constraint.

-- 1. Insert the four canonical CRUD actions for the `work_orders` resource.
INSERT INTO "permisos" ("nombre", "descripcion", "recurso", "accion")
SELECT * FROM (VALUES
  ('Consultar Work Orders', 'Permite consultar registros de work orders', 'work_orders', 'read'),
  ('Crear Work Orders', 'Permite crear registros de work orders', 'work_orders', 'create'),
  ('Actualizar Work Orders', 'Permite actualizar registros de work orders', 'work_orders', 'update'),
  ('Eliminar Work Orders', 'Permite eliminar registros de work orders', 'work_orders', 'delete')
) AS new_perm(nombre, descripcion, recurso, accion)
WHERE NOT EXISTS (
  SELECT 1
  FROM "permisos" p
  WHERE p."recurso" = new_perm.recurso
    AND p."accion" = new_perm.accion
);

-- 2. Grant `work_orders:update` to the roles that actually need to mutate
--    work orders from the web admin and the mobile operator channels.
--    `admin(1)` already receives every permission through the dev seed loop;
--    this branch covers `secretaria(2)` and `operadores(5)`.
--    `rol_permisos` carries `@@unique([rolId, permisoId])`, so ON CONFLICT
--    is safe here.
INSERT INTO "rol_permisos" ("rol_id", "permiso_id")
SELECT r."rol_id", p."permiso_id"
FROM "roles" r
CROSS JOIN "permisos" p
WHERE p."recurso" = 'work_orders'
  AND p."accion" = 'update'
  AND r."rol_id" IN (2, 5)
ON CONFLICT ("rol_id", "permiso_id") DO NOTHING;

-- 3. Revoke the legacy `routes:update` grant from the operator role.
--    Operators have been using this permission to mutate work orders via
--    a mis-mapped decorator. With `work_orders:update` in place, the
--    operator no longer needs the broader routes update privilege
--    (`PATCH /routes/:id`, `/reassign`, `DELETE /routes/:id` are all
--    administrative actions and were never meant for operators).
DELETE FROM "rol_permisos" rp
USING "roles" r, "permisos" p
WHERE rp."rol_id" = r."rol_id"
  AND rp."permiso_id" = p."permiso_id"
  AND r."rol_id" = 5
  AND p."recurso" = 'routes'
  AND p."accion" = 'update';