import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from '../interfaces/dto/create-user.dto';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import { GetEffectivePermissionsUseCase } from './use-cases/get-effective-permissions.use-case';
import { UpdateUserPermissionsUseCase } from './use-cases/update-user-permissions.use-case';
import { ValidationUtil } from 'src/infrastructure/common/utils/validation.util';
import { PhoneUtil } from 'src/infrastructure/common/utils/phone.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { UserRepository } from '../domain/repositories/user.repository';
import {
  userWithRolesSelect,
  UserWithPermissionsResponse,
  UserWithRoleResponse,
  ProfileResponse,
  EffectivePermissionsResponse,
} from '../domain/types/user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
    private readonly updateUserPermissionsUseCase: UpdateUserPermissionsUseCase,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UsuariosWhereUniqueInput,
  ): Promise<UserWithPermissionsResponse | null> {
    const user = await this.userRepository.findUnique(
      userWhereUniqueInput,
      userWithRolesSelect,
    );

    if (!user || user.deletedAt) return null;

    const [directPermissionRows, rolePermissionRows] = await Promise.all([
      this.userRepository.findDirectPermissions(user.usuarioId),
      user.rol && !user.rol.deletedAt
        ? this.userRepository.findRolePermissions(user.rol.rolId)
        : Promise.resolve([]),
    ]);

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      avatar: user.avatar,
      rol:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
      permisosDirectos: directPermissionRows.map((a) => ({
        usuarioPermisoId: a.usuarioPermisoId,
        permisoId: a.permisoId,
        recurso: a.permiso.recurso,
        accion: a.permiso.accion,
        permitido: a.permitido,
      })),
      permisosRol: rolePermissionRows.map((rp) => ({
        recurso: rp.permiso.recurso,
        accion: rp.permiso.accion,
      })),
    };
  }

  async findMe(usersId: number): Promise<ProfileResponse> {
    const user = await this.userRepository.findUnique(
      { usuarioId: usersId },
      userWithRolesSelect,
    );

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const fullName = [user.nombres, user.apellidos].filter(Boolean).join(' ');
    const avatarObj = user.avatar as { url?: string; key?: string } | null;

    return {
      usuarioId: user.usuarioId,
      email: user.email,
      nombre: fullName || null,
      telefono: user.telefono,
      avatar: avatarObj,
      rol:
        user.rol && !user.rol.deletedAt
          ? { rolId: user.rol.rolId, nombre: user.rol.nombre }
          : null,
    };
  }

  async users(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<UserWithRoleResponse>> {
    const result = await this.userRepository.findManyActive(
      pagination,
      userWithRolesSelect,
    );

    const mappedData = result.data.map((user: any) => ({
      usuarioId: user.usuarioId,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      telefono: user.telefono,
      avatar: user.avatar,
      rol:
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
    const existingUser = await this.userRepository.findUnique(where, {
      usuarioId: true,
      deletedAt: true,
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
      updateData.telefono = PhoneUtil.validateAndClean(
        updateData.telefono as string,
        'telefono',
      );
    }

    // Validar rolId si se proporciona
    if (updateData.rolId !== undefined && updateData.rolId !== null) {
      const role = await this.userRepository.findRoleById(
        updateData.rolId as number,
      );
      if (!role || role.deletedAt) {
        throw new NotFoundException('Rol no encontrado o eliminado');
      }
    }

    try {
      await this.userRepository.executeTransaction(async (tx) => {
        await this.userRepository.update(where, updateData, tx);

        if (directPermissions && Array.isArray(directPermissions)) {
          await this.updateUserPermissionsUseCase.execute(
            existingUser.usuarioId,
            directPermissions as { permisoId: number; permitido?: boolean }[],
            tx,
          );
        }
      });
    } catch (error: any) {
      const target = error?.meta?.target;
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray(target) &&
        target.includes('email')
      ) {
        throw new ConflictException('El correo electrónico ya está en uso');
      }
      throw error;
    }

    return this.user({ usuarioId: existingUser.usuarioId });
  }

  async softDeleteUser(where: Prisma.UsuariosWhereUniqueInput) {
    return this.userRepository.update(where, { deletedAt: new Date() });
  }

  async getEffectivePermissions(
    usuarioId: number,
  ): Promise<EffectivePermissionsResponse> {
    const permissions =
      await this.getEffectivePermissionsUseCase.execute(usuarioId);
    return {
      usuarioId,
      permisos: permissions.map((p) => ({
        recurso: p.recurso,
        accion: p.accion,
      })),
    };
  }
}
