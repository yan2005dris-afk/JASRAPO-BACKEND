import { Menus, Permisos, PrismaClient } from 'src/generated/prisma/client';

interface MenuPermissionMapping {
  menuNombre: string;
  permisos: { recurso: string; accion: string }[];
}

const PERMISSION_MAP: MenuPermissionMapping[] = [
  {
    menuNombre: 'Clientes',
    permisos: [
      { recurso: 'clientes', accion: 'read' },
      { recurso: 'clientes', accion: 'create' },
      { recurso: 'clientes', accion: 'update' },
      { recurso: 'clientes', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Inventario de Medidores',
    permisos: [
      { recurso: 'medidores', accion: 'read' },
      { recurso: 'medidores', accion: 'create' },
      { recurso: 'medidores', accion: 'update' },
      { recurso: 'medidores', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Planificación de Rutas',
    permisos: [
      { recurso: 'routes', accion: 'read' },
      { recurso: 'routes', accion: 'create' },
      { recurso: 'routes', accion: 'update' },
      { recurso: 'routes', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Bandeja de Auditoría',
    permisos: [
      { recurso: 'lecturas', accion: 'read' },
      { recurso: 'lecturas', accion: 'create' },
      { recurso: 'lecturas', accion: 'update' },
      { recurso: 'lecturas', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Punto de Recaudación',
    permisos: [
      { recurso: 'recaudacion', accion: 'read' },
      { recurso: 'recaudacion', accion: 'create' },
      { recurso: 'recaudacion', accion: 'update' },
      { recurso: 'recaudacion', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Caja Diaria',
    permisos: [
      { recurso: 'recaudacion', accion: 'read' },
      { recurso: 'recaudacion', accion: 'create' },
      { recurso: 'recaudacion', accion: 'update' },
      { recurso: 'recaudacion', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Validación Transferencia',
    permisos: [
      { recurso: 'recaudacion', accion: 'read' },
      { recurso: 'recaudacion', accion: 'create' },
      { recurso: 'recaudacion', accion: 'update' },
      { recurso: 'recaudacion', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Emisión SRI',
    permisos: [
      { recurso: 'facturacion_electronica', accion: 'read' },
      { recurso: 'facturacion_electronica', accion: 'create' },
      { recurso: 'facturacion_electronica', accion: 'update' },
      { recurso: 'facturacion_electronica', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Gestión General',
    permisos: [
      { recurso: 'users', accion: 'read' },
      { recurso: 'users', accion: 'create' },
      { recurso: 'users', accion: 'update' },
      { recurso: 'users', accion: 'delete' },
      { recurso: 'roles', accion: 'read' },
      { recurso: 'roles', accion: 'create' },
      { recurso: 'roles', accion: 'update' },
      { recurso: 'roles', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Estado de cuenta Cliente',
    permisos: [
      { recurso: 'estado_cuenta', accion: 'read' },
      { recurso: 'estado_cuenta', accion: 'create' },
      { recurso: 'estado_cuenta', accion: 'update' },
      { recurso: 'estado_cuenta', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Recaudación y Morosidad',
    permisos: [
      { recurso: 'recaudacion_morosidad', accion: 'read' },
      { recurso: 'recaudacion_morosidad', accion: 'create' },
      { recurso: 'recaudacion_morosidad', accion: 'update' },
      { recurso: 'recaudacion_morosidad', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'ConsumoPorZonas',
    permisos: [
      { recurso: 'consumo_zonas', accion: 'read' },
      { recurso: 'consumo_zonas', accion: 'create' },
      { recurso: 'consumo_zonas', accion: 'update' },
      { recurso: 'consumo_zonas', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'DashboardKPI',
    permisos: [
      { recurso: 'dashboard', accion: 'read' },
      { recurso: 'dashboard', accion: 'create' },
      { recurso: 'dashboard', accion: 'update' },
      { recurso: 'dashboard', accion: 'delete' },
    ],
  },
];

export async function seedMenuPermissions(
  prisma: PrismaClient,
  menus: Menus[],
  permissions: Permisos[],
) {
  const menuByName = new Map(menus.map((m) => [m.nombre, m]));
  const permissionByKey = new Map(
    permissions.map((p) => [`${p.recurso}:${p.accion}`, p]),
  );

  for (const mapping of PERMISSION_MAP) {
    const dbMenu = menuByName.get(mapping.menuNombre);
    if (!dbMenu) {
      throw new Error(
        `Menu no encontrado para asignación de permisos: ${mapping.menuNombre}`,
      );
    }

    for (const { recurso, accion } of mapping.permisos) {
      const dbPermission = permissionByKey.get(`${recurso}:${accion}`);
      if (!dbPermission) {
        throw new Error(
          `Permiso no encontrado para menú "${mapping.menuNombre}": ${recurso}:${accion}`,
        );
      }

      await prisma.menuPermisos.upsert({
        where: {
          menuId_permisoId: {
            menuId: dbMenu.menuId,
            permisoId: dbPermission.permisoId,
          },
        },
        create: {
          menuId: dbMenu.menuId,
          permisoId: dbPermission.permisoId,
        },
        update: {},
      });
    }
  }

  console.log('✅ Menu-Permisos asignados correctamente.');
}
