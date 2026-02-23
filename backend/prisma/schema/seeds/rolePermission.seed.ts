import { Permissions, PrismaClient, Roles } from "src/generated/prisma/client";


export async function seedRolePermissions(
    prisma: PrismaClient,
    roles: {adminRol: Roles, secretariaRol: Roles, userRol: Roles},
    permissions: Permissions[]
) {
    await prisma.rolPermissions.deleteMany({});

  // Asignar TODOS los permisos al Admin
    for (const perm of permissions) {
        await prisma.rolPermissions.create({
        data: {
            rolesId: roles.adminRol.rolesId,
            permissionsId: perm.permissionsId,
        },
        });
    }

    const readPerm = permissions.find(
        (p) => p.resource === 'users' && p.action === 'read',
    );
    if (readPerm) {
        await prisma.rolPermissions.create({
        data: {
            rolesId: roles.userRol.rolesId,
            permissionsId: readPerm.permissionsId,
        },
        });
    }
}