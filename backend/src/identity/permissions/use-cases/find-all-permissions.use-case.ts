import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FindAllPermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
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
}
