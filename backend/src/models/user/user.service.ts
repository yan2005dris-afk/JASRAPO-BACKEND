import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CreateUserDto } from './dto/create-user.dto';

// Campos seguros para devolver en respuestas (sin password)
const safeUserSelect = {
  usersId: true,
  email: true,
} satisfies Prisma.UsersSelect;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.users.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: safeUserSelect,
    });
  }

  async createUser(createUsersDto: CreateUserDto) {
    // Buscar el rol 'user' por nombre
    const userRole = await this.prisma.roles.findFirst({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new Error('No existe el rol por defecto "user".');
    }

    // Crear el usuario
    const newUser = await this.prisma.users.create({
      data: {
        email: createUsersDto.email,
        password: createUsersDto.password,
      },
    });

    // Asignar el rol 'user' al usuario recién creado
    await this.prisma.userRoles.create({
      data: {
        usersId: newUser.usersId,
        rolesId: userRole.rolesId,
      },
    });

    // Retornar el usuario seguro
    return {
      usersId: newUser.usersId,
      email: newUser.email,
    };
  }

  async updateUser(params: {
    where: Prisma.UsersWhereUniqueInput;
    data: Prisma.UsersUpdateInput;
  }) {
    const updateData = { ...params.data };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password as string,
        10,
      );
    }
    return this.prisma.users.update({
      where: params.where,
      data: updateData,
      select: safeUserSelect,
    });
  }

  async updateUserRole(params: {
    usersRolesId: number;
    rolesId: number;
    deletedAt?: Date;
  }) {
    return this.prisma.userRoles.update({
      where: { usersRolesId: params.usersRolesId },
      data: {
        rolesId: params.rolesId,
        deletedAt: params.deletedAt ?? undefined,
      },
    });
  }

  async deleteUser(where: Prisma.UsersWhereUniqueInput) {
    return this.prisma.users.delete({
      where,
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

  /**
   * Obtiene los permisos efectivos de un usuario combinando roles y user_permissions
   */
  async getEffectivePermissions(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      include: {
        userRoles: {
          include: {
            roles: {
              include: {
                rolPermissions: {
                  include: {
                    permissions: true,
                  },
                },
              },
            },
          },
        },
        userPermissions: {
          include: {
            Permissions: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('usuario elimiando o no encontrado');
    }
    // Permisos por roles
    const rolPermissions =
      user?.userRoles
        .flatMap((userRol) => userRol.roles.rolPermissions)
        .filter(
          (rolPermiso) =>
            rolPermiso.permissions && !rolPermiso.permissions.deletedAt,
        )
        .map((rolPermiso) => ({
          resource: rolPermiso.permissions.resource,
          action: rolPermiso.permissions.action,
        })) ?? [];

    //Permisos sin duplicados
    const rolPermisoSinDuplicados = rolPermissions.reduce(
      (acum, permiso) => {
        const existePermiso = acum.some(
          (permisoAcumulador) =>
            permisoAcumulador.resource === permiso.resource &&
            permisoAcumulador.action === permiso.action,
        );
        if (!existePermiso) {
          acum.push(permiso);
        }
        return acum;
      },
      [] as { resource: string; action: string }[],
    );

    // Permisos por usuario.
    const userPermissions =
      user?.userPermissions
        .filter(
          (userPermiso) =>
            userPermiso.Permissions && !userPermiso.Permissions.deletedAt,
        )
        .map((userPermiso) => ({
          resource: userPermiso.Permissions.resource,
          action: userPermiso.Permissions.action,
          allow: userPermiso.allow,
        })) ?? [];

    // Combinar: los userPerms pueden agregar (allow=true) o revocar (allow=false) permisos

    let rolPermissionsSinDuplicados_copy = [...rolPermisoSinDuplicados];
    for (const userPerm of userPermissions) {
      const index = rolPermissionsSinDuplicados_copy.findIndex(
        (permiso) =>
          userPerm.action === permiso.action &&
          userPerm.resource === permiso.resource,
      );

      if (userPerm.allow) {
        if (index === -1) {
          rolPermissionsSinDuplicados_copy.push({
            resource: userPerm.resource,
            action: userPerm.action,
          });
        }
      } else {
        if (index !== -1) {
          rolPermissionsSinDuplicados_copy.splice(index, 1);
        }
      }
    }

    return rolPermissionsSinDuplicados_copy;
  }
}
