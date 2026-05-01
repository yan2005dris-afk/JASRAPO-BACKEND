import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateCategoriaTarifaDto } from '../dto/update-categoria-tarifa.dto';

@Injectable()
export class UpdateTariffCategoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, dto: UpdateCategoriaTarifaDto) {
    const current = await this.prisma.categoriaTarifa.findFirst({
      where: {
        categoriaTarifaId: id,
        activo: true,
        deletedAt: null,
      },
    });

    if (!current) {
      throw new NotFoundException('Categoría no encontrada o inactiva');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
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
    });
  }
}
