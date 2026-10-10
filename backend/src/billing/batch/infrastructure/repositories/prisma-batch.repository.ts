import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, EstadoLote } from 'src/generated/prisma/client';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { batchInclude, type BatchRow } from './batch.include';
import type {
  BatchFilters,
  GenerateBatchData,
} from '../../domain/types/batch.types';
import {
  paginate,
  type PaginateOptions,
} from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

@Injectable()
export class PrismaBatchRepository implements BatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    pagination: PaginateOptions,
    filters?: BatchFilters,
  ): Promise<PaginatedResult<BatchRow>> {
    const where: Prisma.LoteWhereInput = {
      ...(filters?.comunidadId ? { comunidadId: filters.comunidadId } : {}),
      ...(filters?.periodoId ? { periodoId: filters.periodoId } : {}),
      ...(filters?.mes ? { mes: filters.mes } : {}),
      ...(filters?.rutaId ? { rutaId: BigInt(filters.rutaId) } : {}),
      ...(filters?.estado ? { estado: filters.estado as EstadoLote } : {}),
    };

    const paginated = await paginate<BatchRow>(
      this.prisma.lote,
      {
        where,
        include: batchInclude,
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );

    return paginated;
  }

  async count(filters?: BatchFilters): Promise<number> {
    const where: Prisma.LoteWhereInput = {
      ...(filters?.comunidadId ? { comunidadId: filters.comunidadId } : {}),
      ...(filters?.periodoId ? { periodoId: filters.periodoId } : {}),
      ...(filters?.mes ? { mes: filters.mes } : {}),
      ...(filters?.rutaId ? { rutaId: BigInt(filters.rutaId) } : {}),
      ...(filters?.estado ? { estado: filters.estado as EstadoLote } : {}),
    };

    return this.prisma.lote.count({ where });
  }

  async findById(id: number | bigint): Promise<BatchRow | null> {
    return this.prisma.lote.findUnique({
      where: { loteId: BigInt(id) },
      include: {
        ...batchInclude,
        prefacturas: {
          take: 10,
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
          },
        },
      },
    });
  }

  async generate(data: GenerateBatchData): Promise<bigint | null> {
    const currentMonth = new Date().getMonth() + 1;
    const mes = data.mes ?? currentMonth;
    const result = await this.prisma.$queryRawUnsafe<
      Array<{ loteId: number | string | bigint | null }>
    >(
      `SELECT generar_prefacturas_lote($1, $2, $3, $4, $5) as "loteId"`,
      data.periodoId,
      data.comunidadId ?? null,
      data.creadoPor ?? 'SYSTEM',
      mes,
      BigInt(data.rutaId),
    );

    const loteId = result[0]?.loteId;
    return loteId ? BigInt(loteId) : null;
  }
}
