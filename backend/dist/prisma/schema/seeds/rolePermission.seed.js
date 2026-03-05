"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRolePermissions = seedRolePermissions;
async function seedRolePermissions(prisma, roles, permissions) {
    await prisma.rolPermissions.deleteMany();
    for (const perm of permissions) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.adminRol.rolesId, permissionsId: perm.permissionsId },
        });
    }
    const contratosResources = ['clientes', 'contratos', 'medidores', 'tarifas', 'lecturas', 'convenios'];
    const secretaryPerms = permissions.filter(p => contratosResources.includes(p.resource));
    for (const perm of secretaryPerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.secretariaRol.rolesId, permissionsId: perm.permissionsId },
        });
    }
    const reportesResources = ['estado_cuenta', 'recaudacion_morosidad', 'consumo_zonas', 'dashboard'];
    const clientePerms = permissions.filter(p => reportesResources.includes(p.resource));
    for (const perm of clientePerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.clienteRol.rolesId, permissionsId: perm.permissionsId },
        });
    }
    console.log('✅ Roles-Permisos asignados correctamente.');
}
//# sourceMappingURL=rolePermission.seed.js.map