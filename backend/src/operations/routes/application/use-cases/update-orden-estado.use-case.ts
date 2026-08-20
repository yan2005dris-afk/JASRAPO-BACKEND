import { Injectable } from '@nestjs/common';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import { EstadoOrdenTrabajo } from 'src/shared/enums';
import type { UpdateOrdenEstadoData } from '../../domain/types/orden-trabajo.types';

@Injectable()
export class UpdateOrdenEstadoUseCase {
  constructor(private readonly ordenTrabajoRepository: OrdenTrabajoRepository) {}

  async execute(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
  ): Promise<OrdenTrabajoEntity> {
    // Validate estado is valid
    const validEstados = Object.values(EstadoOrdenTrabajo);
    if (!validEstados.includes(data.estado as EstadoOrdenTrabajo)) {
      throw new Error(`Estado inválido: ${data.estado}`);
    }

    return this.ordenTrabajoRepository.updateEstado(ordenTrabajoId, data);
  }
}
