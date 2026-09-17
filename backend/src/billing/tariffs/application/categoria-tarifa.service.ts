import { Injectable } from '@nestjs/common';
import type { CreateCategoriaTarifaDto } from '../interfaces/dto/create-categoria-tarifa.dto';
import type { UpdateCategoriaTarifaDto } from '../interfaces/dto/update-categoria-tarifa.dto';
import { CreateTariffCategoryUseCase } from './use-cases/create-tariff-category.use-case';
import { FindAllTariffCategoriesUseCase } from './use-cases/find-all-tariff-categories.use-case';
import { FindOneTariffCategoryUseCase } from './use-cases/find-one-tariff-category.use-case';
import { UpdateTariffCategoryUseCase } from './use-cases/update-tariff-category.use-case';
import { RemoveTariffCategoryUseCase } from './use-cases/remove-tariff-category.use-case';
import type { TariffCategoryEntity } from '../domain/entities/tariff-category.entity';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class CategoriaTarifaService {
  constructor(
    private readonly createUseCase: CreateTariffCategoryUseCase,
    private readonly findAllUseCase: FindAllTariffCategoriesUseCase,
    private readonly findOneUseCase: FindOneTariffCategoryUseCase,
    private readonly updateUseCase: UpdateTariffCategoryUseCase,
    private readonly removeUseCase: RemoveTariffCategoryUseCase,
  ) {}

  async createCategoria(
    dto: CreateCategoriaTarifaDto,
  ): Promise<TariffCategoryEntity> {
    return this.createUseCase.execute(dto);
  }

  async getCategorias(
    page = 1,
    limit = 10,
    nombre?: string,
    search?: string,
  ): Promise<PaginatedResult<TariffCategoryEntity>> {
    return this.findAllUseCase.execute(page, limit, nombre, search);
  }

  async findOneCategoria(id: number): Promise<TariffCategoryEntity> {
    return this.findOneUseCase.execute(id);
  }

  async updateCategoria(
    id: number,
    dto: UpdateCategoriaTarifaDto,
  ): Promise<TariffCategoryEntity> {
    return this.updateUseCase.execute(id, dto);
  }

  async deleteCategoria(id: number): Promise<TariffCategoryEntity> {
    return this.removeUseCase.execute(id);
  }
}
