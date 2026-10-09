import { Injectable } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { RubroRow } from '../../domain/types/rubro.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneRubroUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(id: number): Promise<RubroRow> {
    const rubro = await this.rubroRepository.findById(id);
    if (!rubro) {
      throw new EntityNotFoundException('Rubro', id);
    }
    return rubro;
  }
}
