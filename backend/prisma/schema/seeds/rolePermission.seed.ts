import { Permissions, PrismaClient, Roles } from "src/generated/prisma/client";

export async function seedRolePermissions(
    prisma: PrismaClient,
    roles: {adminRol: Roles, secretariaRol: Roles, userRol: Roles,clienteRol: Roles},
    permissions: Permissions[]
) {
    await prisma.rolPermissions.deleteMany();

    // 1. ADMIN: TODOS LOS PERMISOS
    for (const perm of permissions) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.adminRol.rolesId, permissionsId: perm.permissionsId },
        });
    }

    // 2. SECRETARIA: SOLO CONTRATOS
    const contratosResources = ['clientes', 'contratos', 'medidores', 'tarifas', 'lecturas', 'convenios'];
    const secretaryPerms = permissions.filter(p => contratosResources.includes(p.resource));
    for (const perm of secretaryPerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.secretariaRol.rolesId, permissionsId: perm.permissionsId },
        });
    }

    // 3. CLIENTE: SOLO REPORTES
    const reportesResources = ['estado_cuenta', 'recaudacion_morosidad', 'consumo_zonas', 'dashboard'];
    const clientePerms = permissions.filter(p => reportesResources.includes(p.resource));
    for (const perm of clientePerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.clienteRol.rolesId, permissionsId: perm.permissionsId },
        });
    }

    // 4. USER: NADA
    console.log('✅ Roles-Permisos asignados correctamente.');
}
