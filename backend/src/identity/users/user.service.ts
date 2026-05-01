import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { AssignRoleToUserUseCase } from './use-cases/assign-role-to-user.use-case';
import { AssignPermissionToUserUseCase } from './use-cases/assign-permission-to-user.use-case';
import { RevokePermissionFromUserUseCase } from './use-cases/revoke-permission-from-user.use-case';

const safeUserSelect = {
  usersId: true,
  email: true,
} satisfies Prisma.UsersSelect;

const userWithRolesSelect = {
  usersId: true,
  email: true,
  role: {
    select: {
      rolesId: true,
      name: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.UsersSelect;

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
    private readonly assignRoleUseCase: AssignRoleToUserUseCase,
    private readonly assignPermissionUseCase: AssignPermissionToUserUseCase,
    private readonly revokePermissionUseCase: RevokePermissionFromUserUseCase,
  ) {}

  private isBcryptHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
  }

  private async ensureHashedPassword(password: string): Promise<string> {
    if (this.isBcryptHash(password)) return password;
    return bcrypt.hash(password, 10);
  }

  async user(userWhereUniqueInput: Prisma.UsersWhereUniqueInput) {
    return this.prisma.users.findUnique({
      where: userWhereUniqueInput,
      select: safeUserSelect,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UsersWhereUniqueInput;
    where?: Prisma.UsersWhereInput;
    orderBy?: Prisma.UsersOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const users = await this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: userWithRolesSelect,
    });

    return users.map((user) => ({
      usersId: user.usersId,
      email: user.email,
      roles:
        user.role && !user.role.deletedAt
          ? [{ rolesId: user.role.rolesId, name: user.role.name }]
          : [],
    }));
  }

  async createUser(createUsersDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUsersDto);
  }

  async updateUser(params: {
    where: Prisma.UsersWhereUniqueInput;
    data: Prisma.UsersUpdateInput;
  }) {
    const updateData = { ...params.data };
    if (updateData.password) {
      updateData.password = await this.ensureHashedPassword(
        updateData.password as string,
      );
    }
    return this.prisma.users.update({
      where: params.where,
      data: updateData,
      select: safeUserSelect,
    });
  }

  async softDeleteUser(where: Prisma.UsersWhereUniqueInput) {
    return this.prisma.users.update({
      where,
      data: { deletedAt: new Date() },
      select: safeUserSelect,
    });
  }

  async getRolesByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      select: { role: { select: { name: true, deletedAt: true } } },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (!user.role || user.role.deletedAt) return null;
    return user.role.name;
  }

  async getRoleAssignmentsByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      select: {
        usersId: true,
        deletedAt: true,
        rolesId: true,
        role: { select: { rolesId: true, name: true, deletedAt: true } },
      },
    });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario eliminado o no encontrado');
    if (!user.role || user.role.deletedAt || !user.rolesId) return [];
    return [
      { usersId: user.usersId, rolesId: user.rolesId, name: user.role.name },
    ];
  }

  async assignRoleToUser(usersId: number, rolesId: number) {
    return this.assignRoleUseCase.execute(usersId, rolesId);
  }

  async revokeRoleFromUser(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      select: { usersId: true, deletedAt: true, rolesId: true },
    });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');
    if (!user.rolesId)
      throw new ConflictException('El usuario ya no tiene rol asignado');
    return this.prisma.users.update({
      where: { usersId },
      data: { rolesId: null },
    });
  }

  async getDirectPermissionsByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({ where: { usersId } });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');

    const assignments = await this.prisma.userPermissions.findMany({
      where: { usersId, deletedAt: null, Permissions: { deletedAt: null } },
      orderBy: [
        { Permissions: { resource: 'asc' } },
        { Permissions: { action: 'asc' } },
      ],
      include: {
        Permissions: {
          select: { permissionsId: true, resource: true, action: true },
        },
      },
    });

    return assignments.map((assignment) => ({
      idUserPermissions: assignment.idUserPermissions,
      permissionsId: assignment.permissionsId,
      resource: assignment.Permissions.resource,
      action: assignment.Permissions.action,
      allow: assignment.allow,
    }));
  }

  async assignPermissionToUser(
    usersId: number,
    permissionsId: number,
    allow = true,
  ) {
    return this.assignPermissionUseCase.execute(usersId, permissionsId, allow);
  }

  async revokePermissionFromUser(idUserPermissions: number) {
    return this.revokePermissionUseCase.execute(idUserPermissions);
  }

  async getEffectivePermissions(usersId: number) {
    return this.getEffectivePermissionsUseCase.execute(usersId);
  }
}
