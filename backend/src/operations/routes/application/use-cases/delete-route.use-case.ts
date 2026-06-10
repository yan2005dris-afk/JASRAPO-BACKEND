import { Injectable, NotFoundException } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';

@Injectable()
export class DeleteRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(rutaId: bigint): Promise<{ message: string }> {
    const ruta = await this.routeRepository.findUnique({ rutaId });

    if (!ruta || ruta.deletedAt) {
      throw new NotFoundException('Ruta no encontrada');
    }

    await this.routeRepository.update({ rutaId }, { deletedAt: new Date() });

    return { message: 'Ruta eliminada correctamente' };
  }
}
