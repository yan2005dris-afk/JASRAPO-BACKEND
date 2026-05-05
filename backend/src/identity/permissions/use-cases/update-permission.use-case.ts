import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, updatePermissionDto: UpdatePermissionDto) {
    return this.prisma.permisos.update({
      where: { permisoId: id },
      data: {
        recurso: updatePermissionDto.resource,
        accion: updatePermissionDto.action,
      },
      select: {
        permisoId: true,
        recurso: true,
        accion: true,
      },
    });
  }
}
