import { Permissions, PrismaClient, Roles } from "src/generated/prisma/client";
export declare function seedRolePermissions(prisma: PrismaClient, roles: {
    adminRol: Roles;
    secretariaRol: Roles;
    userRol: Roles;
    clienteRol: Roles;
}, permissions: Permissions[]): Promise<void>;
