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
        usersId: number;
        email: string;
    } | null>;
    getUserRoles(id: number): Promise<string[]>;
    getUserRoleAssignments(id: number): Promise<{
        usersRolesId: number;
        rolesId: number;
        name: string;
    }[]>;
    updateUser(id: number, updateUserDto: UpdateUserDto): Promise<{
        usersId: number;
        email: string;
    }>;
    assignRole(id: number, assignRoleDto: AssignRoleDto): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        usersId: number;
        usersRolesId: number;
    }>;
    getUserPermissions(id: number): Promise<{
        idUserPermissions: number;
        permissionsId: number;
        resource: string;
        action: string;
        allow: boolean;
    }[]>;
    assignPermission(id: number, assignPermissionDto: AssignPermissionDto): Promise<{
        permissionsId: number;
        usersId: number;
        allow: boolean;
        deteledAt: Date | null;
        idUserPermissions: number;
    }>;
    revokeRole(userRolesId: number): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        usersId: number;
        usersRolesId: number;
    }>;
    remove(id: number): Promise<{
        usersId: number;
        email: string;
    }>;
    revokePermission(userPermissionId: number): Promise<{
        permissionsId: number;
        usersId: number;
        allow: boolean;
        deteledAt: Date | null;
        idUserPermissions: number;
    }>;
    getEffectivePermissions(usersId: number): Promise<{
        resource: string;
        action: string;
    }[]>;
}
