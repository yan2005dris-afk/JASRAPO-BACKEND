import { PrismaClient } from "src/generated/prisma/client";


export async function seedRoles(prisma: PrismaClient) {
    const superadminRol = await prisma.roles.upsert({
        where: { rolId: 0 },
        update: {},
        create: { rolId: 0, nombre: 'superadmin' },
    });

    const adminRol = await prisma.roles.upsert({
        where: { rolId: 1 },
        update: {},
        create: { rolId: 1, nombre: 'admin' },
    });

    const secretariaRol = await prisma.roles.upsert({
        where: { rolId: 2 },
        update: {},
        create: { rolId: 2, nombre: 'secretaria' },
    });

    const recaudacionRol = await prisma.roles.upsert({
        where: { rolId: 3 },
        update: {},
        create: { rolId: 3, nombre: 'recaudacion' },
    });

    const presidenciaRol = await prisma.roles.upsert({
        where: { rolId: 4 },
        update: {},
        create: { rolId: 4, nombre: 'presidencia' },
    });

    const operadoresRol = await prisma.roles.upsert({
        where: { rolId: 5 },
        update: {},
        create: { rolId: 5, nombre: 'operadores' },
    });

    const contabilidadRol = await prisma.roles.upsert({
        where: { rolId: 6 },
        update: {},
        create: { rolId: 6, nombre: 'contabilidad' },
    });

    const userRol = await prisma.roles.upsert({
        where: { rolId: 7 },
        update: {},
        create: { rolId: 7, nombre: 'user' },
    });

    return {
        superadminRol,
        adminRol,
        secretariaRol,
        recaudacionRol,
        presidenciaRol,
        operadoresRol,
        contabilidadRol,
        userRol,
    };
}
