-- ============================================================
-- Restructure Menus Navigation
-- ============================================================
-- 1. Reassign menu_permisos from level-3 CRUD items to level-2 parents
-- 2. Soft-delete all 61 level-3 menus (ids 19-78, 81-84)
-- 3. Soft-delete old level-1 parents (Contratos=1, Facturacion=8, AdminSistema=79)
-- 4. Clean orphaned menu_permisos pointing to deleted menus
-- All operations are idempotent with NOT EXISTS guards.
-- ============================================================

-- Step 1: Reassign menu_permisos from level-3 to level-2 parents
-- For each level-3 menu, find its parent (menu_padre_id) and reassign permissions.
-- NOT EXISTS guard prevents duplicate (menu_id, permiso_id) pairs.
INSERT INTO menu_permisos (menu_id, permiso_id, borrado_en)
SELECT DISTINCT
  m.menu_padre_id,
  mp.permiso_id,
  NULL::timestamp
FROM menu_permisos mp
JOIN menus m ON mp.menu_id = m.menu_id
WHERE m.menu_id IN (
  19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,
  39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,
  59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,
  81,82,83,84
)
  AND m.menu_padre_id IS NOT NULL
  AND m.borrado_en IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM menu_permisos mp2
    WHERE mp2.menu_id = m.menu_padre_id
      AND mp2.permiso_id = mp.permiso_id
      AND mp2.borrado_en IS NULL
  );

-- Step 2: Soft-delete level-3 menus (61 entries: ids 19-78, 81-84)
UPDATE menus
SET borrado_en = NOW()
WHERE menu_id IN (
  19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,
  39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,
  59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,
  81,82,83,84
)
  AND borrado_en IS NULL;

-- Step 3: Soft-delete old level-1 parents
-- Contratos (id=1), Facturacion (id=8), Administracion Sistema (id=79)
UPDATE menus
SET borrado_en = NOW()
WHERE menu_id IN (1, 8, 79)
  AND borrado_en IS NULL;

-- Step 4: Clean orphaned menu_permisos pointing to soft-deleted menus
DELETE FROM menu_permisos
WHERE menu_id IN (
  SELECT menu_id FROM menus WHERE borrado_en IS NOT NULL
)
  AND borrado_en IS NULL;
