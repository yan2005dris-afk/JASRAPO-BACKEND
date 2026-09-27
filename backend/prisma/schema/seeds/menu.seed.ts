import type { PrismaClient } from 'src/generated/prisma/client';

interface MenuSeedEntry {
  nombre: string;
  ruta: string;
  icono: string;
  parentNombre: string | null;
}

const LEVEL_1: Omit<MenuSeedEntry, 'parentNombre'>[] = [
  { nombre: 'Contratos', ruta: '/Contratos', icono: 'water_drop' },
  { nombre: 'Operaciones', ruta: '/operador', icono: 'construction' },
  { nombre: 'Facturación', ruta: '/Facturacion', icono: 'payments' },
  { nombre: 'Reportes', ruta: '/reportes', icono: 'menu_book' },
  { nombre: 'Administración', ruta: '/admin', icono: 'settings' },
];

const LEVEL_2: MenuSeedEntry[] = [
  // ── Contratos ──────────────────────────────────────────────
  {
    nombre: 'Clientes',
    ruta: '/Contratos/Cliente',
    icono: 'group',
    parentNombre: 'Contratos',
  },
  {
    nombre: 'Contratos',
    ruta: '/Contratos/Contratos',
    icono: 'contract',
    parentNombre: 'Contratos',
  },
  {
    nombre: 'Convenios de Pago',
    ruta: '/Contratos/ConveniosDePago',
    icono: 'handshake',
    parentNombre: 'Contratos',
  },
  {
    nombre: 'Rutas de Lectura',
    ruta: '/Contratos/RutasDeLectura',
    icono: 'route',
    parentNombre: 'Contratos',
  },
  {
    nombre: 'Lectura de Consumo',
    ruta: '/Contratos/LecturaDeConsumo',
    icono: 'water_drop',
    parentNombre: 'Contratos',
  },
  {
    nombre: 'Anomalías de Lectura',
    ruta: '/Contratos/AnomaliasDeLectura',
    icono: 'warning',
    parentNombre: 'Contratos',
  },
  {
    nombre: 'Inventario de Medidores',
    ruta: '/Contratos/Medidores',
    icono: 'gas_meter',
    parentNombre: 'Contratos',
  },
  {
    nombre: 'Categoría Tarifa',
    ruta: '/Contratos/TarifasYCategorias',
    icono: 'price_change',
    parentNombre: 'Contratos',
  },

  // ── Operaciones ────────────────────────────────────────────
  {
    nombre: 'Toma de Lecturas',
    ruta: '/operador/lecturas',
    icono: 'water_drop',
    parentNombre: 'Operaciones',
  },
  {
    nombre: 'Reporte Novedades',
    ruta: '/operador/novedades',
    icono: 'warning',
    parentNombre: 'Operaciones',
  },

  // ── Facturación ────────────────────────────────────────────
  {
    nombre: 'Recaudación y Pagos',
    ruta: '/Facturacion/RecaudacionYPagos',
    icono: 'point_of_sale',
    parentNombre: 'Facturación',
  },
  {
    nombre: 'Cuadro y Cierre de Caja',
    ruta: '/Facturacion/CuadroDeCaja',
    icono: 'account_balance_wallet',
    parentNombre: 'Facturación',
  },
  {
    nombre: 'Prefacturas',
    ruta: '/Facturacion/GeneracionPlanilla',
    icono: 'receipt_cutoff',
    parentNombre: 'Facturación',
  },
  {
    nombre: 'Generación de Planillas',
    ruta: '/Facturacion/EnvioDeFacturacion',
    icono: 'collection',
    parentNombre: 'Facturación',
  },
  {
    nombre: 'Facturación Electrónica',
    ruta: '/Facturacion/FacturacionElectronica',
    icono: 'gavel',
    parentNombre: 'Facturación',
  },
  {
    nombre: 'Notas de Crédito/Débito',
    ruta: '/Facturacion/NotasDeCreditoDebito',
    icono: 'swap_horizontal',
    parentNombre: 'Facturación',
  },
  {
    nombre: 'Descuentos',
    ruta: '/Facturacion/Descuentos',
    icono: 'percent',
    parentNombre: 'Facturación',
  },
  {
    nombre: 'Rubros',
    ruta: '/Facturacion/Rubros',
    icono: 'category',
    parentNombre: 'Facturación',
  },

  // ── Administración ─────────────────────────────────────────
  {
    nombre: 'Usuarios',
    ruta: '/admin/users',
    icono: 'admin_panel_settings',
    parentNombre: 'Administración',
  },
  {
    nombre: 'Roles y Permisos',
    ruta: '/admin/roles',
    icono: 'admin_panel_settings',
    parentNombre: 'Administración',
  },
  {
    nombre: 'Comunidades',
    ruta: '/admin/comunidades',
    icono: 'communities',
    parentNombre: 'Administración',
  },
  {
    nombre: 'Sectores',
    ruta: '/admin/sectores',
    icono: 'map',
    parentNombre: 'Administración',
  },
  {
    nombre: 'Empresa y Sucursales',
    ruta: '/admin/empresa',
    icono: 'business',
    parentNombre: 'Administración',
  },
  {
    nombre: 'Períodos',
    ruta: '/admin/periods',
    icono: 'calendar_month',
    parentNombre: 'Administración',
  },
  {
    nombre: 'Configuraciones',
    ruta: '/admin/config',
    icono: 'settings',
    parentNombre: 'Administración',
  },

  // ── Reportes ───────────────────────────────────────────────
  {
    nombre: 'Estado de Cuenta',
    ruta: '/reportes/estado-cuenta',
    icono: 'article_person',
    parentNombre: 'Reportes',
  },
  {
    nombre: 'Recaudación y Morosidad',
    ruta: '/reportes/recaudacion-morosidad',
    icono: 'money_off',
    parentNombre: 'Reportes',
  },
  {
    nombre: 'Consumo por Zonas',
    ruta: '/reportes/consumo-zonas',
    icono: 'location_on',
    parentNombre: 'Reportes',
  },
  {
    nombre: 'Dashboard KPI',
    ruta: '/reportes/dashboard',
    icono: 'dashboard',
    parentNombre: 'Reportes',
  },
  {
    nombre: 'Reporte de Abonos',
    ruta: '/reportes/abonos',
    icono: 'receipt_long',
    parentNombre: 'Reportes',
  },
  {
    nombre: 'Historial de Conexión',
    ruta: '/reportes/historial-conexion',
    icono: 'history',
    parentNombre: 'Reportes',
  },
  {
    nombre: 'Listado de Clientes',
    ruta: '/reportes/listado-clientes',
    icono: 'group',
    parentNombre: 'Reportes',
  },
];

async function upsertMenu(
  prisma: PrismaClient,
  nombre: string,
  ruta: string,
  icono: string | null,
  menuPadreId: number | null,
): Promise<number> {
  // Buscar por ruta (identificador único del módulo):
  // permite renombrar el título del menú sin duplicarlo en la base de datos.
  const existing = await prisma.menus.findFirst({
    where: { ruta, deletedAt: null },
    select: { menuId: true },
  });

  if (existing) {
    await prisma.menus.update({
      where: { menuId: existing.menuId },
      data: { nombre, icono, menuPadreId, activo: true },
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
    const id = await upsertMenu(
      prisma,
      entry.nombre,
      entry.ruta,
      entry.icono,
      null,
    );
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
