import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../../generated/prisma/client.js';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { roleInclude, type RoleRow } from './role.include';
import type { UpdateRoleRepositoryData } from '../../domain/types/role.types';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(rolId: number): Promise<RoleRow | null> {
    return this.prisma.roles.findUnique({
      where: { rolId },
      include: roleInclude,
    });
  }

  async findByName(nombre: string): Promise<RoleRow | null> {
    // Usamos `select` minimo aqui porque el listado no expone permisos
    // individuales. Tipamos el resultado como `RoleRow | null` aunque
    // `rolPermisos` quede como `[]` en runtime (TypeScript no puede
    // inferir el shape reducido de un include parcial).
    return (await this.prisma.roles.findFirst({
      where: { nombre, deletedAt: null },
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
    })) as RoleRow | null;
  }

  async findFirstAssignment(
    rolId: number,
    permisoId: number,
  ): Promise<RoleRow['rolPermisos'][number] | null> {
    // Cast: Prisma retorna el row sin la relation `permiso` porque
    // el `findFirst` no la incluye. El tipo `RolPermisoRow` la incluye
    // (viene de `RoleRow`), pero en runtime es undefined. El consumidor
    // (use case) no accede a `permiso` aqui.
    return this.prisma.rolPermisos.findFirst({
      where: { rolId, permisoId },
    }) as unknown as Promise<RoleRow['rolPermisos'][number] | null>;
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

  async findAll(skip?: number, take?: number): Promise<RoleRow[]> {
    return (await this.prisma.roles.findMany({
      where: { deletedAt: null },
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
      skip,
      take,
    })) as unknown as RoleRow[];
  }

  async count(params?: { where?: Record<string, any> }): Promise<number> {
    return this.prisma.roles.count({
      where: (params?.where ?? {}) as any,
    });
  }

  async create(nombre: string): Promise<RoleRow> {
    return (await this.prisma.roles.create({
      data: { nombre },
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
    })) as unknown as RoleRow;
  }

  async update(
    rolId: number,
    data: UpdateRoleRepositoryData,
  ): Promise<RoleRow> {
    return (await this.prisma.roles.update({
      where: { rolId },
      data,
      select: {
        rolId: true,
        nombre: true,
        deletedAt: true,
      },
    })) as unknown as RoleRow;
  }

  async assignPermission(
    rolId: number,
    permisoId: number,
  ): Promise<RoleRow['rolPermisos'][number]> {
    return this.prisma.rolPermisos.create({
      data: { rolId, permisoId },
    }) as unknown as RoleRow['rolPermisos'][number];
  }

  async updateAssignment(
    rolPermisoId: number,
    data: { deletedAt?: Date | null },
  ): Promise<RoleRow['rolPermisos'][number]> {
    return this.prisma.rolPermisos.update({
      where: { rolPermisoId },
      data,
    }) as unknown as RoleRow['rolPermisos'][number];
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
