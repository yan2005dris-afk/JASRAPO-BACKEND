import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    create(createPermissionDto: CreatePermissionDto): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        resource: string;
        action: string;
        deletedAt: Date | null;
        permissionsId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    findAll(): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        resource: string;
        action: string;
        permissionsId: number;
    }[]>;
    findOne(id: string): Promise<{
        resource: string;
        action: string;
        deletedAt: Date | null;
        permissionsId: number;
    }>;
    update(id: string, updatePermissionDto: UpdatePermissionDto): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        resource: string;
        action: string;
        permissionsId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    SoftDelete(id: string): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        resource: string;
        action: string;
        permissionsId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
}
