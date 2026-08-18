import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, EstadoLote } from 'src/generated/prisma/client';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchEntity } from '../../domain/entities/batch.entity';
import { BatchMapper } from '../mappers/batch.mapper';
import type {
  BatchFilters,
  GenerateBatchData,
} from '../../domain/types/batch.types';
import {
  paginate,
  type PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@Injectable()
export class PrismaBatchRepository implements BatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultInclude = {
    comunidad: true,
    periodoRel: true,
    ruta: true,
  };

  async paginate(
    pagination: PaginateOptions,
    filters?: BatchFilters,
  ): Promise<PaginatedResult<BatchEntity>> {
    const where: Prisma.LoteWhereInput = {
      ...(filters?.comunidadId ? { comunidadId: filters.comunidadId } : {}),
      ...(filters?.periodoId ? { periodoId: filters.periodoId } : {}),
      ...(filters?.mes ? { mes: filters.mes } : {}),
      ...(filters?.rutaId ? { rutaId: BigInt(filters.rutaId) } : {}),
      ...(filters?.estado ? { estado: filters.estado as EstadoLote } : {}),
    };

    const paginated = await paginate<any>(
      this.prisma.lote,
      {
        where,
        include: this.defaultInclude,
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );

    return {
      data: BatchMapper.toDomainList(paginated.data),
      meta: paginated.meta,
    };
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

  async findById(id: number | bigint): Promise<BatchEntity | null> {
    const record = await this.prisma.lote.findUnique({
      where: { loteId: BigInt(id) },
      include: {
        ...this.defaultInclude,
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

    return BatchMapper.toDomain(record);
  }

  async generate(data: GenerateBatchData): Promise<bigint | null> {
    const currentMonth = new Date().getMonth() + 1;
    const mes = data.mes ?? currentMonth;
    const result = await this.prisma.$queryRawUnsafe<any[]>(
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
