import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    private isBcryptHash;
    private ensureHashedPassword;
    user(userWhereUniqueInput: Prisma.UsersWhereUniqueInput): Promise<{
        usersId: number;
        email: string;
    } | null>;
    users(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.UsersWhereUniqueInput;
        where?: Prisma.UsersWhereInput;
        orderBy?: Prisma.UsersOrderByWithRelationInput;
    }): Promise<{
        usersId: number;
        email: string;
        roles: {
            rolesId: number;
            name: string;
        }[];
    }[]>;
    createUser(createUsersDto: CreateUserDto): Promise<{
        usersId: number;
        email: string;
    }>;
    updateUser(params: {
        where: Prisma.UsersWhereUniqueInput;
        data: Prisma.UsersUpdateInput;
    }): Promise<{
        usersId: number;
        email: string;
    }>;
    softDeleteUser(where: Prisma.UsersWhereUniqueInput): Promise<{
        usersId: number;
        email: string;
    }>;
    getRolesByUserId(usersId: number): Promise<string[]>;
    getRoleAssignmentsByUserId(usersId: number): Promise<{
        usersRolesId: number;
        rolesId: number;
        name: string;
    }[]>;
    assignRoleToUser(usersId: number, rolesId: number): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        usersId: number;
        usersRolesId: number;
    }>;
    revokeRoleFromUser(usersRolesId: number): Promise<{
        deletedAt: Date | null;
        rolesId: number;
        usersId: number;
        usersRolesId: number;
    }>;
    getDirectPermissionsByUserId(usersId: number): Promise<{
        idUserPermissions: number;
        permissionsId: number;
        resource: string;
        action: string;
        allow: boolean;
    }[]>;
    assignPermissionToUser(usersId: number, permissionsId: number, allow?: boolean): Promise<{
        permissionsId: number;
        usersId: number;
        allow: boolean;
        deteledAt: Date | null;
        idUserPermissions: number;
    }>;
    revokePermissionFromUser(idUserPermissions: number): Promise<{
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
