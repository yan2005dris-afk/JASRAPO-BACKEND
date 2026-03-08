import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRolePermissionDto } from './dto/assign-role-permission.dto';
import { SetRoleChildrenDto } from './dto/set-role-children.dto';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: CreateRoleDto): Promise<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    }>;
    findAll(): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    }[]>;
    findOne(id: string): import("../../generated/prisma/models").Prisma__RolesClient<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    } | null, null, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    update(id: string, updateRoleDto: UpdateRoleDto): import("../../generated/prisma/models").Prisma__RolesClient<{
        name: string;
        deletedAt: Date | null;
        rolesId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, {
        omit: import("../../generated/prisma/internal/prismaNamespace").GlobalOmitConfig | undefined;
    }>;
    getRolePermissions(id: string): Promise<{
        rolPermissionsId: number;
        permissionsId: number;
        resource: string;
        action: string;
    }[]>;
    getRoleChildren(id: string): Promise<{
        roleHierarchyId: number;
        childRoleId: number;
        childRoleName: string;
    }[]>;
    setRoleChildren(id: string, dto: SetRoleChildrenDto): Promise<{
        roleHierarchyId: number;
        childRoleId: number;
        childRole: {
            name: string;
        };
    }[]>;
    assignPermission(id: string, assignRolePermissionDto: AssignRolePermissionDto): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        rolPermissionsId: number;
        permissionsId: number;
    }>;
    removePermission(id: string, permissionId: string): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        rolPermissionsId: number;
        permissionsId: number;
    }>;
}
