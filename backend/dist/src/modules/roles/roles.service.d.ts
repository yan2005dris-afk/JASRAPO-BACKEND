import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/database/prisma.service';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createRoleDto: CreateRoleDto): Promise<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    }>;
    private isRolesIdUniqueConstraintError;
    private syncRolesIdSequence;
    findAll(): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    }[]>;
    findOne(id: number): import("../../generated/prisma/models").Prisma__RolesClient<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    update(id: number, updateRoleDto: UpdateRoleDto): import("../../generated/prisma/models").Prisma__RolesClient<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    getRolePermissions(rolesId: number): Promise<{
        rolPermissionsId: number;
        permissionsId: number;
        resource: string;
        action: string;
    }[]>;
    assignPermission(rolesId: number, permissionsId: number): Promise<{
        deletedAt: Date | null;
        permissionsId: number;
        rolesId: number;
        rolPermissionsId: number;
    }>;
    removePermission(rolesId: number, permissionsId: number): Promise<{
        deletedAt: Date | null;
        permissionsId: number;
        rolesId: number;
        rolPermissionsId: number;
    }>;
}
