import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { SetRoleChildrenDto } from './dto/set-role-children.dto';
import { PrismaService } from 'src/database/prisma.service';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createRoleDto: CreateRoleDto): Promise<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    }>;
    private assertChildRolesExist;
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
    private resolveRoleHierarchy;
    assignPermission(rolesId: number, permissionsId: number): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        rolPermissionsId: number;
        permissionsId: number;
    }>;
    removePermission(rolesId: number, permissionsId: number): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        rolPermissionsId: number;
        permissionsId: number;
    }>;
    getRoleChildren(rolesId: number): Promise<{
        roleHierarchyId: number;
        childRoleId: number;
        childRoleName: string;
    }[]>;
    setRoleChildren(rolesId: number, dto: SetRoleChildrenDto): Promise<{
        roleHierarchyId: number;
        childRoleId: number;
        childRole: {
            name: string;
        };
    }[]>;
}
