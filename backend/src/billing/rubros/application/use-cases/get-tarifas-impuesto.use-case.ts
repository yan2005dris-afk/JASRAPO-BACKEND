import { Injectable } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { TarifaImpuestoInfo } from '../../domain/types/rubro.types';

@Injectable()
export class GetTarifasImpuestoUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(): Promise<TarifaImpuestoInfo[]> {
    return this.rubroRepository.findTarifasImpuesto();
  }
}
