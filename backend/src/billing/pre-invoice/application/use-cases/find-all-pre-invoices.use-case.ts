import { Injectable, BadRequestException } from '@nestjs/common';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class FindAllPreInvoicesUseCase {
  constructor(private readonly preInvoiceRepository: PreInvoiceRepository) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    filters?: {
      loteId?: number;
      periodoId?: number;
      estado?: string;
      contratoId?: string;
      identificacion?: string;
    },
  ): Promise<PaginatedResult<any>> {
    const { skip, take } = getPagination(page, limit);

    const where = this.buildWhereClause(filters);

    const [data, total] = await Promise.all([
      this.preInvoiceRepository.findMany({
        where,
        include: {
          contrato: {
            select: {
              contratoId: true,
              numeroGuia: true,
              cliente: {
                select: {
                  clienteId: true,
                  nombres: true,
                  apellidos: true,
                  identificacion: true,
                },
              },
            },
          },
          lote: {
            select: {
              loteId: true,
              comunidad: { select: { nombre: true } },
            },
          },
          periodoRel: {
            select: { nombre: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.preInvoiceRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        ultimaPagina: totalPages,
        paginaActual: page,
        porPagina: take,
        anterior: page > 1 ? page - 1 : null,
        siguiente: page < totalPages ? page + 1 : null,
      },
    };
  }

  private buildWhereClause(
    filters?: {
      loteId?: number;
      periodoId?: number;
      estado?: string;
      contratoId?: string;
      identificacion?: string;
    },
  ): Record<string, any> {
    if (!filters) return {};

    const where: Record<string, any> = {};

    if (filters.loteId != null) {
      where.loteId = BigInt(filters.loteId);
    }
    if (filters.periodoId != null) {
      where.periodoId = filters.periodoId;
    }
    if (filters.estado != null) {
      where.estado = filters.estado;
    }
    if (filters.contratoId != null) {
      if (!/^\d+$/.test(filters.contratoId)) {
        throw new BadRequestException('contratoId must be a numeric value');
      }
      where.contratoId = BigInt(filters.contratoId);
    }
    if (filters.identificacion) {
      where.clienteIdentificacion = { contains: filters.identificacion };
    }

    return where;
  }
}
