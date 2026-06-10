import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.permisos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        recurso: data.recurso,
        accion: data.accion,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.permisos.findMany({
      where: { deletedAt: null },
      orderBy: [
        { recurso: 'asc' },
        { accion: 'asc' },
      ],
    });
  }

  async findUnique(permisoId: number): Promise<any> {
    return this.prisma.permisos.findUnique({
      where: { permisoId },
    });
  }

  async update(permisoId: number, data: any): Promise<any> {
    return this.prisma.permisos.update({
      where: { permisoId },
      data,
    });
  }
}
