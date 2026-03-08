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
    const recaudacionResources = ['planillas', 'facturacion_electronica', 'recaudacion', 'notas_credito', 'envio_facturas'];
    const recaudacionPerms = permissions.filter(p => recaudacionResources.includes(p.resource));
    for (const perm of recaudacionPerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.recaudacionRol.rolesId, permissionsId: perm.permissionsId },
        });
    }
    const reportesResources = ['estado_cuenta', 'recaudacion_morosidad', 'consumo_zonas', 'dashboard'];
    const presidenciaPerms = permissions.filter((p) => reportesResources.includes(p.resource) && p.action === 'read');
    for (const perm of presidenciaPerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.presidenciaRol.rolesId, permissionsId: perm.permissionsId },
        });
    }
    const operadoresResources = ['clientes', 'contratos', 'medidores', 'lecturas', 'convenios'];
    const operadoresPerms = permissions.filter((p) => operadoresResources.includes(p.resource) && p.action !== 'delete');
    for (const perm of operadoresPerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.operadoresRol.rolesId, permissionsId: perm.permissionsId },
        });
    }
    console.log('✅ Roles-Permisos asignados correctamente.');
}
//# sourceMappingURL=rolePermission.seed.js.map