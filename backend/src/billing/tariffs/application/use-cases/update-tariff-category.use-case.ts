import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { UpdateCategoriaTarifaDto } from '../../interfaces/dto/update-categoria-tarifa.dto';

import { toTariffCategoryResponse } from '../../types/tariffCategoryMapper';

@Injectable()
export class UpdateTariffCategoryUseCase {
  constructor(private readonly tariffRepository: TariffRepository) {}

  async execute(id: number, dto: UpdateCategoriaTarifaDto) {
    const current = await this.tariffRepository.findFirst({
      categoriaTarifaId: id,
      activo: true,
      deletedAt: null,
    });

    if (!current) {
      throw new NotFoundException('Categoría no encontrada o inactiva');
    }

    const now = new Date();

    const newTariff = await this.tariffRepository.executeTransaction(
      async (tx) => {
        // cerrar vigencia actual
        await tx.categoriaTarifa.update({
          where: { categoriaTarifaId: id },
          data: {
            fechaVigenciaHasta: now,
            activo: false,
            updatedAt: now,
          },
        });

        // validar duplicado (por si cambian nombre)
        if (dto.nombre && dto.nombre !== current.nombre) {
          const existing = await tx.categoriaTarifa.findFirst({
            where: {
              nombre: dto.nombre,
              activo: true,
              deletedAt: null,
            },
          });

          if (existing) {
            throw new ConflictException(
              'Ya existe una categoría activa con ese nombre',
            );
          }
        }

        // crear nueva versión
        return tx.categoriaTarifa.create({
          data: {
            nombre: dto.nombre ?? current.nombre,
            descripcion: dto.descripcion ?? current.descripcion,
            valorBase: dto.valorBase ?? current.valorBase,
            consumoMinimoMensual:
              dto.consumoMinimoMensual ?? current.consumoMinimoMensual,
            valorExcedenteM3: dto.valorExcedenteM3 ?? current.valorExcedenteM3,
            fechaVigenciaDesde: now,
            fechaVigenciaHasta: null,
            activo: true,
            createdAt: now,
          },
        });
      },
    );

    return toTariffCategoryResponse(newTariff);
  }
}
