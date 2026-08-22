import { Module } from '@nestjs/common';
import { CategoriaTarifaService } from './application/categoria-tarifa.service';
import { CategoriaTarifaController } from './interfaces/http/categoria-tarifa.controller';
import { CreateTariffCategoryUseCase } from './application/use-cases/create-tariff-category.use-case';
import { FindAllTariffCategoriesUseCase } from './application/use-cases/find-all-tariff-categories.use-case';
import { UpdateTariffCategoryUseCase } from './application/use-cases/update-tariff-category.use-case';
import { RemoveTariffCategoryUseCase } from './application/use-cases/remove-tariff-category.use-case';
import { FindOneTariffCategoryUseCase } from './application/use-cases/find-one-tariff-category.use-case';
import { TariffRepository } from './domain/repositories/tariff.repository';
import { PrismaTariffRepository } from './infrastructure/repositories/prisma-tariff.repository';
import { RubrosModule } from '../rubros/rubros.module';

@Module({
  imports: [RubrosModule],
  controllers: [CategoriaTarifaController],
  providers: [
    { provide: TariffRepository, useClass: PrismaTariffRepository },
    CategoriaTarifaService,
    CreateTariffCategoryUseCase,
    FindAllTariffCategoriesUseCase,
    FindOneTariffCategoryUseCase,
    UpdateTariffCategoryUseCase,
    RemoveTariffCategoryUseCase,
  ],
  exports: [
    TariffRepository,
    CreateTariffCategoryUseCase,
    FindAllTariffCategoriesUseCase,
    FindOneTariffCategoryUseCase,
    UpdateTariffCategoryUseCase,
    RemoveTariffCategoryUseCase,
  ],
})
export class CategoriaTarifaModule {}
