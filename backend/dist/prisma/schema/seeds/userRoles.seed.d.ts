import { PrismaClient, Roles, Users } from "src/generated/prisma/client";
export declare function seedUserRoles(prisma: PrismaClient, users: Users[], roles: {
    adminRol: Roles;
    secretariaRol: Roles;
    userRol: Roles;
    clienteRol: Roles;
}): Promise<void>;
