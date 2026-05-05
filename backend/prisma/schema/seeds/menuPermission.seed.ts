import { Menus, Permisos, PrismaClient } from 'src/generated/prisma/client';

export async function seedMenuPermissions(
  prisma: PrismaClient,
  menus: Menus[],
  permissions: Permisos[],
) {
  await prisma.menuPermisos.deleteMany();

  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()
      .toLowerCase();

  const menuByName = new Map(menus.map((m) => [normalize(m.nombre), m]));
  const permissionByKey = new Map(
    permissions.map((p) => [`${p.recurso}:${p.accion}`, p]),
  );

  const menuPermissionMap = [
    {
      menuName: 'Listar Cliente',
      permissionKeys: [
        {
          recurso: 'clientes',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Cliente',
      permissionKeys: [
        {
          recurso: 'clientes',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Cliente',
      permissionKeys: [
        {
          recurso: 'clientes',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Cliente',
      permissionKeys: [
        {
          recurso: 'clientes',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Contratos de Servicios',
      permissionKeys: [
        {
          recurso: 'contratos',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Contratos de Servicios',
      permissionKeys: [
        {
          recurso: 'contratos',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Contratos de Servicios',
      permissionKeys: [
        {
          recurso: 'contratos',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Contratos de Servicios',
      permissionKeys: [
        {
          recurso: 'contratos',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Medidores',
      permissionKeys: [
        {
          recurso: 'medidores',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Medidores',
      permissionKeys: [
        {
          recurso: 'medidores',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Medidores',
      permissionKeys: [
        {
          recurso: 'medidores',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Medidores',
      permissionKeys: [
        {
          recurso: 'medidores',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Tarifas y Categorias',
      permissionKeys: [
        {
          recurso: 'tarifas',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Tarifas y Categorias',
      permissionKeys: [
        {
          recurso: 'tarifas',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Tarifas y Categorias',
      permissionKeys: [
        {
          recurso: 'tarifas',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Tarifas y Categorias',
      permissionKeys: [
        {
          recurso: 'tarifas',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Lectura de Consumo',
      permissionKeys: [
        {
          recurso: 'lecturas',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Lectura de Consumo',
      permissionKeys: [
        {
          recurso: 'lecturas',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Lectura de Consumo',
      permissionKeys: [
        {
          recurso: 'lecturas',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Lectura de Consumo',
      permissionKeys: [
        {
          recurso: 'lecturas',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Convenios de pago',
      permissionKeys: [
        {
          recurso: 'convenios',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Convenios de pago',
      permissionKeys: [
        {
          recurso: 'convenios',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Convenios de pago',
      permissionKeys: [
        {
          recurso: 'convenios',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Convenios de pago',
      permissionKeys: [
        {
          recurso: 'convenios',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Generacion de Planillas',
      permissionKeys: [
        {
          recurso: 'planillas',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Generacion de Planillas',
      permissionKeys: [
        {
          recurso: 'planillas',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Generacion de Planillas',
      permissionKeys: [
        {
          recurso: 'planillas',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Generacion de Planillas',
      permissionKeys: [
        {
          recurso: 'planillas',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Facturacion Electronica',
      permissionKeys: [
        {
          recurso: 'facturacion_electronica',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Facturacion Electronica',
      permissionKeys: [
        {
          recurso: 'facturacion_electronica',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Facturacion Electronica',
      permissionKeys: [
        {
          recurso: 'facturacion_electronica',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Facturacion Electronica',
      permissionKeys: [
        {
          recurso: 'facturacion_electronica',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Recaudación y pagos',
      permissionKeys: [
        {
          recurso: 'recaudacion',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Recaudación y pagos',
      permissionKeys: [
        {
          recurso: 'recaudacion',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Recaudación y pagos',
      permissionKeys: [
        {
          recurso: 'recaudacion',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Recaudación y pagos',
      permissionKeys: [
        {
          recurso: 'recaudacion',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Notas de Credito o Debito',
      permissionKeys: [
        {
          recurso: 'notas_credito',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Notas de Credito o Debito',
      permissionKeys: [
        {
          recurso: 'notas_credito',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Notas de Credito o Debito',
      permissionKeys: [
        {
          recurso: 'notas_credito',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Notas de Credito o Debito',
      permissionKeys: [
        {
          recurso: 'notas_credito',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Envio de Facturas',
      permissionKeys: [
        {
          recurso: 'envio_facturas',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Envio de Facturas',
      permissionKeys: [
        {
          recurso: 'envio_facturas',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Envio de Facturas',
      permissionKeys: [
        {
          recurso: 'envio_facturas',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Envio de Facturas',
      permissionKeys: [
        {
          recurso: 'envio_facturas',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Estado de cuenta Cliente',
      permissionKeys: [
        {
          recurso: 'estado_cuenta',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Estado de cuenta Cliente',
      permissionKeys: [
        {
          recurso: 'estado_cuenta',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Estado de cuenta Cliente',
      permissionKeys: [
        {
          recurso: 'estado_cuenta',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Estado de cuenta Cliente',
      permissionKeys: [
        {
          recurso: 'estado_cuenta',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar Recaudación y Morosida',
      permissionKeys: [
        {
          recurso: 'recaudacion_morosidad',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear Recaudación y Morosida',
      permissionKeys: [
        {
          recurso: 'recaudacion_morosidad',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar Recaudación y Morosida',
      permissionKeys: [
        {
          recurso: 'recaudacion_morosidad',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar Recaudación y Morosida',
      permissionKeys: [
        {
          recurso: 'recaudacion_morosidad',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar ConsumoPorZonas',
      permissionKeys: [
        {
          recurso: 'consumo_zonas',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear ConsumoPorZonas',
      permissionKeys: [
        {
          recurso: 'consumo_zonas',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar ConsumoPorZonas',
      permissionKeys: [
        {
          recurso: 'consumo_zonas',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar ConsumoPorZonas',
      permissionKeys: [
        {
          recurso: 'consumo_zonas',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Listar DashboardKpi',
      permissionKeys: [
        {
          recurso: 'dashboard',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Crear DashboardKpi',
      permissionKeys: [
        {
          recurso: 'dashboard',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizar DashboardKpi',
      permissionKeys: [
        {
          recurso: 'dashboard',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminar DashboardKpi',
      permissionKeys: [
        {
          recurso: 'dashboard',
          accion: 'delete',
        },
      ],
    },
    {
      menuName: 'Lectura Usuarios',
      permissionKeys: [
        {
          recurso: 'users',
          accion: 'read',
        },
      ],
    },
    {
      menuName: 'Escritura Usuarios',
      permissionKeys: [
        {
          recurso: 'users',
          accion: 'create',
        },
      ],
    },
    {
      menuName: 'Actualizacion Usuarios',
      permissionKeys: [
        {
          recurso: 'users',
          accion: 'update',
        },
      ],
    },
    {
      menuName: 'Eliminacion Usuarios',
      permissionKeys: [
        {
          recurso: 'users',
          accion: 'delete',
        },
      ],
    },
  ];

  for (const menu of menuPermissionMap) {
    const dbMenu = menuByName.get(normalize(menu.menuName));
    if (!dbMenu) {
      throw new Error(
        `Menu no encontrado para la asignacion de permisos: ${menu.menuName}`,
      );
    }

    for (const permissionKey of menu.permissionKeys) {
      const dbPermission = permissionByKey.get(
        `${permissionKey.recurso}:${permissionKey.accion}`,
      );
      if (!dbPermission) {
        throw new Error(
          `Permiso no encontrado para menu ${menu.menuName}: ${permissionKey.recurso}:${permissionKey.accion}`,
        );
      }

      const exists = await prisma.menuPermisos.findFirst({
        where: {
          menuId: dbMenu.menuId,
          permisoId: dbPermission.permisoId,
        },
      });

      if (!exists) {
        await prisma.menuPermisos.create({
          data: {
            menuId: dbMenu.menuId,
            permisoId: dbPermission.permisoId,
          },
        });
      }
    }
  }

  console.log('✅ Menu-Permisos asignados correctamente.');
}
