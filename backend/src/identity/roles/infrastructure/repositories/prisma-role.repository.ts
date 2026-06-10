import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { RoleRepository } from '../../domain/repositories/role.repository';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(rolId: number): Promise<any> {
    return this.prisma.roles.findUnique({
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
  }

  async findFirstAssignment(rolId: number, permisoId: number): Promise<any> {
    return this.prisma.rolPermisos.findFirst({
      where: { rolId, permisoId },
    });
  }

  async findPermission(permisoId: number): Promise<any> {
    return this.prisma.permisos.findUnique({
      where: { permisoId },
    });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.roles.findMany({
      where: { deletedAt: null },
      select: {
        rolId: true,
        nombre: true,
      },
    });
  }

  async create(nombre: string): Promise<any> {
    return this.prisma.roles.create({
      data: { nombre },
    });
  }

  async update(rolId: number, data: any): Promise<any> {
    return this.prisma.roles.update({
      where: { rolId },
      data,
    });
  }

  async assignPermission(rolId: number, permisoId: number): Promise<any> {
    return this.prisma.rolPermisos.create({
      data: { rolId, permisoId },
    });
  }

  async updateAssignment(rolPermisoId: number, data: any): Promise<any> {
    return this.prisma.rolPermisos.update({
      where: { rolPermisoId },
      data,
    });
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
