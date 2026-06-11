import type { PrismaClient } from 'src/generated/prisma/client';

interface MenuSeedEntry {
  nombre: string;
  ruta: string;
  icono: string;
  parentNombre: string | null;
}

const LEVEL_1: Omit<MenuSeedEntry, 'parentNombre'>[] = [
  { nombre: 'Suministro', ruta: '/suministro', icono: 'water_drop' },
  { nombre: 'Recaudación', ruta: '/recaudacion', icono: 'payments' },
  { nombre: 'Reportes', ruta: '/reportes', icono: 'menu_book' },
  { nombre: 'Administración', ruta: '/admin', icono: 'settings' },
];

const LEVEL_2: MenuSeedEntry[] = [
  { nombre: 'Clientes', ruta: '/Contratos/Cliente', icono: 'group', parentNombre: 'Suministro' },
  { nombre: 'Inventario de Medidores', ruta: '/Contratos/Medidores', icono: 'gas_meter', parentNombre: 'Suministro' },
  { nombre: 'Planificación de Rutas', ruta: '/Contratos/LecturaDeConsumo', icono: 'route', parentNombre: 'Suministro' },
  { nombre: 'Bandeja de Auditoría', ruta: '/suministro/auditoria', icono: 'assignment', parentNombre: 'Suministro' },

  { nombre: 'Punto de Recaudación', ruta: '/recaudacion/punto', icono: 'point_of_sale', parentNombre: 'Recaudación' },
  { nombre: 'Caja Diaria', ruta: '/recaudacion/caja-diaria', icono: 'payments', parentNombre: 'Recaudación' },
  { nombre: 'Validación Transferencia', ruta: '/recaudacion/validacion', icono: 'verified', parentNombre: 'Recaudación' },
  { nombre: 'Emisión SRI', ruta: '/recaudacion/emision-sri', icono: 'gavel', parentNombre: 'Recaudación' },

  { nombre: 'Gestión General', ruta: '/admin/users', icono: 'admin_panel_settings', parentNombre: 'Administración' },
  { nombre: 'Usuarios', ruta: '/admin/usuarios', icono: 'group', parentNombre: 'Administración' },
  { nombre: 'Roles y Permisos', ruta: '/admin/roles', icono: 'admin_panel_settings', parentNombre: 'Administración' },
  { nombre: 'Comunidades', ruta: '/admin/comunidades', icono: 'communities', parentNombre: 'Administración' },
  { nombre: 'Sectores', ruta: '/admin/sectores', icono: 'map', parentNombre: 'Administración' },

  { nombre: 'Estado de cuenta Cliente', ruta: '/reportes/estado-cuenta', icono: 'article_person', parentNombre: 'Reportes' },
  { nombre: 'Recaudación y Morosidad', ruta: '/reportes/recaudacion-morosidad', icono: 'money_off', parentNombre: 'Reportes' },
  { nombre: 'ConsumoPorZonas', ruta: '/reportes/consumo-zonas', icono: 'location_on', parentNombre: 'Reportes' },
  { nombre: 'DashboardKPI', ruta: '/reportes/dashboard', icono: 'dashboard', parentNombre: 'Reportes' },
];

async function upsertMenu(
  prisma: PrismaClient,
  nombre: string,
  ruta: string,
  icono: string | null,
  menuPadreId: number | null,
): Promise<number> {
  const existing = await prisma.menus.findFirst({
    where: { nombre, deletedAt: null },
    select: { menuId: true },
  });

  if (existing) {
    await prisma.menus.update({
      where: { menuId: existing.menuId },
      data: { ruta, icono, menuPadreId, activo: true },
    });
    return existing.menuId;
  }

  const created = await prisma.menus.create({
    data: { nombre, ruta, icono, menuPadreId, activo: true },
    select: { menuId: true },
  });
  return created.menuId;
}

export async function seedMenus(prisma: PrismaClient) {
  const parentIds = new Map<string, number>();

  for (const entry of LEVEL_1) {
    const id = await upsertMenu(prisma, entry.nombre, entry.ruta, entry.icono, null);
    parentIds.set(entry.nombre, id);
  }

  for (const entry of LEVEL_2) {
    const parentId = parentIds.get(entry.parentNombre!);
    if (!parentId) {
      throw new Error(`Parent menu "${entry.parentNombre}" not found`);
    }
    await upsertMenu(prisma, entry.nombre, entry.ruta, entry.icono, parentId);
  }

  return prisma.menus.findMany({
    where: { deletedAt: null },
    orderBy: { menuId: 'asc' },
  });
}
