import { Permisos, PrismaClient } from 'src/generated/prisma/client';

export async function seedPermissions(prisma: PrismaClient) {
    const resources = [
        "clientes",
        "client",
        "contratos",
        "contract",
        "contracts", // Alias para coincidir con decoradores
        "medidores",
        "meter",
        "meters",    // Alias para coincidir con decoradores
        "tarifas",
        "lecturas",
        "reading-anomalies",
        "comunidades",
        "sectores",
        "lote",
        "lotes",
        "convenios",
        "planillas",
        "facturacion_electronica",
        "recaudacion",
        "notas_credito",
        "envio_facturas",
        "estado_cuenta",
        "recaudacion_morosidad",
        "consumo_zonas",
        "dashboard",
        "users",
        "roles",
        "permissions",
        "profile",
        "files",
        "metrics",
        "routes"     // Rutas de trabajo (empleados asignados a zonas)
    ];

  const actions = ['read', 'create', 'update', 'delete'];

  const permissionsToCreate: { resource: string; action: string }[] = [];

  for (const resource of resources) {
    for (const action of actions) {
      permissionsToCreate.push({ resource, action });
    }
  }

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
