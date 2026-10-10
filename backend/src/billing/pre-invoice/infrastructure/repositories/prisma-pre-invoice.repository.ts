import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, EstadoPrefactura } from 'src/generated/prisma/client';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { preInvoiceInclude, type PreInvoiceRow } from './pre-invoice.include';
import type {
  PreInvoiceFilters,
  UpdatePreInvoiceStateData,
} from '../../domain/types/pre-invoice.types';
import {
  paginate,
  type PaginateOptions,
} from 'src/shared/pagination/pagination.util';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

@Injectable()
export class PrismaPreInvoiceRepository implements PreInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async paginate(
    filters: PreInvoiceFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<PreInvoiceRow>> {
    const where: Prisma.PrefacturasWhereInput = {
      deletedAt: null,
      ...(filters.loteId ? { loteId: BigInt(filters.loteId) } : {}),
      ...(filters.periodoId ? { periodoId: filters.periodoId } : {}),
      ...(filters.estado ? { estado: filters.estado as EstadoPrefactura } : {}),
      ...(filters.contratoId ? { contratoId: BigInt(filters.contratoId) } : {}),
      ...(filters.identificacion
        ? {
            clienteIdentificacion: {
              contains: filters.identificacion,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filters.fechaDesde || filters.fechaHasta
        ? {
            createdAt: {
              ...(filters.fechaDesde
                ? { gte: this.parseDateStart(filters.fechaDesde) }
                : {}),
              ...(filters.fechaHasta
                ? { lte: this.parseDateEnd(filters.fechaHasta) }
                : {}),
            },
          }
        : {}),
    };

    return paginate<PreInvoiceRow>(
      this.prisma.prefacturas,
      {
        where,
        include: preInvoiceInclude,
        orderBy: { createdAt: 'desc' },
      },
      pagination,
    );
  }

  async findIdsByLoteId(loteId: bigint): Promise<{ prefacturaId: bigint }[]> {
    return this.prisma.prefacturas.findMany({
      where: { loteId, deletedAt: null },
      select: { prefacturaId: true },
    });
  }

  private parseDateStart(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date(value + 'T00:00:00.000');
    }
    return date;
  }

  private parseDateEnd(value: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date(value + 'T23:59:59.999');
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const end = new Date(date.getTime());
      end.setHours(23, 59, 59, 999);
      return end;
    }
    return date;
  }

  async findById(id: number | bigint): Promise<PreInvoiceRow | null> {
    return this.prisma.prefacturas.findUnique({
      where: { prefacturaId: BigInt(id) },
      include: preInvoiceInclude,
    });
  }

  async updateState(
    id: number | bigint,
    estado: string,
    estadoEsperado: string,
    data?: UpdatePreInvoiceStateData,
  ): Promise<boolean> {
    const result = await this.prisma.prefacturas.updateMany({
      where: {
        prefacturaId: BigInt(id),
        estado: estadoEsperado as EstadoPrefactura,
      },
      data: {
        estado: estado as EstadoPrefactura,
        ...(data?.aprobadaPor ? { aprobadaPor: data.aprobadaPor } : {}),
        ...(data?.motivoRechazo ? { motivoRechazo: data.motivoRechazo } : {}),
        ...(data?.fechaAprobacion
          ? { fechaAprobacion: data.fechaAprobacion }
          : {}),
        ...(data?.comprobanteId ? { comprobanteId: data.comprobanteId } : {}),
      },
    });
    return result.count > 0;
  }
}
