import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FindOnePermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
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
}
