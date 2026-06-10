import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/types/route.entity';
import { RouteMapper } from '../../domain/types/mappers';

@Injectable()
export class FindOneRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(rutaId: bigint): Promise<RouteEntity> {
    const ruta = await this.routeRepository.findUnique({ rutaId });

    if (!ruta || ruta.deletedAt) {
      throw new NotFoundException('Ruta no encontrada');
    }

    return RouteMapper.toEntity(ruta);
  }
}
