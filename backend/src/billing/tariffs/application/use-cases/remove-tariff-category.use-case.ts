import { Injectable, NotFoundException } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';

@Injectable()
export class RemoveTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(id: number) {
    const current = await this.tariffRepository.findFirst({
      categoriaTarifaId: id,
      activo: true,
      deletedAt: null,
    });

    if (!current) {
      throw new NotFoundException('Categoría no encontrada o ya eliminada');
    }

    const now = new Date();

    await this.tariffRepository.update(
      { categoriaTarifaId: id },
      {
        activo: false,
        fechaVigenciaHasta: now,
        deletedAt: now,
        updatedAt: now,
      },
    );

    return {
      message: 'Categoría de tarifa eliminada exitosamente',
      statusCode: 200,
    };
  }
}
