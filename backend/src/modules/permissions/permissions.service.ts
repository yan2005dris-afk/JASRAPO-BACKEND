import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPermissionDto: CreatePermissionDto) {
    return this.prisma.permissions.create({
      data: {
        resource: createPermissionDto.resource,
        action: createPermissionDto.action,
      },
    });
  }

  findAll() {
    return this.prisma.permissions.findMany({
      where: { deletedAt: null },
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      select: {
        permissionsId: true,
        resource: true,
        action: true,
      },
    });
  }

  async findOne(id: number) {
    const permission = await this.prisma.permissions.findUnique({
      where: { permissionsId: id },
      select: {
        permissionsId: true,
        resource: true,
        action: true,
        deletedAt: true,
      },
    });

    if (!permission || permission.deletedAt) {
      throw new NotFoundException('Permiso no encontrado');
    }

    return permission;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permissions.update({
      where: { permissionsId: id },
      data: {
        resource: updatePermissionDto.resource,
        action: updatePermissionDto.action,
      },
      select: {
        permissionsId: true,
        resource: true,
        action: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.permissions.update({
      where: { permissionsId: id },
      data: { deletedAt: new Date() },
      select: {
        permissionsId: true,
        resource: true,
        action: true,
      },
    });
  }
}
