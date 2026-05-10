import type { Permisos, PrismaClient } from 'src/generated/prisma/client';

export async function seedPermissions(prisma: PrismaClient) {
  const permissionsToCreate = [
    {
      resource: 'clientes',
      action: 'read',
    },
    {
      resource: 'clientes',
      action: 'create',
    },
    {
      resource: 'clientes',
      action: 'update',
    },
    {
      resource: 'clientes',
      action: 'delete',
    },
    {
      resource: 'contratos',
      action: 'read',
    },
    {
      resource: 'contratos',
      action: 'create',
    },
    {
      resource: 'contratos',
      action: 'update',
    },
    {
      resource: 'contratos',
      action: 'delete',
    },
    {
      resource: 'medidores',
      action: 'read',
    },
    {
      resource: 'medidores',
      action: 'create',
    },
    {
      resource: 'medidores',
      action: 'update',
    },
    {
      resource: 'medidores',
      action: 'delete',
    },
    {
      resource: 'tarifas',
      action: 'read',
    },
    {
      resource: 'tarifas',
      action: 'create',
    },
    {
      resource: 'tarifas',
      action: 'update',
    },
    {
      resource: 'tarifas',
      action: 'delete',
    },
    {
      resource: 'lecturas',
      action: 'read',
    },
    {
      resource: 'lecturas',
      action: 'create',
    },
    {
      resource: 'lecturas',
      action: 'update',
    },
    {
      resource: 'lecturas',
      action: 'delete',
    },
    {
      resource: 'convenios',
      action: 'read',
    },
    {
      resource: 'convenios',
      action: 'create',
    },
    {
      resource: 'convenios',
      action: 'update',
    },
    {
      resource: 'convenios',
      action: 'delete',
    },
    {
      resource: 'planillas',
      action: 'read',
    },
    {
      resource: 'planillas',
      action: 'create',
    },
    {
      resource: 'planillas',
      action: 'update',
    },
    {
      resource: 'planillas',
      action: 'delete',
    },
    {
      resource: 'facturacion_electronica',
      action: 'read',
    },
    {
      resource: 'facturacion_electronica',
      action: 'create',
    },
    {
      resource: 'facturacion_electronica',
      action: 'update',
    },
    {
      resource: 'facturacion_electronica',
      action: 'delete',
    },
    {
      resource: 'recaudacion',
      action: 'read',
    },
    {
      resource: 'recaudacion',
      action: 'create',
    },
    {
      resource: 'recaudacion',
      action: 'update',
    },
    {
      resource: 'recaudacion',
      action: 'delete',
    },
    {
      resource: 'notas_credito',
      action: 'read',
    },
    {
      resource: 'notas_credito',
      action: 'create',
    },
    {
      resource: 'notas_credito',
      action: 'update',
    },
    {
      resource: 'notas_credito',
      action: 'delete',
    },
    {
      resource: 'envio_facturas',
      action: 'read',
    },
    {
      resource: 'envio_facturas',
      action: 'create',
    },
    {
      resource: 'envio_facturas',
      action: 'update',
    },
    {
      resource: 'envio_facturas',
      action: 'delete',
    },
    {
      resource: 'estado_cuenta',
      action: 'read',
    },
    {
      resource: 'estado_cuenta',
      action: 'create',
    },
    {
      resource: 'estado_cuenta',
      action: 'update',
    },
    {
      resource: 'estado_cuenta',
      action: 'delete',
    },
    {
      resource: 'recaudacion_morosidad',
      action: 'read',
    },
    {
      resource: 'recaudacion_morosidad',
      action: 'create',
    },
    {
      resource: 'recaudacion_morosidad',
      action: 'update',
    },
    {
      resource: 'recaudacion_morosidad',
      action: 'delete',
    },
    {
      resource: 'consumo_zonas',
      action: 'read',
    },
    {
      resource: 'consumo_zonas',
      action: 'create',
    },
    {
      resource: 'consumo_zonas',
      action: 'update',
    },
    {
      resource: 'consumo_zonas',
      action: 'delete',
    },
    {
      resource: 'dashboard',
      action: 'read',
    },
    {
      resource: 'dashboard',
      action: 'create',
    },
    {
      resource: 'dashboard',
      action: 'update',
    },
    {
      resource: 'dashboard',
      action: 'delete',
    },
    {
      resource: 'users',
      action: 'create',
    },
    {
      resource: 'users',
      action: 'read',
    },
    {
      resource: 'users',
      action: 'update',
    },
    {
      resource: 'users',
      action: 'delete',
    },
    {
      resource: 'roles',
      action: 'create',
    },
    {
      resource: 'roles',
      action: 'read',
    },
    {
      resource: 'roles',
      action: 'update',
    },
    {
      resource: 'roles',
      action: 'delete',
    },
    {
      resource: 'permissions',
      action: 'create',
    },
    {
      resource: 'permissions',
      action: 'read',
    },
    {
      resource: 'permissions',
      action: 'update',
    },
    {
      resource: 'permissions',
      action: 'delete',
    },
  ];

  const savedPermissions: Permisos[] = [];

  for (const p of permissionsToCreate) {
    let perm = await prisma.permisos.findFirst({
      where: { recurso: p.resource, accion: p.action },
    });

    if (!perm) {
      perm = await prisma.permisos.create({
        data: {
          recurso: p.resource,
          accion: p.action,
        },
      });
    }
    savedPermissions.push(perm);
  }

  return savedPermissions;
}
