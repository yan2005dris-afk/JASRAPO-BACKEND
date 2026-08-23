import { Injectable } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { RubroEntity } from '../../domain/entities/rubro.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneRubroUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(id: number): Promise<RubroEntity> {
    const rubro = await this.rubroRepository.findById(id);
    if (!rubro) {
      throw new EntityNotFoundException('Rubro', id);
    }
    return rubro;
  }
}
