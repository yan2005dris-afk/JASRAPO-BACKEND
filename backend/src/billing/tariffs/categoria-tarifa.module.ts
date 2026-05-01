import { Module } from '@nestjs/common';
import { CategoriaTarifaService } from './categoria-tarifa.service';
import { CategoriaTarifaController } from './categoria-tarifa.controller';
import { CreateTariffCategoryUseCase } from './use-cases/create-tariff-category.use-case';
import { FindAllTariffCategoriesUseCase } from './use-cases/find-all-tariff-categories.use-case';
import { UpdateTariffCategoryUseCase } from './use-cases/update-tariff-category.use-case';
import { RemoveTariffCategoryUseCase } from './use-cases/remove-tariff-category.use-case';

@Module({
  controllers: [CategoriaTarifaController],
  providers: [
    CategoriaTarifaService,
    CreateTariffCategoryUseCase,
    FindAllTariffCategoriesUseCase,
    UpdateTariffCategoryUseCase,
    RemoveTariffCategoryUseCase,
  ],
  exports: [
    CreateTariffCategoryUseCase,
    FindAllTariffCategoriesUseCase,
    UpdateTariffCategoryUseCase,
    RemoveTariffCategoryUseCase,
  ],
})
export class CategoriaTarifaModule {}
