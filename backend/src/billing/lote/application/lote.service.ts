import { Injectable, Logger } from '@nestjs/common';
import { LoteRepository } from '../domain/repositories/lote.repository';
import { GenerarLoteDto } from '../interfaces/dto/generar-lote.dto';
import { BATCH_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';

@Injectable()
export class LoteService {
  private readonly logger = new Logger(LoteService.name);

  constructor(private readonly loteRepository: LoteRepository) {}

  async generarLote(dto: GenerarLoteDto) {
    this.logger.log(
      `Iniciando generación de lote para periodo ${dto.periodoId}`,
    );

    const loteId = await this.loteRepository.generarLote(
      dto.periodoId,
      dto.comunidadId ?? null,
      dto.creadoPor ?? 'SYSTEM',
    );

    return {
      message: 'Lote generado exitosamente',
      loteId: loteId ? Number(loteId) : null,
    };
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<any>> {
    const { skip, take } = getPagination(page, limit);

    const [data, total] = await Promise.all([
      this.loteRepository.findMany({
        include: {
          comunidad: true,
          periodoRel: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      }),
      this.loteRepository.count(),
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

  async findOne(id: number) {
    return this.loteRepository.findById(id, {
      include: {
        prefacturas: {
          take: 10,
        },
        comunidad: true,
        periodoRel: true,
      },
    });
  }

  /**
   * Catálogo de estados de lote
   */
  async findAllEstados() {
    return BATCH_STATUS_LIST.map((s) => ({
      estadoId: s.estadoId,
      codigo: s.codigo,
      nombre: s.nombre,
      orden: s.orden,
    }));
  }
}
