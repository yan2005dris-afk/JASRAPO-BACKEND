import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaTarifaDto } from './dto/create-categoria-tarifa.dto';
import { UpdateCategoriaTarifaDto } from './dto/update-categoria-tarifa.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class CategoriaTarifaService {
  constructor(private prisma: PrismaService) {}
  
  //CREATE
  async create(dto: CreateCategoriaTarifaDto) {
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

  //FIND ALL busca activos e inactivos
  async findAll() {
    return this.prisma.categoriaTarifa.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneByNombreAll(nombre: string) {
    const data = await this.prisma.categoriaTarifa.findFirst({
      where: {
        nombre,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!data) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return data;
  }

  // ✅ FIND ONE por nombre SOLO activos
  async findOneByNombre(nombre: string) {
    const data = await this.prisma.categoriaTarifa.findFirst({
      where: {
        nombre,
        activo: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!data) {
      throw new NotFoundException('Categoría activa no encontrada');
    }

    return data;
  }

  async update(id: number, dto: UpdateCategoriaTarifaDto) {
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
          valorExcedenteM3:
            dto.valorExcedenteM3 ?? current.valorExcedenteM3,

          fechaVigenciaDesde: now,
          fechaVigenciaHasta: null,
          activo: true,
          createdAt: now,
        },
      });
    });
  }

  async remove(id: number) {
    const current = await this.prisma.categoriaTarifa.findFirst({
      where: {
        categoriaTarifaId: id,
        activo: true,
        deletedAt: null,
      },
    });

    if (!current) {
      throw new NotFoundException('Categoría no encontrada o ya eliminada');
    }

    const now = new Date();

    return this.prisma.categoriaTarifa.update({
      where: { categoriaTarifaId: id },
      data: {
        activo: false,
        fechaVigenciaHasta: now,
        deletedAt: now,
        updatedAt: now,
      },
    });
  }
}
