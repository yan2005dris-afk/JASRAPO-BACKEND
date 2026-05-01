import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateCategoriaTarifaDto } from '../dto/create-categoria-tarifa.dto';

@Injectable()
export class CreateTariffCategoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateCategoriaTarifaDto) {
    const existing = await this.prisma.categoriaTarifa.findFirst({
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

    const now = new Date();

    return this.prisma.categoriaTarifa.create({
      data: {
        ...dto,
        fechaVigenciaDesde: now,
        fechaVigenciaHasta: null,
        activo: true,
        createdAt: now,
      },
    });
  }
}
