import { Permissions, PrismaClient, Roles } from "src/generated/prisma/client";


export async function seedRolePermissions(
    prisma: PrismaClient,
    roles: {adminRol: Roles, secretariaRol: Roles, userRol: Roles,clienteRol: Roles},
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

    //Asignar permisos sobre clientes y lecturas a secretaria
    const secretaryPerms = permissions.filter(p =>
        (p.resource === 'clients' && (p.action === 'create' || p.action === 'read')) ||
        (p.resource === 'readings' && (p.action === 'create' || p.action === 'read'))
    );
    
    for (const perm of secretaryPerms) {
        const exists = await prisma.rolPermissions.findFirst({
            where: {
                rolesId: roles.secretariaRol.rolesId,
                permissionsId: perm.permissionsId,
            },
        });

        if (!exists) {
            await prisma.rolPermissions.create({
                data: {
                    rolesId: roles.secretariaRol.rolesId,
                    permissionsId: perm.permissionsId,
                },
            });
        }
    }

    //Asignar permisos de lectura de su cuenta y facturas a cliente
    const clientePerms = permissions.filter(p =>
        (p.resource === 'account' && p.action === 'read') ||
        (p.resource === 'invoices' && p.action === 'read')
    );
    for (const perm of clientePerms) {
        const exists = await prisma.rolPermissions.findFirst({
            where: {
                rolesId: roles.clienteRol.rolesId,
                permissionsId: perm.permissionsId,
            },
        });
        if (!exists) {
            await prisma.rolPermissions.create({
                data: {
                    rolesId: roles.clienteRol.rolesId,
                    permissionsId: perm.permissionsId,
                },
            });
        }
    }

    console.log('✅ Roles-Permisos asignados correctamente.');
}