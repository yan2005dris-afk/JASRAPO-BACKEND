import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/database/prisma.service';
export declare class PermissionsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPermissionDto: CreatePermissionDto): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        deletedAt: Date | null;
        permissionsId: number;
        resource: string;
        action: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    findAll(): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        permissionsId: number;
        resource: string;
        action: string;
    }[]>;
    findOne(id: number): Promise<{
        deletedAt: Date | null;
        permissionsId: number;
        resource: string;
        action: string;
    }>;
    update(id: number, updatePermissionDto: UpdatePermissionDto): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        permissionsId: number;
        resource: string;
        action: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    remove(id: number): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        permissionsId: number;
        resource: string;
        action: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
}
