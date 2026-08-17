import { Injectable, NotFoundException } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { RubroEntity } from '../../domain/entities/rubro.entity';

@Injectable()
export class FindOneRubroUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(id: number): Promise<RubroEntity> {
    const rubro = await this.rubroRepository.findById(id);
    if (!rubro) {
      throw new NotFoundException(`Rubro con ID ${id} no encontrado`);
    }
    return rubro;
  }
}
