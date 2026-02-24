import { PrismaClient } from "src/generated/prisma/client";

export async function seedMenus(prisma:PrismaClient) {
    //Menus para admin
    const usuariosMenu = await prisma.menus.upsert({
        where: { menusId: 1 },
        update: {},
        create: { menusId: 1, name: 'Usuarios', route: '/menu-usuarios' },
    });

    const crearUsuarioMenu = await prisma.menus.upsert({
        where: { menusId: 2 },
        update: {},
        create: { menusId: 2, name: 'Crear Usuario', route: '/menu-usuarios/crear-usuario', menusParentId: usuariosMenu.menusId },
    });

    const listarUsuariosMenu = await prisma.menus.upsert({
        where: { menusId: 3 },
        update: {},
        create: { menusId: 3, name: 'Listar Usuarios', route: '/menu-usuarios/listar-suarios', menusParentId: usuariosMenu.menusId },
    });

    const configMenu= await prisma.menus.upsert({
        where: { menusId: 4 },
        update: {},
        create: { menusId: 4, name: 'Configuración', route: '/configuracion' },
    });
    
    const asignarRolesMenu = await prisma.menus.upsert({
        where: { menusId: 5 },
        update: {},
        create: { menusId: 5, name: 'Asignar Roles', route: '/configuracion/roles', menusParentId: configMenu.menusId },
    });

    const asignarPermisosMenu = await prisma.menus.upsert({
        where: { menusId: 6 },
        update: {},
        create: { menusId: 6, name: 'Asignar Permisos', route: '/configuracion/permisos', menusParentId: configMenu.menusId },
    });

    //Menus para secretaria
    const clientesMenu = await prisma.menus.upsert({
        where: { menusId: 7 },
        update: {},
        create: { menusId: 7, name: 'Clientes', route: '/menu-clientes' },
    });

    const registrarClienteMenu = await prisma.menus.upsert({
        where: { menusId: 8 },
        update: {},
        create: { menusId: 8, name: 'Registrar Cliente', route: '/menu-clientes/registrar-cliente', menusParentId: clientesMenu.menusId },
    });

    const buscarClientesMenu = await prisma.menus.upsert({
        where: { menusId: 9 },
        update: {},
        create: { menusId: 9, name: 'Buscar Clientes', route: '/menu-clientes/buscar-cliente', menusParentId: clientesMenu.menusId },
    });

    const lecturasMenu = await prisma.menus.upsert({
        where: { menusId: 10 },
        update: {},
        create: { menusId: 10, name: 'Lecturas', route: '/lecturas' },
    });

    const registrarLecturaMenu = await prisma.menus.upsert({
        where: { menusId: 11 },
        update: {},
        create: { menusId: 11, name: 'Registrar Lectura', route: '/lecturas/registrar-lectura', menusParentId: lecturasMenu.menusId },
    });

    const historialLecturasMenu = await prisma.menus.upsert({
        where: { menusId: 12 },
        update: {},
        create: { menusId: 12, name: 'Historial de Lecturas', route: '/lecturas/historial-lecturas', menusParentId: lecturasMenu.menusId },
    });

    //Menus para Cliente}
    const miCuentaMenu = await prisma.menus.upsert({
        where: { menusId: 13 },
        update: {},
        create: { menusId: 13, name: 'Mi Cuenta', route: '/mi-cuenta' },
    });

    const misDatosMenu = await prisma.menus.upsert({
        where: { menusId: 14 },
        update: {},
        create: { menusId: 14, name: 'Mis datos', route: '/mi-cuenta/datos', menusParentId: miCuentaMenu.menusId },
    });

    const miMedidorMenu = await prisma.menus.upsert({
        where: { menusId: 15 },
        update: {},
        create: { menusId: 15, name: 'Mi medidor', route: '/mi-cuenta/medidor', menusParentId: miCuentaMenu.menusId },
    });

    const facturasMenu = await prisma.menus.upsert({
        where: { menusId: 16 },
        update: {},
        create: { menusId: 16, name: 'Facturas', route: '/facturas' },
    });

    const misFacturasMenu = await prisma.menus.upsert({
        where: { menusId: 17 },
        update: {},
        create: { menusId: 17, name: 'Mis facturas', route: '/facturas/mis-facturas', menusParentId: facturasMenu.menusId },
    });

    const estadoCuentaMenu = await prisma.menus.upsert({
        where: { menusId: 18 },
        update: {},
        create: { menusId: 18, name: 'Estado de cuenta', route: '/facturas/estado-cuenta', menusParentId: facturasMenu.menusId },
    });
    
    return prisma.menus.findMany({
        orderBy: {
            name: 'asc',
        },
    });
}