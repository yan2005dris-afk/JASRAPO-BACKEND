import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class DeleteRouteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rutaId: bigint): Promise<{ message: string }> {
    const ruta = await this.prisma.rutas.findUnique({
      where: { rutaId },
    });

    if (!ruta || ruta.deletedAt) {
      throw new NotFoundException('Ruta no encontrada');
    }

    await this.prisma.rutas.update({
      where: { rutaId },
      data: { deletedAt: new Date() },
    });

    return { message: 'Ruta eliminada correctamente' };
  }
}
