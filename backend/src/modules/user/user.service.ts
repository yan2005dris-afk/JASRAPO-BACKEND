import {
  Injectable,
  NotFoundException,
  ConflictException,
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

const userWithRolesSelect = {
  usersId: true,
  email: true,
  userRoles: {
    where: { deletedAt: null },
    select: {
      roles: {
        select: {
          rolesId: true,
          name: true,
          deletedAt: true,
        },
      },
    },
  },
} satisfies Prisma.UsersSelect;

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica que un valor dado tenga formato de hash bcrypt. Esto es útil para evitar re-hashear contraseñas que ya están hasheadas, por ejemplo al actualizar un usuario.
   * @param value
   * @returns
   */
  private isBcryptHash(value: string): boolean {
    // bcrypt hash format: $2a$10$... (60 chars total)
    return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);
  }

  /**
   * asegura que la contraseña proporcionada esté hasheada. Si ya tiene formato de hash bcrypt, se devuelve tal cual. Si no, se hashea con bcrypt antes de devolver.
   * @param password
   * @returns
   */
  private async ensureHashedPassword(password: string): Promise<string> {
    if (this.isBcryptHash(password)) {
      return password;
    }

    return bcrypt.hash(password, 10);
  }
  /**
   * Encuentra un usuario por su identificador único, devolviendo solo campos seguros (sin password) y sin incluir relaciones.
   * @param userWhereUniqueInput
   * @returns
   */
  async user(userWhereUniqueInput: Prisma.UsersWhereUniqueInput) {
    return this.prisma.users.findUnique({
      where: userWhereUniqueInput,
      select: safeUserSelect,
    });
  }

  /**
   * Encuentra múltiples usuarios según criterios de búsqueda, con soporte para paginación, filtrado y ordenamiento. Devuelve solo campos seguros (sin password) y sin incluir relaciones.
   * @param params
   * @returns
   */
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
      roles: user.userRoles
        .filter((userRole) => userRole.roles && !userRole.roles.deletedAt)
        .map((userRole) => ({
          rolesId: userRole.roles.rolesId,
          name: userRole.roles.name,
        })),
    }));
  }

  /**
   * Crea un nuevo usuario con el email y contraseña proporcionados en el CreateUserDto. Asigna automáticamente el rol 'user' al nuevo usuario. Devuelve los datos del usuario creado sin incluir la contraseña.
   * @param createUsersDto
   * @returns
   */
  async createUser(createUsersDto: CreateUserDto) {
    // Buscar el rol 'user' por nombre
    const userRole = await this.prisma.roles.findFirst({
      where: { name: 'user' },
    });
    if (!userRole) {
      throw new Error('No existe el rol por defecto "user".');
    }

    const safePassword = await this.ensureHashedPassword(
      createUsersDto.password,
    );

    // Crear el usuario
    const newUser = await this.prisma.users.create({
      data: {
        email: createUsersDto.email,
        password: safePassword,
      },
    });

    // Asignar el rol 'user' al usuario recién creado
    await this.prisma.userRoles.create({
      data: {
        usersId: newUser.usersId,
        rolesId: userRole.rolesId,
      },
    });
    return {
      usersId: newUser.usersId,
      email: newUser.email,
    };
  }

  /**
   * Actualiza los datos básicos de un usuario, como email o contraseña. Si se proporciona una nueva contraseña, se hash antes de guardarla en la base de datos. Devuelve los datos actualizados del usuario sin incluir la contraseña.
   * @param params
   * @returns
   */
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

  /**
   * Realiza un borrado lógico (soft delete) de un usuario, estableciendo la fecha de eliminación en el campo deletedAt. No elimina físicamente el registro de la base de datos. Devuelve los datos del usuario actualizado sin incluir la contraseña.
   * @param where
   * @returns
   */
  async softDeleteUser(where: Prisma.UsersWhereUniqueInput) {
    return this.prisma.users.update({
      where,
      data: { deletedAt: new Date() },
      select: safeUserSelect,
    });
  }

  /**
   * Obtiene los roles asignados a un usuario específico, sin incluir información de la relación (users_roles).
   * @param usersId
   * @returns
   */

  async getRolesByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      select: {
        userRoles: {
          select: {
            deletedAt: true,
            roles: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    // Filtra roles nulos Y roles revocados (deletedAt != null)
    return user.userRoles
      .filter((ur) => ur.roles && !ur.deletedAt)
      .map((ur) => ur.roles.name);
  }

  /**
   * Obtiene los roles asignados a un usuario específico, incluyendo información de la relación (users_roles) como el userRolesId, que es necesario para revocar el rol posteriormente.
   * @param usersId
   * @returns
   */
  async getRoleAssignmentsByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({ where: { usersId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario eliminado o no encontrado');
    }

    const assignments = await this.prisma.userRoles.findMany({
      where: {
        usersId,
        deletedAt: null,
        roles: {
          deletedAt: null,
        },
      },
      orderBy: [{ roles: { name: 'asc' } }],
      include: {
        roles: {
          select: {
            rolesId: true,
            name: true,
          },
        },
      },
    });

    return assignments.map((assignment) => ({
      usersRolesId: assignment.usersRolesId,
      rolesId: assignment.rolesId,
      name: assignment.roles.name,
    }));
  }

  /**
   * Asigna un rol nuevo a un usuario existente.
   * Valida que el usuario y el rol existan y que no tenga ya ese rol activo.
   */
  async assignRoleToUser(usersId: number, rolesId: number) {
    const user = await this.prisma.users.findUnique({ where: { usersId } });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');

    const role = await this.prisma.roles.findUnique({ where: { rolesId } });
    if (!role || role.deletedAt)
      throw new NotFoundException('Rol no encontrado o eliminado');

    // Verificar que no tenga ese rol ya asignado y activo
    const existing = await this.prisma.userRoles.findFirst({
      where: { usersId, rolesId, deletedAt: null },
    });
    if (existing)
      throw new ConflictException('El usuario ya tiene ese rol activo');

    return this.prisma.userRoles.create({
      data: { usersId, rolesId },
    });
  }

  /**
   * Revoca (soft delete) un rol asignado a un usuario.
   * Usa el ID de la relación UserRoles, no el ID del rol.
   */
  async revokeRoleFromUser(usersRolesId: number) {
    const userRole = await this.prisma.userRoles.findUnique({
      where: { usersRolesId },
    });
    if (!userRole)
      throw new NotFoundException('Asignación de rol no encontrada');
    if (userRole.deletedAt)
      throw new ConflictException('Este rol ya fue revocado previamente');

    return this.prisma.userRoles.update({
      where: { usersRolesId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Obtiene los permisos asignados directamente a un usuario, sin incluir los permisos heredados a través de roles.
   * @param usersId
   * @returns
   */
  async getDirectPermissionsByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({ where: { usersId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const assignments = await this.prisma.userPermissions.findMany({
      where: {
        usersId,
        deteledAt: null,
        Permissions: {
          deletedAt: null,
        },
      },
      orderBy: [
        { Permissions: { resource: 'asc' } },
        { Permissions: { action: 'asc' } },
      ],
      include: {
        Permissions: {
          select: {
            permissionsId: true,
            resource: true,
            action: true,
          },
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

  /**
   * Asigna un permiso directo a un usuario, sin pasar por un rol.
   * @param usersId
   * @param permissionsId
   * @param allow
   * @returns
   */
  async assignPermissionToUser(
    usersId: number,
    permissionsId: number,
    allow = true,
  ) {
    const user = await this.prisma.users.findUnique({ where: { usersId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    const permission = await this.prisma.permissions.findUnique({
      where: { permissionsId },
    });
    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permiso no encontrado o eliminado');
    }

    const existing = await this.prisma.userPermissions.findFirst({
      where: {
        usersId,
        permissionsId,
        deteledAt: null,
      },
    });

    if (existing) {
      return this.prisma.userPermissions.update({
        where: { idUserPermissions: existing.idUserPermissions },
        data: { allow },
      });
    }

    return this.prisma.userPermissions.create({
      data: {
        usersId,
        permissionsId,
        allow,
      },
    });
  }

  /**
   * Revoca (soft delete) un permiso asignado directamente a un usuario.
   * Usa el ID de la relación userPermissions, no el ID del permiso.
   * @param idUserPermissions
   * @returns
   */
  async revokePermissionFromUser(idUserPermissions: number) {
    const userPermission = await this.prisma.userPermissions.findUnique({
      where: { idUserPermissions },
    });

    if (!userPermission) {
      throw new NotFoundException('Asignacion de permiso no encontrada');
    }

    if (userPermission.deteledAt) {
      throw new ConflictException('Este permiso ya fue revocado previamente');
    }

    return this.prisma.userPermissions.update({
      where: { idUserPermissions },
      data: { deteledAt: new Date() },
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
          where: {
            deletedAt: null,
            roles: {
              deletedAt: null,
            },
          },
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
          where: {
            deteledAt: null,
          },
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
            userPermiso.Permissions &&
            !userPermiso.Permissions.deletedAt &&
            !userPermiso.deteledAt,
        )
        .map((userPermiso) => ({
          resource: userPermiso.Permissions.resource,
          action: userPermiso.Permissions.action,
          allow: userPermiso.allow,
        })) ?? [];

    // Combinar: los userPerms pueden agregar (allow=true) o revocar (allow=false) permisos

    const rolPermissionsSinDuplicados_copy = [...rolPermisoSinDuplicados];
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
