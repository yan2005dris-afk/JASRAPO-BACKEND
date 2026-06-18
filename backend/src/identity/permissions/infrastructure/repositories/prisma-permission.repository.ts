import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  PermissionRepository,
  CreatePermissionRepositoryData,
  UpdatePermissionRepositoryData,
  PermissionEntity,
} from '../../domain/repositories/permission.repository';
import { PermissionMapper } from '../mappers/permission.mapper';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreatePermissionRepositoryData,
  ): Promise<PermissionEntity> {
    const raw = await this.prisma.permisos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        recurso: data.recurso,
        accion: data.accion,
      },
    });
    return PermissionMapper.toEntity(raw)!;
  }

  async findAll(skip?: number, take?: number): Promise<PermissionEntity[]> {
    const permissions = await this.prisma.permisos.findMany({
      where: { deletedAt: null },
      orderBy: [{ recurso: 'asc' }, { accion: 'asc' }],
      skip,
      take,
    });
    return permissions.map((p) => PermissionMapper.toEntity(p)!);
  }

  async count(params?: { where?: Record<string, any> }): Promise<number> {
    return this.prisma.permisos.count({
      where: (params?.where ?? {}) as any,
    });
  }

  async findUnique(permisoId: number): Promise<PermissionEntity | null> {
    const permission = await this.prisma.permisos.findUnique({
      where: { permisoId },
    });
    return PermissionMapper.toEntity(permission);
  }

  async update(
    permisoId: number,
    data: UpdatePermissionRepositoryData,
  ): Promise<PermissionEntity> {
    const permission = await this.prisma.permisos.update({
      where: { permisoId },
      data,
    });
    return PermissionMapper.toEntity(permission)!;
  }
}
