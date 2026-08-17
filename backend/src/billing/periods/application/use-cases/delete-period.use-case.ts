import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type { PeriodEntity } from '../../domain/entities/period.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class DeletePeriodUseCase {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async execute(id: number): Promise<PeriodEntity> {
    const existing = await this.periodRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Periodo', id);
    }

    const counts = await this.periodRepository.countRelations(id);
    const associated: string[] = [];

    if (counts.lecturas > 0) {
      associated.push(`${counts.lecturas} lectura(s)`);
    }
    if (counts.prefacturas > 0) {
      associated.push(`${counts.prefacturas} prefactura(s)`);
    }
    if (counts.lotes > 0) {
      associated.push(`${counts.lotes} lote(s)`);
    }
    if (counts.rutas > 0) {
      associated.push(`${counts.rutas} ruta(s)`);
    }

    if (associated.length > 0) {
      throw new InvalidDomainOperationException(
        `No se puede eliminar el periodo '${existing.nombre}' porque tiene registros asociados: ${associated.join(', ')}`,
      );
    }

    return this.periodRepository.delete(id);
  }
}
