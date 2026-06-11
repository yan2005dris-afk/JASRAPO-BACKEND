import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  RoleRepository,
  RoleWithPermissions,
  SimpleRole,
  RolePermissionAssignment,
} from '../../domain/repositories/role.repository';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(rolId: number): Promise<RoleWithPermissions | null> {
    const role = await this.prisma.roles.findUnique({
      where: { rolId },
      include: {
        rolPermisos: {
          where: { deletedAt: null },
          include: {
            permiso: {
              select: {
                permisoId: true,
                nombre: true,
                descripcion: true,
                recurso: true,
                accion: true,
              },
            },
          },
          orderBy: [
            { permiso: { recurso: 'asc' } },
            { permiso: { accion: 'asc' } },
          ],
        },
      },
    });
    return RoleMapper.toWithPermissions(role);
  }

  async findFirstAssignment(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermissionAssignment | null> {
    const assignment = await this.prisma.rolPermisos.findFirst({
      where: { rolId, permisoId },
    });
    return RoleMapper.toAssignment(assignment);
  }

  async findPermission(
    permisoId: number,
  ): Promise<{ permisoId: number; nombre: string; deletedAt: Date | null } | null> {
    return this.prisma.permisos.findUnique({
      where: { permisoId },
      select: {
        permisoId: true,
        nombre: true,
        deletedAt: true,
      },
    });
  }

  async findAll(): Promise<SimpleRole[]> {
    const roles = await this.prisma.roles.findMany({
      where: { deletedAt: null },
      select: {
        rolId: true,
        nombre: true,
      },
    });
    return roles.map((role) => RoleMapper.toSimple(role)!);
  }

  async create(nombre: string): Promise<SimpleRole> {
    const role = await this.prisma.roles.create({
      data: { nombre },
      select: {
        rolId: true,
        nombre: true,
      },
    });
    return RoleMapper.toSimple(role)!;
  }

  async update(
    rolId: number,
    data: { nombre?: string; deletedAt?: Date | null },
  ): Promise<SimpleRole> {
    const role = await this.prisma.roles.update({
      where: { rolId },
      data,
      select: {
        rolId: true,
        nombre: true,
      },
    });
    return RoleMapper.toSimple(role)!;
  }

  async assignPermission(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermissionAssignment> {
    const assignment = await this.prisma.rolPermisos.create({
      data: { rolId, permisoId },
    });
    return RoleMapper.toAssignment(assignment)!;
  }

  async updateAssignment(
    rolPermisoId: number,
    data: { deletedAt?: Date | null },
  ): Promise<RolePermissionAssignment> {
    const assignment = await this.prisma.rolPermisos.update({
      where: { rolPermisoId },
      data,
    });
    return RoleMapper.toAssignment(assignment)!;
  }

  async syncSequence(): Promise<void> {
    const sequenceResult = await this.prisma.$queryRaw<
      { seq: string | null }[]
    >`SELECT pg_get_serial_sequence('roles', 'rol_id') AS seq`;
    const sequenceName = sequenceResult[0]?.seq;
    if (!sequenceName) return;
    const escapedSequenceName = sequenceName.replace(/'/g, "''");
    await this.prisma.$executeRawUnsafe(
      `SELECT setval('${escapedSequenceName}', COALESCE((SELECT MAX(rol_id) FROM roles), 0) + 1, false)`,
    );
  }
}
