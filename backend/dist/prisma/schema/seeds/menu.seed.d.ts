import { PrismaClient } from 'src/generated/prisma/client';
export declare function seedMenus(prisma: PrismaClient): Promise<{
    icon: string | null;
    menusId: number;
    menusParentId: number | null;
    name: string;
    route: string;
    active: boolean;
    deletedAt: Date | null;
}[]>;
