import type { MenuRow } from '../infrastructure/repositories/menu.include';

/**
 * Factory para construir filas `MenuRow` tipadas en specs.
 *
 * Reemplaza al `new MenuEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC menus. Cada override se pisa sobre defaults sensatos.
 *
 * @example
 *   const row = menuRow({ menuId: 7, ruta: '/admin/users' });
 *   prisma.menus.findMany.mockResolvedValue([row]);
 */
export function menuRow(overrides: Partial<MenuRow> = {}): MenuRow {
  const base: MenuRow = {
    menuId: 1,
    menuPadreId: null,
    nombre: 'Dashboard',
    ruta: '/dashboard',
    icono: 'dashboard',
    activo: true,
    deletedAt: null,
  };

  return { ...base, ...overrides };
}
