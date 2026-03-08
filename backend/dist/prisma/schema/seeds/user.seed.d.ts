import { PrismaClient, Roles } from "src/generated/prisma/client";
export declare function seedUSers(prisma: PrismaClient, roles: {
    adminRol: Roles;
    secretariaRol: Roles;
    recaudacionRol: Roles;
    presidenciaRol: Roles;
    operadoresRol: Roles;
    contabilidadRol: Roles;
    userRol: Roles;
}): Promise<{
    deletedAt: Date | null;
    rolesId: number | null;
    usersId: number;
    email: string;
    password: string;
}[]>;
