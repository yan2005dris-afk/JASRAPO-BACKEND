import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class DeleteRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(rutaId: bigint): Promise<RouteEntity> {
    const ruta = await this.routeRepository.findById(rutaId);

    if (!ruta) {
      throw new EntityNotFoundException('Ruta', rutaId.toString());
    }

    return this.routeRepository.softDelete(rutaId);
  }
}
