import { Injectable } from '@nestjs/common';
import { CreateCategoriaTarifaDto } from '../interfaces/dto/create-categoria-tarifa.dto';
import { UpdateCategoriaTarifaDto } from '../interfaces/dto/update-categoria-tarifa.dto';
import { CreateTariffCategoryUseCase } from './use-cases/create-tariff-category.use-case';
import { FindAllTariffCategoriesUseCase } from './use-cases/find-all-tariff-categories.use-case';
import { UpdateTariffCategoryUseCase } from './use-cases/update-tariff-category.use-case';
import { RemoveTariffCategoryUseCase } from './use-cases/remove-tariff-category.use-case';

@Injectable()
export class CategoriaTarifaService {
  constructor(
    private readonly createUseCase: CreateTariffCategoryUseCase,
    private readonly findAllUseCase: FindAllTariffCategoriesUseCase,
    private readonly updateUseCase: UpdateTariffCategoryUseCase,
    private readonly removeUseCase: RemoveTariffCategoryUseCase,
  ) {}

  async createCategoria(dto: CreateCategoriaTarifaDto) {
    return this.createUseCase.execute(dto);
  }

  async getCategorias(page = 1, limit = 10, nombre?: string) {
    return this.findAllUseCase.execute(page, limit, nombre);
  }

  async buscarCategoriaPorNombre(nombre: string) {
    return this.findAllUseCase.execute(nombre);
    // Reutilizamos el findAll con el filtro de nombre
    return this.findAllUseCase.execute(1, 10, nombre);
  }

  async updateCategoria(id: number, dto: UpdateCategoriaTarifaDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async deleteCategoria(id: number) {
    return this.removeUseCase.execute(id);
  }
}
