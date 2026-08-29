import { Injectable } from '@nestjs/common';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import { EstadoOrdenTrabajo } from 'src/shared/enums';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import type { UpdateOrdenEstadoData } from '../../domain/types/orden-trabajo.types';

@Injectable()
export class UpdateOrdenEstadoUseCase {
  constructor(
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
  ) {}

  async execute(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
    operarioId?: number,
  ): Promise<OrdenTrabajoEntity> {
    // Validate estado is valid (defense in depth — DTO @IsEnum should catch first)
    const validEstados = Object.values(EstadoOrdenTrabajo);
    if (!validEstados.includes(data.estado as EstadoOrdenTrabajo)) {
      throw new InvalidDomainOperationException(
        `Estado inválido: ${data.estado}`,
      );
    }

    if (operarioId !== undefined) {
      await this.ordenTrabajoRepository.verifyOperatorWorkOrderOwnership(
        operarioId,
        ordenTrabajoId,
      );
    }

    return this.ordenTrabajoRepository.updateEstado(ordenTrabajoId, data);
  }
}
