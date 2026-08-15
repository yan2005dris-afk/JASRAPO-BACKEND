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

  async execute(rutaId: bigint, nuevoOperarioId: number): Promise<RouteEntity> {
    // 1. Verify route exists
    const route = await this.routeRepository.findById(rutaId);

    if (!route) {
      throw new EntityNotFoundException('Ruta', rutaId.toString());
    }

    // 2. Verify target operator exists and has operator role
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

    // 3. Prevent no-op reassignment
    if (route.operarioId === nuevoOperarioId) {
      throw new InvalidDomainOperationException(
        'La ruta ya está asignada a este operador',
      );
    }

    // 4. Reassign
    return this.routeRepository.update(rutaId, { operarioId: nuevoOperarioId });
  }
}
