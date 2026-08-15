import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import type { CreateCategoriaTarifaDto } from '../../interfaces/dto/create-categoria-tarifa.dto';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(dto: CreateCategoriaTarifaDto): Promise<TariffCategoryEntity> {
    const existing = await this.tariffRepository.findActiveByNombre(dto.nombre);

    if (existing) {
      throw new EntityAlreadyExistsException('CategoriaTarifa', dto.nombre);
    }

    return this.tariffRepository.create(dto);
  }
}
