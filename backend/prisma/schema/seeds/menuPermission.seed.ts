import type {
  Menus,
  Permisos,
  PrismaClient,
} from 'src/generated/prisma/client';

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
    menuNombre: 'Contratos',
    permisos: [
      { recurso: 'contracts', accion: 'read' },
      { recurso: 'contracts', accion: 'create' },
      { recurso: 'contracts', accion: 'update' },
      { recurso: 'contracts', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Convenios de Pago',
    permisos: [
      { recurso: 'agreements', accion: 'read' },
      { recurso: 'agreements', accion: 'create' },
      { recurso: 'agreements', accion: 'update' },
      { recurso: 'agreements', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Rutas de Lectura',
    permisos: [
      { recurso: 'routes', accion: 'read' },
      { recurso: 'routes', accion: 'create' },
      { recurso: 'routes', accion: 'update' },
      { recurso: 'routes', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Lectura de Consumo',
    permisos: [
      { recurso: 'lecturas', accion: 'read' },
      { recurso: 'lecturas', accion: 'create' },
      { recurso: 'lecturas', accion: 'update' },
      { recurso: 'lecturas', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Categoría Tarifa',
    permisos: [
      { recurso: 'tarifas', accion: 'read' },
      { recurso: 'tarifas', accion: 'create' },
      { recurso: 'tarifas', accion: 'update' },
      { recurso: 'tarifas', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Inventario de Medidores',
    permisos: [
      { recurso: 'meters', accion: 'read' },
      { recurso: 'meters', accion: 'create' },
      { recurso: 'meters', accion: 'update' },
      { recurso: 'meters', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Toma de Lecturas',
    permisos: [
      { recurso: 'lecturas', accion: 'read' },
      { recurso: 'lecturas', accion: 'create' },
      { recurso: 'lecturas', accion: 'update' },
      { recurso: 'lecturas', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Recaudación y Pagos',
    permisos: [
      { recurso: 'payments', accion: 'read' },
      { recurso: 'payments', accion: 'create' },
      { recurso: 'payments', accion: 'update' },
      { recurso: 'payments', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Prefacturas',
    permisos: [
      { recurso: 'pre-invoices', accion: 'read' },
      { recurso: 'pre-invoices', accion: 'create' },
      { recurso: 'pre-invoices', accion: 'update' },
      { recurso: 'pre-invoices', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Generación de Planillas',
    permisos: [
      { recurso: 'batches', accion: 'read' },
      { recurso: 'batches', accion: 'create' },
      { recurso: 'batches', accion: 'update' },
      { recurso: 'batches', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Facturación Electrónica',
    permisos: [
      { recurso: 'facturacion_electronica', accion: 'read' },
      { recurso: 'facturacion_electronica', accion: 'create' },
      { recurso: 'facturacion_electronica', accion: 'update' },
      { recurso: 'facturacion_electronica', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Notas de Crédito/Débito',
    permisos: [
      { recurso: 'notas_credito', accion: 'read' },
      { recurso: 'notas_credito', accion: 'create' },
      { recurso: 'notas_credito', accion: 'update' },
      { recurso: 'notas_credito', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Descuentos',
    permisos: [
      { recurso: 'discounts', accion: 'read' },
      { recurso: 'discounts', accion: 'create' },
      { recurso: 'discounts', accion: 'update' },
      { recurso: 'discounts', accion: 'delete' },
      { recurso: 'discounts', accion: 'apply' },
    ],
  },
  {
    menuNombre: 'Rubros',
    permisos: [
      { recurso: 'rubros', accion: 'read' },
      { recurso: 'rubros', accion: 'create' },
      { recurso: 'rubros', accion: 'update' },
      { recurso: 'rubros', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Usuarios',
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
    menuNombre: 'Roles y Permisos',
    permisos: [
      { recurso: 'roles', accion: 'read' },
      { recurso: 'roles', accion: 'create' },
      { recurso: 'roles', accion: 'update' },
      { recurso: 'roles', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Comunidades',
    permisos: [
      { recurso: 'comunidades', accion: 'read' },
      { recurso: 'comunidades', accion: 'create' },
      { recurso: 'comunidades', accion: 'update' },
      { recurso: 'comunidades', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Sectores',
    permisos: [
      { recurso: 'sectores', accion: 'read' },
      { recurso: 'sectores', accion: 'create' },
      { recurso: 'sectores', accion: 'update' },
      { recurso: 'sectores', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Empresa y Sucursales',
    permisos: [
      { recurso: 'empresa', accion: 'read' },
      { recurso: 'empresa', accion: 'create' },
      { recurso: 'empresa', accion: 'update' },
      { recurso: 'empresa', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Configuraciones',
    permisos: [
      { recurso: 'configuraciones', accion: 'read' },
      { recurso: 'configuraciones', accion: 'create' },
      { recurso: 'configuraciones', accion: 'update' },
      { recurso: 'configuraciones', accion: 'delete' },
    ],
  },
  {
    menuNombre: 'Estado de Cuenta',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
  {
    menuNombre: 'Recaudación y Morosidad',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
  {
    menuNombre: 'Consumo por Zonas',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
  {
    menuNombre: 'Dashboard KPI',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
  {
    menuNombre: 'Reporte de Abonos',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
  {
    menuNombre: 'Historial de Conexión',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
  {
    menuNombre: 'Convenio de Pago',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
  {
    menuNombre: 'Listado de Clientes',
    permisos: [{ recurso: 'reportes', accion: 'read' }],
  },
];

export async function seedMenuPermissions(
  prisma: PrismaClient,
  menus: Menus[],
  permissions: Permisos[],
) {
  const menuByName = new Map<string, Menus>();
  for (const m of menus) {
    const existing = menuByName.get(m.nombre);
    // Ante nombres duplicados (ej. padre "Contratos" e hijo "Contratos"),
    // priorizar el hijo (con menuPadreId) que es quien recibe permisos;
    // los padres se agregan por recursión en GetMyMenusUseCase.
    if (
      !existing ||
      (existing.menuPadreId === null && m.menuPadreId !== null)
    ) {
      menuByName.set(m.nombre, m);
    }
  }
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
