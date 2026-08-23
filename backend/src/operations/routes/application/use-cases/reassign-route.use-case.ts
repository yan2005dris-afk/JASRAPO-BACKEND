import { Injectable } from '@nestjs/common';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class ReassignRouteUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(
    rutaId: bigint,
    nuevoOperarioId: number | null,
  ): Promise<RouteEntity> {
    // 1. Verify route exists
    const route = await this.routeRepository.findById(rutaId);

    if (!route) {
      throw new EntityNotFoundException('Ruta', rutaId.toString());
    }

    // 2. Si se pasa operario, validar que existe y tiene rol operadores.
    //    Si es null, se desasigna (la ruta queda en bandeja de secretaría).
    if (nuevoOperarioId !== null) {
      const targetOperator = await this.routeRepository.findUsuario(
        nuevoOperarioId,
        { includeRole: true },
      );

      if (!targetOperator) {
        throw new EntityNotFoundException('Operador', nuevoOperarioId);
      }

      if (targetOperator.rol?.nombre !== 'operadores') {
        throw new InvalidDomainOperationException(
          'Solo se pueden asignar operadores',
        );
      }
    }

    // 3. Prevent no-op reassignment
    if (route.operarioId === nuevoOperarioId) {
      throw new InvalidDomainOperationException(
        nuevoOperarioId === null
          ? 'La ruta ya está sin operario asignado'
          : 'La ruta ya está asignada a este operador',
      );
    }

    // 4. Reassign (null = unassign)
    return this.routeRepository.update(rutaId, { operarioId: nuevoOperarioId });
  }
}
