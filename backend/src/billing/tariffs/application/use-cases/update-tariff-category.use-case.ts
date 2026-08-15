import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import type { UpdateCategoriaTarifaDto } from '../../interfaces/dto/update-categoria-tarifa.dto';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(
    id: number,
    dto: UpdateCategoriaTarifaDto,
  ): Promise<TariffCategoryEntity> {
    const current = await this.tariffRepository.findById(id);

    if (!current) {
      throw new EntityNotFoundException('CategoriaTarifa', id);
    }

    return this.tariffRepository.createNewVersion(id, dto);
  }
}
