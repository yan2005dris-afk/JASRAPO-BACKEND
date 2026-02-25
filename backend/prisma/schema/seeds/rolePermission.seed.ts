import { Permissions, PrismaClient, Roles } from "src/generated/prisma/client";


export async function seedRolePermissions(
    prisma: PrismaClient,
    roles: {adminRol: Roles, secretariaRol: Roles, userRol: Roles},
    permissions: Permissions[]
) {

  // Asignar TODOS los permisos al Admin
    for (const perm of permissions) {
        const exists = await prisma.rolPermissions.findFirst({
            where: {
                rolesId: roles.adminRol.rolesId,
                permissionsId: perm.permissionsId,
            },
        });

        if (!exists) {
            await prisma.rolPermissions.create({
                data: {
                    rolesId: roles.adminRol.rolesId,
                    permissionsId: perm.permissionsId,
                },
            });
        }
    }

    // Asignar solo permiso de lectura de usuarios al rol 'user'
    const readPerm = permissions.find(
        (p) => p.resource === 'users' && p.action === 'read',
    );

    if (readPerm) {
        const exists = await prisma.rolPermissions.findFirst({
            where: {
                rolesId: roles.userRol.rolesId,
                permissionsId: readPerm.permissionsId,
            },
        });

        if (!exists) {
            await prisma.rolPermissions.create({
                data: {
                    rolesId: roles.userRol.rolesId,
                    permissionsId: readPerm.permissionsId,
                },
            });
        }
    }
}