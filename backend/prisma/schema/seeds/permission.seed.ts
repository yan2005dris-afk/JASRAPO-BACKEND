import { Permissions, PrismaClient } from "src/generated/prisma/client";


export async function seedPermissions(prisma: PrismaClient) {
    const permissionsToCreate = [
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'update' },
        { resource: 'users', action: 'delete' },
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