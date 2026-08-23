import { Injectable } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { RubroEntity } from '../../domain/entities/rubro.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class DeleteRubroUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(id: number): Promise<RubroEntity> {
    const existing = await this.rubroRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Rubro', id);
    }

    const references =
      await this.rubroRepository.countPrefacturaDetalleReferences(id);
    if (references > 0) {
      throw new InvalidDomainOperationException(
        `No se puede eliminar el rubro porque está referenciado en ${references} detalles de prefactura/facturación. Puede desactivarlo en su lugar.`,
      );
    }

    return this.rubroRepository.delete(id);
  }
}
