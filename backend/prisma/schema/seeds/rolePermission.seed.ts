import { Permissions, PrismaClient, Roles } from "src/generated/prisma/client";

export async function seedRolePermissions(
    prisma: PrismaClient,
    roles: {
        adminRol: Roles,
        secretariaRol: Roles,
        recaudacionRol: Roles,
        presidenciaRol: Roles,
        operadoresRol: Roles,
        contabilidadRol: Roles,
        userRol: Roles,
    },
    permissions: Permissions[]
) {
    await prisma.rolPermissions.deleteMany();

    // 1. ADMIN: TODOS LOS PERMISOS
    for (const perm of permissions) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.adminRol.rolesId, permissionsId: perm.permissionsId },
        });
    }

        // 2. SECRETARIA: CONTRATOS
    const contratosResources = ['clientes', 'contratos', 'medidores', 'tarifas', 'lecturas', 'convenios'];
    const secretaryPerms = permissions.filter(p => contratosResources.includes(p.resource));
    for (const perm of secretaryPerms) {
        await prisma.rolPermissions.create({
            data: { rolesId: roles.secretariaRol.rolesId, permissionsId: perm.permissionsId },
        });
    }

        // 3. RECAUDACION: FACTURACION
        const recaudacionResources = ['planillas', 'facturacion_electronica', 'recaudacion', 'notas_credito', 'envio_facturas'];
        const recaudacionPerms = permissions.filter(p => recaudacionResources.includes(p.resource));
        for (const perm of recaudacionPerms) {
        await prisma.rolPermissions.create({
                        data: { rolesId: roles.recaudacionRol.rolesId, permissionsId: perm.permissionsId },
        });
    }

        // 4. PRESIDENCIA: SOLO LECTURA DE REPORTES
        const reportesResources = ['estado_cuenta', 'recaudacion_morosidad', 'consumo_zonas', 'dashboard'];
        const presidenciaPerms = permissions.filter(
            (p) => reportesResources.includes(p.resource) && p.action === 'read',
        );
        for (const perm of presidenciaPerms) {
            await prisma.rolPermissions.create({
                data: { rolesId: roles.presidenciaRol.rolesId, permissionsId: perm.permissionsId },
            });
        }

        // 5. OPERADORES: OPERACION DIARIA SIN ELIMINAR
        const operadoresResources = ['clientes', 'contratos', 'medidores', 'lecturas', 'convenios'];
        const operadoresPerms = permissions.filter(
            (p) => operadoresResources.includes(p.resource) && p.action !== 'delete',
        );
        for (const perm of operadoresPerms) {
            await prisma.rolPermissions.create({
                data: { rolesId: roles.operadoresRol.rolesId, permissionsId: perm.permissionsId },
            });
        }

        // 6. CONTABILIDAD: hereda de secretaria + recaudacion por jerarquia (sin directos)

        // 7. USER: NADA
    console.log('✅ Roles-Permisos asignados correctamente.');
}
