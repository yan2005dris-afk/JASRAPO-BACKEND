import { Injectable } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { UpdateRubroData, RubroRow } from '../../domain/types/rubro.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateRubroUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(id: number, data: UpdateRubroData): Promise<RubroRow> {
    const existing = await this.rubroRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Rubro', id);
    }
    if (
      data.codigoSri !== undefined &&
      data.codigoSri !== null &&
      data.codigoSri !== existing.codigoSri
    ) {
      const existingWithCode = await this.rubroRepository.findByCodigoSri(
        data.codigoSri,
      );
      if (existingWithCode && existingWithCode.rubroId !== id) {
        throw new EntityAlreadyExistsException(
          'Rubro',
          'codigoSri',
          data.codigoSri,
        );
      }
    }
    return this.rubroRepository.update(id, data);
  }
}
