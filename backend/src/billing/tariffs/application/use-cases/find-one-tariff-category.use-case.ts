import { Injectable, NotFoundException } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { IResponseTariffCategory } from '../../types/IResponseTariffCategory';
import { toTariffCategoryResponse } from '../../types/tariffCategoryMapper';

@Injectable()
export class FindOneTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(id: number): Promise<IResponseTariffCategory> {
    const tariff = await this.tariffRepository.findFirst({
      categoriaTarifaId: id,
      activo: true,
      deletedAt: null,
    });

    if (!tariff) {
      throw new NotFoundException(
        'Categoría de tarifa no encontrada o inactiva',
      );
    }

    return toTariffCategoryResponse(tariff);
  }
}
