import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
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
    findOne(id: string): Promise<{
        deletedAt: Date | null;
        permissionsId: number;
        resource: string;
        action: string;
    }>;
    update(id: string, updatePermissionDto: UpdatePermissionDto): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        permissionsId: number;
        resource: string;
        action: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    SoftDelete(id: string): import("../../generated/prisma/models").Prisma__PermissionsClient<{
        permissionsId: number;
        resource: string;
        action: string;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
}
