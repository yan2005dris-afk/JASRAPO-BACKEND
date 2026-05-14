import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { RouteEntity } from '../types/route.entity';
import { RouteMapper } from '../types/mappers';

@Injectable()
export class FindOneRouteUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(rutaId: bigint): Promise<RouteEntity> {
    const ruta = await this.prisma.rutas.findUnique({
      where: { rutaId },
    });

    if (!ruta || ruta.deletedAt) {
      throw new NotFoundException('Ruta no encontrada');
    }

    return RouteMapper.toEntity(ruta);
  }
}
