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
        create: { rolesId: 2, name: 'secretary' },
    });
    const userRol = await prisma.roles.upsert({
        where: { rolesId: 3 },
        update: {},
        create: { rolesId: 3, name: 'user' },
    });
    const clienteRol = await prisma.roles.upsert({
        where: { rolesId: 4 },
        update: {},
        create: { rolesId: 4, name: 'client' },
    });
    return { adminRol, secretariaRol, userRol, clienteRol };
}
//# sourceMappingURL=role.seed.js.map