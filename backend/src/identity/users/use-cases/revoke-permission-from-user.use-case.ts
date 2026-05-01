import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RevokePermissionFromUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(idUserPermissions: number) {
    const userPermission = await this.prisma.userPermissions.findUnique({
      where: { idUserPermissions },
    });

    if (!userPermission)
      throw new NotFoundException('Asignación de permiso no encontrada');
    if (userPermission.deletedAt)
      throw new ConflictException('Este permiso ya fue revocado previamente');

    return this.prisma.userPermissions.update({
      where: { idUserPermissions },
      data: { deletedAt: new Date() },
    });
  }
}
