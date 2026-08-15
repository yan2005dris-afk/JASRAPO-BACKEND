import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class RemoveTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(id: number): Promise<TariffCategoryEntity> {
    const current = await this.tariffRepository.findById(id);

    if (!current) {
      throw new EntityNotFoundException('CategoriaTarifa', id);
    }

    return this.tariffRepository.softDelete(id);
  }
}
