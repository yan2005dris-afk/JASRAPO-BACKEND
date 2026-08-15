import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(id: number): Promise<TariffCategoryEntity> {
    const tariff = await this.tariffRepository.findById(id);

    if (!tariff) {
      throw new EntityNotFoundException('CategoriaTarifa', id);
    }

    return tariff;
  }
}
