import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, updatePermissionDto: UpdatePermissionDto) {
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
}
