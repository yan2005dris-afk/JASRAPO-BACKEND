import { Permissions, PrismaClient } from "src/generated/prisma/client";


export async function seedPermissions(prisma: PrismaClient) {
    const permissionsToCreate = [
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'update' },
        { resource: 'users', action: 'delete' },
        { resource: 'roles', action: 'create' },
        { resource: 'roles', action: 'read' },
        { resource: 'roles', action: 'update' },
        { resource: 'roles', action: 'delete' },
        { resource: 'permissions', action: 'create' },
        { resource: 'permissions', action: 'read' },
        { resource: 'clients', action: 'create' },
        { resource: 'clients', action: 'read' },
        { resource: 'account', action: 'read' },
        { resource: 'invoices', action: 'read' },
        { resource: 'readings', action: 'create' },
        { resource: 'readings', action: 'read' },
        { resource: 'config', action: 'read' },
    ];
    
    const savedPermissions: Permissions[] = [];

    for (const p of permissionsToCreate) {
        let perm = await prisma.permissions.findFirst({
            where: { resource: p.resource, action: p.action },
        });

        if (!perm) {
            perm = await prisma.permissions.create({
            data: {
                resource: p.resource,
                action: p.action,
            },
        });
        }
        savedPermissions.push(perm);
    }

    return savedPermissions;
}