import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { GetUserDirectPermissionsUseCase } from './use-cases/get-user-direct-permissions.use-case';
import { GetUserRolePermissionsUseCase } from './use-cases/get-user-role-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './use-cases/update-user-permissions.use-case';
import { paginate } from 'src/infrastructure/common/util/pagination.util';
import { ValidationUtil } from 'src/infrastructure/common/util/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/util/phone.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import {
  safeUserSelect,
  userWithRolesSelect,
  UserWithPermissionsResponse,
  UserWithRoleResponse,
  ProfileResponse,
  EffectivePermissionsResponse,
} from './types/user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
    private readonly getUserDirectPermissionsUseCase: GetUserDirectPermissionsUseCase,
    private readonly getUserRolePermissionsUseCase: GetUserRolePermissionsUseCase,
    private readonly updateUserPermissionsUseCase: UpdateUserPermissionsUseCase,
  ) {}

  private isBcryptHash(value: string): boolean {
    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
  }

  private async ensureHashedPassword(password: string): Promise<string> {
    if (this.isBcryptHash(password)) return password;
    return bcrypt.hash(password, 10);
  }

  async user(
    userWhereUniqueInput: Prisma.UsuariosWhereUniqueInput,
  ): Promise<UserWithPermissionsResponse | null> {
    const user = await this.prisma.usuarios.findUnique({
      where: userWhereUniqueInput,
      select: userWithRolesSelect,
    });

    if (!user) return null;

    // Verificar si el usuario está eliminado
    if (user.deletedAt) {
      return null; // O lanzar excepción según el caso de uso
    }

    const [directPermissions, rolePermissions] = await Promise.all([
      this.getUserDirectPermissionsUseCase.execute(user.usuarioId),
      this.getUserRolePermissionsUseCase.execute(user.usuarioId),
    ]);

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      avatar: user.avatar,
      role:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
      directPermissions,
      rolePermissions: rolePermissions.map((rp) => ({
        resource: rp.recurso,
        action: rp.accion,
      })),
    };
  }

  async findMe(usersId: number): Promise<ProfileResponse> {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId: usersId },
      select: userWithRolesSelect,
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const fullName = [user.nombres, user.apellidos].filter(Boolean).join(' ');
    const avatarObj = user.avatar as { url?: string; key?: string } | null;

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      name: fullName || null,
      phone: user.telefono,
      avatar: avatarObj,
      role:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
    };
  }

  async users(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<UserWithRoleResponse>> {
    const result = await paginate(
      this.prisma.usuarios,
      {
        select: userWithRolesSelect,
        where: { deletedAt: null },
        orderBy: { usuarioId: 'asc' },
      },
      {
        page: pagination.page,
        limit: pagination.limit,
      },
    );

    const mappedData = result.data.map((user: any) => ({
      usuarioId: user.usuarioId,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      avatar: user.avatar,
      role:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
    }));

    return {
      data: mappedData,
      meta: result.meta,
    };
  }

  async createUser(createUsersDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUsersDto);
  }

  async updateUser(params: {
    where: Prisma.UsuariosWhereUniqueInput;
    data: Prisma.UsuariosUncheckedUpdateInput & {
      directPermissions?: unknown[];
    };
  }): Promise<UserWithPermissionsResponse | null> {
    const { where, data } = params;
    const { directPermissions, ...userData } = data;
    const updateData = { ...userData };

    // Verificar que el usuario no esté eliminado
    const existingUser = await this.prisma.usuarios.findUnique({
      where,
      select: { usuarioId: true, deletedAt: true },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (existingUser.deletedAt) {
      throw new BadRequestException(
        'No se puede modificar un usuario eliminado',
      );
    }

    // Validar campos que no pueden estar vacíos
    if (updateData.nombres !== undefined) {
      ValidationUtil.requireNonEmpty(updateData.nombres as string, 'nombres');
    }
    if (updateData.apellidos !== undefined) {
      ValidationUtil.requireNonEmpty(
        updateData.apellidos as string,
        'apellidos',
      );
    }
    if (updateData.email !== undefined) {
      ValidationUtil.requireNonEmpty(updateData.email as string, 'email');
    }
    if (updateData.telefono !== undefined) {
      ValidationUtil.requireNonEmpty(updateData.telefono as string, 'telefono');
      PhoneUtil.validateEcuadorian(updateData.telefono as string, 'telefono');
    }

    if (updateData.clave && typeof updateData.clave === 'string') {
      updateData.clave = await this.ensureHashedPassword(updateData.clave);
    }

    const updatedUser = await this.prisma.usuarios.update({
      where,
      data: updateData,
      select: { usuarioId: true },
    });

    if (directPermissions && Array.isArray(directPermissions)) {
      await this.updateUserPermissionsUseCase.execute(
        updatedUser.usuarioId,
        directPermissions as { permisoId: number; permitido?: boolean }[],
      );
    }

    return this.user({ usuarioId: updatedUser.usuarioId });
  }

  async softDeleteUser(where: Prisma.UsuariosWhereUniqueInput) {
    return this.prisma.usuarios.update({
      where,
      data: { deletedAt: new Date() },
      select: safeUserSelect,
    });
  }

  async getEffectivePermissions(
    usuarioId: number,
  ): Promise<EffectivePermissionsResponse> {
    const permissions =
      await this.getEffectivePermissionsUseCase.execute(usuarioId);
    return {
      usuarioId,
      permissions: permissions.map((p) => ({
        resource: p.resource,
        action: p.action,
      })),
    };
  }
}
