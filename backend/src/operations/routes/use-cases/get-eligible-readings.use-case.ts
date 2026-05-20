import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, EstadoGenerico } from 'src/generated/prisma/client';

import { ReadingForRouteEntity } from '../types/reading-for-route.entity';
import { ReadingForRouteMapper } from '../types/mappers';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class GetEligibleReadingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    tipoRuta: 'TOMA_LECTURA' | 'RECONEXION';
    comunidadId: number;
    sectorId?: number;
    search?: string;
    pagination: PaginateOptions;
  }): Promise<PaginatedResult<ReadingForRouteEntity>> {
    const { tipoRuta, comunidadId, sectorId, search, pagination } = params;

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
    const q = search?.trim();
    if (q) {
      where.OR = [
        {
          contrato: {
            numeroGuia: {
              contains: q,
              mode: 'insensitive',
            },
          },
        },

        {
          contrato: {
            cliente: {
              nombres: {
                contains: q,
                mode: 'insensitive',
              },
            },
          },
        },

        {
          contrato: {
            cliente: {
              apellidos: {
                contains: q,
                mode: 'insensitive',
              },
            },
          },
        },
      ];
    }

    const result = await paginate<any>(
      this.prisma.lecturas,
      {
        where,
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
      },
      pagination,
    );

    return {
      ...result,
      data: result.data.map((l) => ReadingForRouteMapper.toEntity(l)),
    };
  }
}
