import {
  Permisos,
  PrismaClient,
  Roles,
} from 'src/generated/prisma/client';

export async function seedRolePermissions(
  prisma: PrismaClient,
  roles: {
    adminRol: Roles;
    secretariaRol: Roles;
    recaudacionRol: Roles;
    presidenciaRol: Roles;
    operadoresRol: Roles;
    contabilidadRol: Roles;
    userRol: Roles;
  },
  permissions: Permisos[],
) {
  await prisma.rolPermisos.deleteMany();

    // 1. ADMIN: TODOS LOS PERMISOS (Acceso total garantizado)
    for (const perm of permissions) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.adminRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 2. SECRETARIA: Gestión operativa básica y clientes
    const secretaryResources = [
        'clientes',
        'lecturas', 'reading-anomalies',
        'routes', 'lotes'
    ];
    const secretaryPerms = permissions.filter(p => secretaryResources.includes(p.recurso));
    for (const perm of secretaryPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.secretariaRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 3. RECAUDACION: Facturación, Cobros y Clientes (Sin Lecturas)
    const recaudacionResources = [
        'planillas', 'facturacion_electronica', 'recaudacion', 
        'notas_credito', 'envio_facturas', 'lotes',
        'clientes'
    ];
    const recaudacionPerms = permissions.filter(p => recaudacionResources.includes(p.recurso));
    for (const perm of recaudacionPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.recaudacionRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 4. OPERADORES: Solo toma de lecturas y novedades
    const operadoresResources = [
        'lecturas', 'reading-anomalies'
    ];
    const operadoresPerms = permissions.filter(p => operadoresResources.includes(p.recurso));
    for (const perm of operadoresPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.operadoresRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 5. PRESIDENCIA: SOLO LECTURA DE REPORTES
    const reportesResources = ['estado_cuenta', 'recaudacion_morosidad', 'consumo_zonas', 'dashboard'];
    const presidenciaPerms = permissions.filter(
        (p) => reportesResources.includes(p.recurso) && p.accion === 'read',
    );
    for (const perm of presidenciaPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.presidenciaRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 6. USER: SOLO PERFIL
    const userResources = ['profile'];
    const userPerms = permissions.filter(p => userResources.includes(p.recurso));
    for (const perm of userPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.userRol.rolId, permisoId: perm.permisoId },
        });
    }

    console.log('✅ Roles-Permisos actualizados y asignados correctamente.');
}
