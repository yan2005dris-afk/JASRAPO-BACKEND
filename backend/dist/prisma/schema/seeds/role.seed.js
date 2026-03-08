"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRoles = seedRoles;
async function seedRoles(prisma) {
    const adminRol = await prisma.roles.upsert({
        where: { rolesId: 1 },
        update: {},
        create: { rolesId: 1, name: 'admin' },
    });
    const secretariaRol = await prisma.roles.upsert({
        where: { rolesId: 2 },
        update: {},
        create: { rolesId: 2, name: 'secretaria' },
    });
    const recaudacionRol = await prisma.roles.upsert({
        where: { rolesId: 3 },
        update: {},
        create: { rolesId: 3, name: 'recaudacion' },
    });
    const presidenciaRol = await prisma.roles.upsert({
        where: { rolesId: 4 },
        update: {},
        create: { rolesId: 4, name: 'presidencia' },
    });
    const operadoresRol = await prisma.roles.upsert({
        where: { rolesId: 5 },
        update: {},
        create: { rolesId: 5, name: 'operadores' },
    });
    const contabilidadRol = await prisma.roles.upsert({
        where: { rolesId: 6 },
        update: {},
        create: { rolesId: 6, name: 'contabilidad' },
    });
    const userRol = await prisma.roles.upsert({
        where: { rolesId: 7 },
        update: {},
        create: { rolesId: 7, name: 'user' },
    });
    return {
        adminRol,
        secretariaRol,
        recaudacionRol,
        presidenciaRol,
        operadoresRol,
        contabilidadRol,
        userRol,
    };
}
//# sourceMappingURL=role.seed.js.map