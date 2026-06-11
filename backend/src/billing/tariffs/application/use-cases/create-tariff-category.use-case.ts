import { ConflictException, Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { CreateCategoriaTarifaDto } from '../../interfaces/dto/create-categoria-tarifa.dto';
import { toTariffCategoryResponse } from '../../types/tariffCategoryMapper';

@Injectable()
export class CreateTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(dto: CreateCategoriaTarifaDto) {
    const existing = await this.tariffRepository.findFirst({
      nombre: dto.nombre,
      activo: true,
      deletedAt: null,
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una categoría activa con ese nombre',
      );
    }

    const now = new Date();

    const newTariff = await this.tariffRepository.create({
      ...dto,
      fechaVigenciaDesde: now,
      fechaVigenciaHasta: null,
      activo: true,
      createdAt: now,
    });

    return toTariffCategoryResponse(newTariff);
  }
}
