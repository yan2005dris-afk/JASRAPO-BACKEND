import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemovePermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
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
