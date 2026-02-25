import { Menus, Permissions, PrismaClient } from "src/generated/prisma/client";

export async function seedMenuPermissions(
    prisma:PrismaClient,
    menus: Menus[],
    permissions:Permissions[]
){
    //Limpiar tabla menuPermissions
    await prisma.menuPermissions.deleteMany();

    //Reglas de permisos para cada menu
    const menuPermissionMap:{
        menuName: string;
        permissionKeys: { resource: string; action: string }[];
    }[] = [
        {
            menuName: 'Usuarios',
            permissionKeys: [{ resource: 'users', action: 'read' }],
        },
        {
            menuName: 'Crear Usuario',
            permissionKeys: [{ resource: 'users', action: 'create' }],
        },
        {
            menuName: 'Listar Usuarios',
            permissionKeys: [{ resource: 'users', action: 'read' }],
        },
        {
            menuName: 'Configuración',
            permissionKeys: [{ resource: 'config', action: 'read' }],
        },
        {
            menuName: 'Asignar Roles',
            permissionKeys: [
                { resource: 'roles', action: 'create' },
                { resource: 'roles', action: 'read' },
                { resource: 'roles', action: 'update' },
                { resource: 'roles', action: 'delete' },
            ],
        },
        {
            menuName: 'Asignar Permisos',
            permissionKeys: [
                { resource: 'permissions', action: 'create' },
                { resource: 'permissions', action: 'read' },
            ],
        },
        {
            menuName: 'Clientes',
            permissionKeys: [{ resource: 'clients', action: 'read' }],
        },
        {
            menuName: 'Registrar Cliente',
            permissionKeys: [{ resource: 'clients', action: 'create' }],
        },
        {
            menuName: 'Buscar Clientes',
            permissionKeys: [{ resource: 'clients', action: 'read' }],
        },
        {
            menuName: 'Mi Cuenta',
            permissionKeys: [{ resource: 'account', action: 'read' }],
        },
        {
            menuName: 'Facturas',
            permissionKeys: [{ resource: 'invoices', action: 'read' }],
        },
        {
            menuName: 'Lecturas',
            permissionKeys: [{ resource: 'readings', action: 'read' }],
        },
        {
            menuName: 'Registrar Lectura',
            permissionKeys: [{ resource: 'readings', action: 'create' }],
        },
        {
            menuName: 'Historial de Lecturas',
            permissionKeys: [{ resource: 'readings', action: 'read' }],
        },
    ];

    // Asignar permisos a cada menu según el mapa definido
    for (const menu of menuPermissionMap) {
        const dbMenu = menus.find(m => m.name === menu.menuName);
        if (!dbMenu) {
            throw new Error(`Menu ${menu.menuName} not found`);
        }

        for (const permissionKey of menu.permissionKeys) {
            const dbPermission = permissions.find(p => p.resource === permissionKey.resource && p.action === permissionKey.action);
            if (!dbPermission) {
                throw new Error(`Permission ${permissionKey.resource}:${permissionKey.action} not found`);
            }
            // Verificar si la relación ya existe antes de crearla
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
                    }
                });
            }
        }
    }

    console.log('✅ Menu-Permissions asignados correctamente.');
}