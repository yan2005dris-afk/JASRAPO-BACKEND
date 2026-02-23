import { PrismaClient } from "src/generated/prisma/client";


export async function seedRoles(prisma: PrismaClient) {
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

    const userRol = await prisma.roles.upsert({
        where: { rolesId: 3 },
        update: {},
        create: { rolesId: 3, name: 'user' },
    });

    return {adminRol, secretariaRol, userRol};
}