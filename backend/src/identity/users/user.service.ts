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
  usuarioId: true,
  email: true,
} satisfies Prisma.UsuariosSelect;

const userWithRolesSelect = {
  usuarioId: true,
  email: true,
  rol: {
    select: {
      rolId: true,
      nombre: true,
      deletedAt: true,
    },
  },
} satisfies Prisma.UsuariosSelect;

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

  async user(userWhereUniqueInput: Prisma.UsuariosWhereUniqueInput) {
    return this.prisma.usuarios.findUnique({
      where: userWhereUniqueInput,
      select: safeUserSelect,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UsuariosWhereUniqueInput;
    where?: Prisma.UsuariosWhereInput;
    orderBy?: Prisma.UsuariosOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    const users = await this.prisma.usuarios.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      select: userWithRolesSelect,
    });

    return users.map((user) => ({
      usuarioId: user.usuarioId,
      email: user.email,
      roles:
        user.rol && !user.rol.deletedAt
          ? [{ rolId: user.rol.rolId, nombre: user.rol.nombre }]
          : [],
    }));
  }

  async createUser(createUsersDto: CreateUserDto) {
    return this.createUserUseCase.execute(createUsersDto);
  }

  async updateUser(params: {
    where: Prisma.UsuariosWhereUniqueInput;
    data: Prisma.UsuariosUpdateInput;
  }) {
    const updateData = { ...params.data };
    if (updateData.clave) {
      updateData.clave = await this.ensureHashedPassword(
        updateData.clave as string,
      );
    }
    return this.prisma.usuarios.update({
      where: params.where,
      data: updateData,
      select: safeUserSelect,
    });
  }

  async softDeleteUser(where: Prisma.UsuariosWhereUniqueInput) {
    return this.prisma.usuarios.update({
      where,
      data: { deletedAt: new Date() },
      select: safeUserSelect,
    });
  }

  async getRolesByUserId(usuarioId: number) {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
      select: { rol: { select: { nombre: true, deletedAt: true } } },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (!user.rol || user.rol.deletedAt) return null;
    return user.rol.nombre;
  }

  async getRoleAssignmentsByUserId(usuarioId: number) {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
      select: {
        usuarioId: true,
        deletedAt: true,
        rolId: true,
        rol: { select: { rolId: true, nombre: true, deletedAt: true } },
      },
    });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario eliminado o no encontrado');
    if (!user.rol || user.rol.deletedAt || !user.rolId) return [];
    return [
      { usuarioId: user.usuarioId, rolId: user.rolId, nombre: user.rol.nombre },
    ];
  }

  async assignRoleToUser(usuarioId: number, rolId: number) {
    return this.assignRoleUseCase.execute(usuarioId, rolId);
  }

  async revokeRoleFromUser(usuarioId: number) {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
      select: { usuarioId: true, deletedAt: true, rolId: true },
    });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');
    if (!user.rolId)
      throw new ConflictException('El usuario ya no tiene rol asignado');
    return this.prisma.usuarios.update({
      where: { usuarioId },
      data: { rolId: null },
    });
  }

  async getDirectPermissionsByUserId(usuarioId: number) {
    const user = await this.prisma.usuarios.findUnique({
      where: { usuarioId },
    });
    if (!user || user.deletedAt)
      throw new NotFoundException('Usuario no encontrado o eliminado');

    const assignments = await this.prisma.usuarioPermisos.findMany({
      where: { usuarioId, deletedAt: null, permiso: { deletedAt: null } },
      orderBy: [
        { permiso: { recurso: 'asc' } },
        { permiso: { accion: 'asc' } },
      ],
      include: {
        permiso: {
          select: { permisoId: true, recurso: true, accion: true },
        },
      },
    });

    return assignments.map((assignment) => ({
      usuarioPermisoId: assignment.usuarioPermisoId,
      permisoId: assignment.permisoId,
      recurso: assignment.permiso.recurso,
      accion: assignment.permiso.accion,
      permitido: assignment.permitido,
    }));
  }

  async assignPermissionToUser(
    usuarioId: number,
    permisoId: number,
    permitido = true,
  ) {
    return this.assignPermissionUseCase.execute(
      usuarioId,
      permisoId,
      permitido,
    );
  }

  async revokePermissionFromUser(usuarioPermisoId: number) {
    return this.revokePermissionUseCase.execute(usuarioPermisoId);
  }

  async getEffectivePermissions(usuarioId: number) {
    return this.getEffectivePermissionsUseCase.execute(usuarioId);
  }
}
