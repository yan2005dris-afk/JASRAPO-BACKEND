import { PrismaClient } from "src/generated/prisma/client";
export declare function seedPermissions(prisma: PrismaClient): Promise<{
    deletedAt: Date | null;
    permissionsId: number;
    resource: string;
    action: string;
}[]>;
