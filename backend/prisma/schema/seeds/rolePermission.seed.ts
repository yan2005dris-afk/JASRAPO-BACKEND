import { Permisos, PrismaClient, Roles } from "src/generated/prisma/client";

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
    permissions: Permisos[]
) {
    await prisma.rolPermisos.deleteMany();

    // 1. ADMIN: TODOS LOS PERMISOS
    for (const perm of permissions) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.adminRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 2. SECRETARIA: CONTRATOS
    const contratosResources = [
        'clientes', 'contratos', 'contracts', 
        'medidores', 'meters', 'tarifas', 
        'lecturas', 'convenios', 'reading-anomalies',
        'comunidades', 'sectores'
    ];
    const secretaryPerms = permissions.filter(p => contratosResources.includes(p.recurso));
    for (const perm of secretaryPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.secretariaRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 3. RECAUDACION: FACTURACION
    const recaudacionResources = ['planillas', 'facturacion_electronica', 'recaudacion', 'notas_credito', 'envio_facturas', 'lote', 'lotes'];
    const recaudacionPerms = permissions.filter(p => recaudacionResources.includes(p.recurso));
    for (const perm of recaudacionPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.recaudacionRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 4. PRESIDENCIA: SOLO LECTURA DE REPORTES
    const reportesResources = ['estado_cuenta', 'recaudacion_morosidad', 'consumo_zonas', 'dashboard'];
    const presidenciaPerms = permissions.filter(
        (p) => reportesResources.includes(p.recurso) && p.accion === 'read',
    );
    for (const perm of presidenciaPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.presidenciaRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 5. OPERADORES: OPERACION DIARIA SIN ELIMINAR
    const operadoresResources = [
        'clientes', 'contratos', 'contracts', 
        'medidores', 'meters', 'lecturas', 
        'convenios', 'reading-anomalies'
    ];
    const operadoresPerms = permissions.filter(
        (p) => operadoresResources.includes(p.recurso) && p.accion !== 'delete',
    );
        for (const perm of operadoresPerms) {
            await prisma.rolPermisos.create({
                data: { rolId: roles.operadoresRol.rolId, permisoId: perm.permisoId },
            });
        }

        // 6. CONTABILIDAD: hereda de secretaria + recaudacion por jerarquia (sin directos)

        // 7. USER: NADA
    console.log('✅ Roles-Permisos asignados correctamente.');
}
