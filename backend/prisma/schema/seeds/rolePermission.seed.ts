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
    //    Como el loop cubre TODOS los permisos, admin recibe `reportes:*`
    //    automáticamente cuando `reportes` se agrega a permission.seed.ts.
    for (const perm of permissions) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.adminRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 2. SECRETARIA: Gestión operativa básica y clientes
    const secretaryResources = [
        'clientes',
        'lecturas', 'reading-anomalies',
        'routes', 'batches',
        'agreements',
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
        'notas_credito', 'envio_facturas', 'batches',
        'payments', 'pre-invoices', 'discounts', 'rubros',
        'clientes'
    ];
    const recaudacionPerms = permissions.filter(p => recaudacionResources.includes(p.recurso));
    for (const perm of recaudacionPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.recaudacionRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 4. OPERADORES: Solo lo necesario para su pantalla de lecturas
    const operadorPermissionKeys = new Set([
        'meters:read',              // sync offline PWA
        'lecturas:read',            // ver lecturas asignadas
        'lecturas:update',          // modificar lectura (PENDIENTE → POR_REVISION)
        'reading-anomalies:create', // reportar novedad/daño
    ]);
    const operadorPerms = permissions.filter(p => operadorPermissionKeys.has(`${p.recurso}:${p.accion}`));
    for (const perm of operadorPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.operadoresRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 5. PRESIDENCIA: SOLO LECTURA DE REPORTES
    //    Antes usaba los recursos zombie `estado_cuenta`, `recaudacion_morosidad`,
    //    `consumo_zonas`, `dashboard`. Esos ya no se chequean en ningún
    //    controller — ReportsController usa `@RequiredPermission('reportes','read')`.
    //    Ahora se asigna `reportes:read` directamente.
    const presidenciaReportes = permissions.filter(
        (p) => p.recurso === 'reportes' && p.accion === 'read',
    );
    for (const perm of presidenciaReportes) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.presidenciaRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 6. CONTABILIDAD: SOLO LECTURA DE REPORTES
    //    Mismo caso que presidencia — antes no tenía reportes asignados.
    const contabilidadReportes = permissions.filter(
        (p) => p.recurso === 'reportes' && p.accion === 'read',
    );
    for (const perm of contabilidadReportes) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.contabilidadRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 7. REPORTES:READ para roles de staff que ya tienen permisos por recurso
    //    (secretaria, recaudacion). Presidencia y contabilidad ya están
    //    cubiertas arriba (secciones 5 y 6). User/operadores NO reciben.
    const reportesRead = permissions.find(
        (p) => p.recurso === 'reportes' && p.accion === 'read',
    );
    if (reportesRead) {
        const staffRolesWithReportes = [
            roles.secretariaRol,
            roles.recaudacionRol,
        ];
        for (const rol of staffRolesWithReportes) {
            const existing = await prisma.rolPermisos.findFirst({
                where: {
                    rolId: rol.rolId,
                    permisoId: reportesRead.permisoId,
                },
            });
            if (!existing) {
                await prisma.rolPermisos.create({
                    data: { rolId: rol.rolId, permisoId: reportesRead.permisoId },
                });
            }
        }
    }

    // 8. USER: SOLO PERFIL
    const userResources = ['profile'];
    const userPerms = permissions.filter(p => userResources.includes(p.recurso));
    for (const perm of userPerms) {
        await prisma.rolPermisos.create({
            data: { rolId: roles.userRol.rolId, permisoId: perm.permisoId },
        });
    }

    // 9. MENUS:READ para todos los roles no-admin
    //    Admin ya recibe este permiso por el loop del paso 1.
    //    Cualquier usuario autenticado debe poder obtener su propio árbol de
    //    menús (GET /api/v1/menus/my), por eso se asigna explícitamente a
    //    cada rol. No se hace create/update/delete: el menú es managed data,
    //    no algo que se cree por endpoint todavía (ver roles/permissions para eso).
    const menusRead = permissions.find(
        (p) => p.recurso === 'menus' && p.accion === 'read',
    );
    if (menusRead) {
        const everyRoleExceptAdmin = [
            roles.secretariaRol,
            roles.recaudacionRol,
            roles.operadoresRol,
            roles.presidenciaRol,
            roles.contabilidadRol,
            roles.userRol,
        ];
        for (const rol of everyRoleExceptAdmin) {
            await prisma.rolPermisos.create({
                data: { rolId: rol.rolId, permisoId: menusRead.permisoId },
            });
        }
    }

    console.log('✅ Roles-Permisos actualizados y asignados correctamente.');
}