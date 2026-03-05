import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    create(createUserDto: CreateUserDto): Promise<{
        usersId: number;
        email: string;
    }>;
    findAll(skip?: number, take?: number): Promise<{
        usersId: number;
        email: string;
        roles: {
            rolesId: number;
            name: string;
        }[];
    }[]>;
    findOne(id: number): Promise<{
        email: string;
        usersId: number;
    } | null>;
    getUserRoles(id: number): Promise<string[]>;
    getUserRoleAssignments(id: number): Promise<{
        usersRolesId: number;
        rolesId: number;
        name: string;
    }[]>;
    updateUser(id: number, updateUserDto: UpdateUserDto): Promise<{
        email: string;
        usersId: number;
    }>;
    assignRole(id: number, assignRoleDto: AssignRoleDto): Promise<{
        usersId: number;
        deletedAt: Date | null;
        usersRolesId: number;
        rolesId: number;
    }>;
    getUserPermissions(id: number): Promise<{
        idUserPermissions: number;
        permissionsId: number;
        resource: string;
        action: string;
        allow: boolean;
    }[]>;
    assignPermission(id: number, assignPermissionDto: AssignPermissionDto): Promise<{
        usersId: number;
        allow: boolean;
        deteledAt: Date | null;
        idUserPermissions: number;
        permissionsId: number;
    }>;
    revokeRole(userRolesId: number): Promise<{
        usersId: number;
        deletedAt: Date | null;
        usersRolesId: number;
        rolesId: number;
    }>;
    remove(id: number): Promise<{
        email: string;
        usersId: number;
    }>;
    revokePermission(userPermissionId: number): Promise<{
        usersId: number;
        allow: boolean;
        deteledAt: Date | null;
        idUserPermissions: number;
        permissionsId: number;
    }>;
    getEffectivePermissions(usersId: number): Promise<{
        resource: string;
        action: string;
    }[]>;
}
