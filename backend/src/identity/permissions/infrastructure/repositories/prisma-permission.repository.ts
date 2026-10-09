import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { permissionInclude, type PermissionRow } from './permission.include';
import type {
  CreatePermissionRepositoryData,
  UpdatePermissionRepositoryData,
} from '../../domain/types/permission.types';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePermissionRepositoryData): Promise<PermissionRow> {
    return this.prisma.permisos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        recurso: data.recurso,
        accion: data.accion,
      },
      include: permissionInclude,
    });
  }

  async findAll(skip?: number, take?: number): Promise<PermissionRow[]> {
    return this.prisma.permisos.findMany({
      where: { deletedAt: null },
      orderBy: [{ recurso: 'asc' }, { accion: 'asc' }],
      skip,
      take,
      include: permissionInclude,
    });
  }

  async count(params?: { where?: Record<string, any> }): Promise<number> {
    return this.prisma.permisos.count({
      where: (params?.where ?? {}) as any,
    });
  }

  async findUnique(permisoId: number): Promise<PermissionRow | null> {
    return this.prisma.permisos.findUnique({
      where: { permisoId },
      include: permissionInclude,
    });
  }

  async update(
    permisoId: number,
    data: UpdatePermissionRepositoryData,
  ): Promise<PermissionRow> {
    return this.prisma.permisos.update({
      where: { permisoId },
      data,
      include: permissionInclude,
    });
  }
}
