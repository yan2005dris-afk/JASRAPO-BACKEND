import { PrismaClient } from "src/generated/prisma/client";
export declare function seedRoles(prisma: PrismaClient): Promise<{
    adminRol: {
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    };
    secretariaRol: {
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    };
    userRol: {
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    };
    clienteRol: {
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    };
}>;
