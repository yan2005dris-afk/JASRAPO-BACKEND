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
      roles: user.role && !user.role.deletedAt
        ? [
            {
              rolesId: user.role.rolesId,
              name: user.role.name,
            },
          ]
        : [],
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
        rolesId: userRole.rolesId,
      },
    });

    // Auto-crear perfil vacío asociado al usuario
    await this.prisma.profiles.create({
      data: { usersId: newUser.usersId },
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
      updateData.password = await this.ensureHashedPassword(updateData.password as string);
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
   * Obtiene el rol asignado a un usuario específico.
   * @param usersId
   * @returns
   */

  async getRolesByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      select: {
        role: {
          select: {
            name: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (!user.role || user.role.deletedAt) {
      return [];
    }

    return [user.role.name];
  }

  /**
   * Obtiene la asignacion de rol actual de un usuario.
   * @param usersId
   * @returns
   */
  async getRoleAssignmentsByUserId(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      select: {
        usersId: true,
        deletedAt: true,
        rolesId: true,
        role: {
          select: {
            rolesId: true,
            name: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario eliminado o no encontrado');
    }

    if (!user.role || user.role.deletedAt || !user.rolesId) {
      return [];
    }

    return [
      {
        usersId: user.usersId,
        rolesId: user.rolesId,
        name: user.role.name,
      },
    ];
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

    if (user.rolesId === rolesId)
      throw new ConflictException('El usuario ya tiene ese rol activo');

    return this.prisma.users.update({
      where: { usersId },
      data: { rolesId },
    });
  }

  /**
   * Quita el rol actual de un usuario (deja role_id en null).
   */
  async revokeRoleFromUser(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      select: { usersId: true, deletedAt: true, rolesId: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    if (!user.rolesId) {
      throw new ConflictException('El usuario ya no tiene rol asignado');
    }

    return this.prisma.users.update({
      where: { usersId },
      data: { rolesId: null },
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
        deletedAt: null,
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
        deletedAt: null,
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

    if (userPermission.deletedAt) {
      throw new ConflictException('Este permiso ya fue revocado previamente');
    }

    return this.prisma.userPermissions.update({
      where: { idUserPermissions },
      data: { deletedAt: new Date() },
    });
  }
  /**
   * Obtiene los permisos efectivos de un usuario combinando roles y user_permissions
   */
  async getEffectivePermissions(usersId: number) {
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      include: {
        role: {
          select: {
            rolesId: true,
            deletedAt: true,
          },
        },
        userPermissions: {
          where: {
            deletedAt: null,
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

    const directRoleIds =
      user.role && !user.role.deletedAt ? [user.role.rolesId] : [];
    const allRoleIds = await this.resolveRoleHierarchy(directRoleIds);

    const rolePermissionAssignments =
      allRoleIds.length === 0
        ? []
        : await this.prisma.rolPermissions.findMany({
            where: {
              deletedAt: null,
              rolesId: { in: allRoleIds },
              permissions: {
                deletedAt: null,
              },
            },
            include: {
              permissions: {
                select: {
                  resource: true,
                  action: true,
                },
              },
            },
          });

    // Permisos heredados de roles (directos + hijos)
    const rolPermissions = rolePermissionAssignments.map((rolPermiso) => ({
      resource: rolPermiso.permissions.resource,
      action: rolPermiso.permissions.action,
    }));

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
            !userPermiso.deletedAt,
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

  private async resolveRoleHierarchy(initialRoleIds: number[]): Promise<number[]> {
    if (initialRoleIds.length === 0) {
      return [];
    }

    const edges = await this.prisma.rolesHeredados.findMany({
      where: {
        deletedAt: null,
        parentRole: {
          deletedAt: null,
        },
        childRole: {
          deletedAt: null,
        },
      },
      select: {
        parentRoleId: true,
        childRoleId: true,
      },
    });

    const childrenByParent = new Map<number, number[]>();
    for (const edge of edges) {
      const current = childrenByParent.get(edge.parentRoleId) ?? [];
      current.push(edge.childRoleId);
      childrenByParent.set(edge.parentRoleId, current);
    }

    const visited = new Set<number>();
    const stack = [...initialRoleIds];

    while (stack.length > 0) {
      const roleId = stack.pop()!;
      if (visited.has(roleId)) {
        continue;
      }

      visited.add(roleId);

      const children = childrenByParent.get(roleId) ?? [];
      for (const childId of children) {
        if (!visited.has(childId)) {
          stack.push(childId);
        }
      }
    }

    return Array.from(visited);
  }
}
