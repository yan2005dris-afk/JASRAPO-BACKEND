import { PrismaClient } from "src/generated/prisma/client";
export declare function seedUSers(prisma: PrismaClient): Promise<{
    deletedAt: Date | null;
    usersId: number;
    email: string;
    password: string;
}[]>;
