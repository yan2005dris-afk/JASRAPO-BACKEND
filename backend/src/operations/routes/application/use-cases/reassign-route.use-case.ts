import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import { RouteMapper } from '../../infrastructure/mappers/route.mapper';

@Injectable()
export class ReassignRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(rutaId: bigint, nuevoOperarioId: number): Promise<RouteEntity> {
    // 1. Verify route exists
    const route = await this.routeRepository.findUnique({ rutaId });

    if (!route) {
      throw new NotFoundException(`Ruta con ID ${rutaId} no encontrada`);
    }

    // 2. Verify target operator exists and has operator role
    const targetOperator = await this.routeRepository.findUsuario(
      { usuarioId: nuevoOperarioId },
      { include: { rol: true } },
    );

    if (!targetOperator) {
      throw new NotFoundException(
        `Operador con ID ${nuevoOperarioId} no encontrado`,
      );
    }

    if (targetOperator.rol?.nombre !== 'operadores') {
      throw new BadRequestException('Solo se pueden asignar operadores');
    }

    // 3. Prevent no-op reassignment
    if (route.operarioId === nuevoOperarioId) {
      throw new ForbiddenException('La ruta ya está asignada a este operador');
    }

    // 4. Reassign
    const updated = await this.routeRepository.update(
      { rutaId },
      { operarioId: nuevoOperarioId },
    );

    return RouteMapper.toEntity(updated);
  }
}
