import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, EstadoGenerico } from 'src/generated/prisma/client';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { ReadingForRouteEntity } from '../../domain/types/reading-for-route.entity';
import { ReadingForRouteMapper } from '../../domain/types/mappers';
import { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class GetEligibleReadingsUseCase {
  constructor(private readonly routeRepository: RouteRepository) {}

  async execute(params: {
    tipoRuta: 'TOMA_LECTURA' | 'RECONEXION';
    comunidadId: number;
    sectorId?: number;
    search?: string;
    pagination: PaginateOptions;
  }): Promise<PaginatedResult<ReadingForRouteEntity>> {
    const { tipoRuta, comunidadId, sectorId, search, pagination } = params;

    const comunidad = await this.routeRepository.findComunidad({ comunidadId });
    if (!comunidad) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    if (sectorId) {
      const sector = await this.routeRepository.findSector({ sectorId });
      if (!sector) {
        throw new NotFoundException('Sector no encontrado');
      }
      if (sector.comunidadId !== comunidadId) {
        throw new BadRequestException('El sector no pertenece a la comunidad');
      }
    }

    const estadoContratoEsperado: EstadoGenerico =
      tipoRuta === 'TOMA_LECTURA'
        ? EstadoGenerico.ACTIVO
        : EstadoGenerico.RECONEXION;

    const where: Prisma.LecturasWhereInput = {
      estadoAsignacion: 'NO_ASIGNADA',
      estado: { in: ['PENDIENTE', 'POR_REVISION'] },
      deletedAt: null,
      medidor: {
        historial: {
          some: {
            fechaHasta: null,
            contrato: {
              estado: estadoContratoEsperado,
              comunidadId,
              ...(sectorId && { sectorId }),
              deletedAt: null,
            },
          },
        },
      },
    };

    const q = search?.trim();
    if (q) {
      where.OR = [
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: { numeroGuia: { contains: q, mode: 'insensitive' } },
              },
            },
          },
        },
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: { cliente: { nombres: { contains: q, mode: 'insensitive' } } },
              },
            },
          },
        },
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: { cliente: { apellidos: { contains: q, mode: 'insensitive' } } },
              },
            },
          },
        },
      ];
    }

    const result = await this.routeRepository.paginateLecturas(
      {
        where,
        include: {
          medidor: {
            include: {
              historial: {
                where: { fechaHasta: null },
                include: { contrato: { include: { cliente: true, sector: true } } },
              },
            },
          },
        },
        orderBy: [{ medidor: { historial: { _count: 'desc' } } }],
      },
      pagination,
    );

    return {
      ...result,
      data: result.data.map((l) => ReadingForRouteMapper.toEntity(l)),
    };
  }
}
