import { Menus, Permissions, PrismaClient } from 'src/generated/prisma/client';
export declare function seedMenuPermissions(prisma: PrismaClient, menus: Menus[], permissions: Permissions[]): Promise<void>;
