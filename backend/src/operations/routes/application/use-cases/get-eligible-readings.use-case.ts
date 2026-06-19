import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoContrato } from 'src/operations/contracts/domain/enums/estado-contrato.enum';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';
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

    const estadoContratoEsperado: EstadoContrato =
      tipoRuta === 'TOMA_LECTURA'
        ? EstadoContrato.ACTIVO
        : EstadoContrato.RECONEXION;

    const where: Record<string, any> = {
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
                contrato: {
                  cliente: { nombres: { contains: q, mode: 'insensitive' } },
                },
              },
            },
          },
        },
        {
          medidor: {
            historial: {
              some: {
                fechaHasta: null,
                contrato: {
                  cliente: { apellidos: { contains: q, mode: 'insensitive' } },
                },
              },
            },
          },
        },
      ];
    }

    return this.routeRepository.paginateLecturas(
      {
        where,
        orderBy: [{ medidor: { historial: { _count: 'desc' } } }],
      },
      pagination,
    );
  }
}
