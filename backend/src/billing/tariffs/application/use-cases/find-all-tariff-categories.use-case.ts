import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';

@Injectable()
export class FindAllTariffCategoriesUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(
    page = 1,
    limit = 10,
    nombre?: string,
    search?: string,
  ): Promise<PaginatedResult<TariffCategoryEntity>> {
    return this.tariffRepository.paginate(
      { nombre, search, activo: true },
      { page, limit },
    );
  }
}
