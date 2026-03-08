import { Permissions, PrismaClient, Roles } from "src/generated/prisma/client";
export declare function seedRolePermissions(prisma: PrismaClient, roles: {
    adminRol: Roles;
    secretariaRol: Roles;
    recaudacionRol: Roles;
    presidenciaRol: Roles;
    operadoresRol: Roles;
    contabilidadRol: Roles;
    userRol: Roles;
}, permissions: Permissions[]): Promise<void>;
