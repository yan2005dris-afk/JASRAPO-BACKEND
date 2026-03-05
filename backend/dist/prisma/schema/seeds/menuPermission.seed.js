"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMenuPermissions = seedMenuPermissions;
async function seedMenuPermissions(prisma, menus, permissions) {
    await prisma.menuPermissions.deleteMany();
    const menuPermissionMap = [
        {
            menuName: 'Listar Cliente',
            permissionKeys: [
                {
                    resource: 'clientes',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Cliente',
            permissionKeys: [
                {
                    resource: 'clientes',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Cliente',
            permissionKeys: [
                {
                    resource: 'clientes',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Cliente',
            permissionKeys: [
                {
                    resource: 'clientes',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Contratos de Servicios',
            permissionKeys: [
                {
                    resource: 'contratos',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Contratos de Servicios',
            permissionKeys: [
                {
                    resource: 'contratos',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Contratos de Servicios',
            permissionKeys: [
                {
                    resource: 'contratos',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Contratos de Servicios',
            permissionKeys: [
                {
                    resource: 'contratos',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Medidores',
            permissionKeys: [
                {
                    resource: 'medidores',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Medidores',
            permissionKeys: [
                {
                    resource: 'medidores',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Medidores',
            permissionKeys: [
                {
                    resource: 'medidores',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Medidores',
            permissionKeys: [
                {
                    resource: 'medidores',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Tarifas y Categorias',
            permissionKeys: [
                {
                    resource: 'tarifas',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Tarifas y Categorias',
            permissionKeys: [
                {
                    resource: 'tarifas',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Tarifas y Categorias',
            permissionKeys: [
                {
                    resource: 'tarifas',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Tarifas y Categorias',
            permissionKeys: [
                {
                    resource: 'tarifas',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Lectura de Consumo',
            permissionKeys: [
                {
                    resource: 'lecturas',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Lectura de Consumo',
            permissionKeys: [
                {
                    resource: 'lecturas',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Lectura de Consumo',
            permissionKeys: [
                {
                    resource: 'lecturas',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Lectura de Consumo',
            permissionKeys: [
                {
                    resource: 'lecturas',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Convenios de pago',
            permissionKeys: [
                {
                    resource: 'convenios',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Convenios de pago',
            permissionKeys: [
                {
                    resource: 'convenios',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Convenios de pago',
            permissionKeys: [
                {
                    resource: 'convenios',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Convenios de pago',
            permissionKeys: [
                {
                    resource: 'convenios',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Generacion de Planillas',
            permissionKeys: [
                {
                    resource: 'planillas',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Generacion de Planillas',
            permissionKeys: [
                {
                    resource: 'planillas',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Generacion de Planillas',
            permissionKeys: [
                {
                    resource: 'planillas',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Generacion de Planillas',
            permissionKeys: [
                {
                    resource: 'planillas',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Facturacion Electronica',
            permissionKeys: [
                {
                    resource: 'facturacion_electronica',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Facturacion Electronica',
            permissionKeys: [
                {
                    resource: 'facturacion_electronica',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Facturacion Electronica',
            permissionKeys: [
                {
                    resource: 'facturacion_electronica',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Facturacion Electronica',
            permissionKeys: [
                {
                    resource: 'facturacion_electronica',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Recaudación y pagos',
            permissionKeys: [
                {
                    resource: 'recaudacion',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Recaudación y pagos',
            permissionKeys: [
                {
                    resource: 'recaudacion',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Recaudación y pagos',
            permissionKeys: [
                {
                    resource: 'recaudacion',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Recaudación y pagos',
            permissionKeys: [
                {
                    resource: 'recaudacion',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Notas de Credito o Debito',
            permissionKeys: [
                {
                    resource: 'notas_credito',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Notas de Credito o Debito',
            permissionKeys: [
                {
                    resource: 'notas_credito',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Notas de Credito o Debito',
            permissionKeys: [
                {
                    resource: 'notas_credito',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Notas de Credito o Debito',
            permissionKeys: [
                {
                    resource: 'notas_credito',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Envio de Facturas',
            permissionKeys: [
                {
                    resource: 'envio_facturas',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Envio de Facturas',
            permissionKeys: [
                {
                    resource: 'envio_facturas',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Envio de Facturas',
            permissionKeys: [
                {
                    resource: 'envio_facturas',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Envio de Facturas',
            permissionKeys: [
                {
                    resource: 'envio_facturas',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Estado de cuenta Cliente',
            permissionKeys: [
                {
                    resource: 'estado_cuenta',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Estado de cuenta Cliente',
            permissionKeys: [
                {
                    resource: 'estado_cuenta',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Estado de cuenta Cliente',
            permissionKeys: [
                {
                    resource: 'estado_cuenta',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Estado de cuenta Cliente',
            permissionKeys: [
                {
                    resource: 'estado_cuenta',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar Recaudación y Morosida',
            permissionKeys: [
                {
                    resource: 'recaudacion_morosidad',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear Recaudación y Morosida',
            permissionKeys: [
                {
                    resource: 'recaudacion_morosidad',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar Recaudación y Morosida',
            permissionKeys: [
                {
                    resource: 'recaudacion_morosidad',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar Recaudación y Morosida',
            permissionKeys: [
                {
                    resource: 'recaudacion_morosidad',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar ConsumoPorZonas',
            permissionKeys: [
                {
                    resource: 'consumo_zonas',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear ConsumoPorZonas',
            permissionKeys: [
                {
                    resource: 'consumo_zonas',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar ConsumoPorZonas',
            permissionKeys: [
                {
                    resource: 'consumo_zonas',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar ConsumoPorZonas',
            permissionKeys: [
                {
                    resource: 'consumo_zonas',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Listar DashboardKpi',
            permissionKeys: [
                {
                    resource: 'dashboard',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Crear DashboardKpi',
            permissionKeys: [
                {
                    resource: 'dashboard',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizar DashboardKpi',
            permissionKeys: [
                {
                    resource: 'dashboard',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminar DashboardKpi',
            permissionKeys: [
                {
                    resource: 'dashboard',
                    action: 'delete',
                },
            ],
        },
        {
            menuName: 'Lectura Usuarios',
            permissionKeys: [
                {
                    resource: 'users',
                    action: 'read',
                },
            ],
        },
        {
            menuName: 'Escritura Usuarios',
            permissionKeys: [
                {
                    resource: 'users',
                    action: 'create',
                },
            ],
        },
        {
            menuName: 'Actualizacion Usuarios',
            permissionKeys: [
                {
                    resource: 'users',
                    action: 'update',
                },
            ],
        },
        {
            menuName: 'Eliminacion Usuarios',
            permissionKeys: [
                {
                    resource: 'users',
                    action: 'delete',
                },
            ],
        },
    ];
    for (const menu of menuPermissionMap) {
        const dbMenu = menus.find((m) => m.name === menu.menuName);
        if (!dbMenu) {
            continue;
        }
        for (const permissionKey of menu.permissionKeys) {
            const dbPermission = permissions.find((p) => p.resource === permissionKey.resource &&
                p.action === permissionKey.action);
            if (!dbPermission) {
                continue;
            }
            const exists = await prisma.menuPermissions.findFirst({
                where: {
                    menusId: dbMenu.menusId,
                    permissionsId: dbPermission.permissionsId,
                },
            });
            if (!exists) {
                await prisma.menuPermissions.create({
                    data: {
                        menusId: dbMenu.menusId,
                        permissionsId: dbPermission.permissionsId,
                    },
                });
            }
        }
    }
    console.log('✅ Menu-Permissions asignados correctamente.');
}
//# sourceMappingURL=menuPermission.seed.js.map