import { Permisos, PrismaClient } from "src/generated/prisma/client";

const ACTION_LABELS: Record<string, string> = {
    read: "Consultar",
    create: "Crear",
    update: "Actualizar",
    delete: "Eliminar",
};

function buildPermissionName(resource: string, action: string): string {
    const actionLabel = ACTION_LABELS[action] ?? action;
    const resourceLabel = resource
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return `${actionLabel} ${resourceLabel}`;
}

function buildPermissionDescription(resource: string, action: string): string {
    const actionLabel = ACTION_LABELS[action] ?? action;
    const resourceLabel = resource
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
    return `Permite ${actionLabel.toLowerCase()} registros de ${resourceLabel.toLowerCase()}`;
}

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

    const actions = ["read", "create", "update", "delete"];
    
    const permissionsToCreate: { resource: string, action: string }[] = [];

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
                nombre: buildPermissionName(p.resource, p.action),
                descripcion: buildPermissionDescription(p.resource, p.action),
                recurso: p.resource,
                accion: p.action,
            },
        });
        }
        savedPermissions.push(perm);
    }

    return savedPermissions;
}
