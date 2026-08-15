import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { RoleRepository, RolePermission } from '../../domain/repositories/role.repository';
import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleMapper } from '../mappers/role.mapper';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(rolId: number): Promise<RoleEntity | null> {
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
    return RoleMapper.toEntity(role);
  }

  async findByName(nombre: string): Promise<RoleEntity | null> {
    const role = await this.prisma.roles.findFirst({
      where: { nombre, deletedAt: null },
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
    });
    return RoleMapper.toEntity(role);
  }

  async findFirstAssignment(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermission | null> {
    const assignment = await this.prisma.rolPermisos.findFirst({
      where: { rolId, permisoId },
    });
    return RoleMapper.toAssignment(assignment);
  }

  async findPermission(permisoId: number): Promise<{
    permisoId: number;
    nombre: string;
    deletedAt: Date | null;
  } | null> {
    return this.prisma.permisos.findUnique({
      where: { permisoId },
      select: {
        permisoId: true,
        nombre: true,
        deletedAt: true,
      },
    });
  }

  async findAll(skip?: number, take?: number): Promise<RoleEntity[]> {
    const roles = await this.prisma.roles.findMany({
      where: { deletedAt: null },
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
      skip,
      take,
    });
    return roles.map((role) => RoleMapper.toEntity(role)!);
  }

  async count(params?: { where?: Record<string, any> }): Promise<number> {
    return this.prisma.roles.count({
      where: (params?.where ?? {}) as any,
    });
  }

  async create(nombre: string): Promise<RoleEntity> {
    const role = await this.prisma.roles.create({
      data: { nombre },
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
    });
    return RoleMapper.toEntity(role)!;
  }

  async update(
    rolId: number,
    data: { nombre?: string; deletedAt?: Date | null },
  ): Promise<RoleEntity> {
    const role = await this.prisma.roles.update({
      where: { rolId },
      data,
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
    });
    return RoleMapper.toEntity(role)!;
  }

  async assignPermission(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermission> {
    const assignment = await this.prisma.rolPermisos.create({
      data: { rolId, permisoId },
    });
    return RoleMapper.toAssignment(assignment)!;
  }

  async updateAssignment(
    rolPermisoId: number,
    data: { deletedAt?: Date | null },
  ): Promise<RolePermission> {
    const assignment = await this.prisma.rolPermisos.update({
      where: { rolPermisoId },
      data,
    });
    return RoleMapper.toAssignment(assignment)!;
  }

  /**
   * Why `Prisma.sql` over `$executeRawUnsafe`?
   *
   * `Prisma.sql` is a tagged template that hands every interpolation to Prisma's
   * parameterizer. Even though `sequenceName` currently comes from PG metadata
   * (`pg_get_serial_sequence`) and is not user-controlled, parameterizing it is
   * defense-in-depth: any future caller that lets a user influence the table or
   * column would otherwise expose a SQL injection vector via single-quote
   * doubling. Tagged templates also make the SQL shape obvious to reviewers and
   * tooling.
   */
  async syncSequence(): Promise<void> {
    const sequenceResult = await this.prisma.$queryRaw<
      { seq: string | null }[]
    >`SELECT pg_get_serial_sequence('roles', 'rol_id') AS seq`;
    const sequenceName = sequenceResult[0]?.seq;
    if (!sequenceName) return;
    await this.prisma.$queryRaw(Prisma.sql`
      SELECT setval(
        ${sequenceName},
        COALESCE((SELECT MAX(rol_id) FROM roles), 0) + 1,
        false
      )
    `);
  }
}
