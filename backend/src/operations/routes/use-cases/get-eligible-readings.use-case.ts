import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, EstadoGenerico } from 'src/generated/prisma/client';

import { ReadingForRouteEntity } from '../types/reading-for-route.entity';
import { ReadingForRouteMapper } from '../types/mappers';

@Injectable()
export class GetEligibleReadingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    tipoRuta: 'TOMA_LECTURA' | 'RECONEXION';
    comunidadId: number;
    sectorId?: number;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    data: ReadingForRouteEntity[];
    total: number;
  }> {
    const {
      tipoRuta,
      comunidadId,
      sectorId,
      search,
      skip = 0,
      take = 10,
    } = params;

    // Validar comunidad
    const comunidad = await this.prisma.comunidades.findUnique({
      where: { comunidadId },
    });

    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    // Validar sector
    if (sectorId) {
      const sector = await this.prisma.sectores.findUnique({
        where: { sectorId },
      });

      if (!sector) {
        throw new NotFoundException('Sector no encontrado');
      }

      if (sector.comunidadId !== comunidadId) {
        throw new BadRequestException('El sector no pertenece a la comunidad');
      }
    }

    // Estado esperado según tipo de ruta
    const estadoContratoEsperado: EstadoGenerico =
      tipoRuta === 'TOMA_LECTURA'
        ? EstadoGenerico.ACTIVO
        : EstadoGenerico.RECONEXION;

    // WHERE principal
    const where: Prisma.LecturasWhereInput = {
      estadoAsignacion: 'NO_ASIGNADA',

      estado: {
        in: ['PENDIENTE', 'POR_REVISION'],
      },

      deletedAt: null,

      contrato: {
        estado: estadoContratoEsperado,

        comunidadId,

        ...(sectorId && { sectorId }),

        deletedAt: null,
      },
    };

    // Búsqueda
    if (search?.trim()) {
      where.OR = [
        {
          contrato: {
            numeroGuia: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },

        {
          contrato: {
            cliente: {
              nombres: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },

        {
          contrato: {
            cliente: {
              apellidos: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    // Total
    const total = await this.prisma.lecturas.count({
      where,
    });

    // Datos
    const lecturas = await this.prisma.lecturas.findMany({
      where,

      skip,

      take,

      include: {
        contrato: {
          include: {
            cliente: true,
            sector: true,
          },
        },
      },

      orderBy: [
        {
          contrato: {
            sectorId: 'asc',
          },
        },

        {
          contrato: {
            numeroGuia: 'asc',
          },
        },
      ],
    });

    return {
      data: lecturas.map((l) => ReadingForRouteMapper.toEntity(l)),

      total,
    };
  }
}
