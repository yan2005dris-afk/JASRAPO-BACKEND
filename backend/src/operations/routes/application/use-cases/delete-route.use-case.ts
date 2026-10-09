import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import type { RouteRow } from '../../infrastructure/repositories/route.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class DeleteRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(rutaId: bigint): Promise<RouteRow> {
    const ruta = await this.routeRepository.findById(rutaId);

    if (!ruta) {
      throw new EntityNotFoundException('Ruta', rutaId.toString());
    }

    return this.routeRepository.softDelete(rutaId);
  }
}
