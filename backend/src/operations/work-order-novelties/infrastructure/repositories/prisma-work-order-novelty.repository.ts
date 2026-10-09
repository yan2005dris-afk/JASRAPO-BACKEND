import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  type WorkOrderNoveltyRepository,
  type CreateWorkOrderNoveltyData,
  type UpdateWorkOrderNoveltyData,
  type WorkOrderNoveltyFilters,
} from '../../domain/repositories/work-order-novelty.repository';
import type { WorkOrderNoveltyRow } from './work-order-novelty.include';

@Injectable()
export class PrismaWorkOrderNoveltyRepository implements WorkOrderNoveltyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateWorkOrderNoveltyData): Promise<WorkOrderNoveltyRow> {
    return this.prisma.novedadOrdenTrabajo.create({
      data: {
        ordenTrabajoId: data.ordenTrabajoId,
        lecturaId: data.lecturaId ?? null,
        observacion: data.observacion ?? null,
        tipo: data.tipo,
        fotoUrl: data.fotoUrl ?? null,
      },
    });
  }

  async findById(id: bigint): Promise<WorkOrderNoveltyRow | null> {
    return this.prisma.novedadOrdenTrabajo.findUnique({
      where: { novedadId: id },
    });
  }

  async update(
    id: bigint,
    data: UpdateWorkOrderNoveltyData,
  ): Promise<WorkOrderNoveltyRow> {
    return this.prisma.novedadOrdenTrabajo.update({
      where: { novedadId: id },
      data: {
        ...(data.observacion !== undefined && {
          observacion: data.observacion,
        }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.fotoUrl !== undefined && { fotoUrl: data.fotoUrl }),
        ...(data.resolucionTipo !== undefined && {
          resolucionTipo: data.resolucionTipo,
        }),
        ...(data.consumoAjustado !== undefined && {
          consumoAjustado: data.consumoAjustado,
        }),
        ...(data.observacionResolucion !== undefined && {
          observacionResolucion: data.observacionResolucion,
        }),
        ...(data.resueltoPorUsuarioId !== undefined && {
          resueltoPorUsuarioId: data.resueltoPorUsuarioId,
        }),
        ...(data.resueltoEn !== undefined && { resueltoEn: data.resueltoEn }),
      },
    });
  }

  async softDelete(id: bigint, deletedAt: Date): Promise<WorkOrderNoveltyRow> {
    return this.prisma.novedadOrdenTrabajo.update({
      where: { novedadId: id },
      data: { deletedAt },
    });
  }

  async clearEvidenceReference(
    id: bigint,
    expectedFotoUrl: string,
  ): Promise<void> {
    await this.prisma.novedadOrdenTrabajo.updateMany({
      where: { novedadId: id, fotoUrl: expectedFotoUrl },
      data: { fotoUrl: null },
    });
  }

  async findMany(
    filters: WorkOrderNoveltyFilters,
  ): Promise<{ data: WorkOrderNoveltyRow[]; total: number }> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.ordenTrabajoId && { ordenTrabajoId: filters.ordenTrabajoId }),
      ...(filters.lecturaId && { lecturaId: filters.lecturaId }),
      ...(filters.estado && { estado: filters.estado }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.novedadOrdenTrabajo.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.novedadOrdenTrabajo.count({ where }),
    ]);

    return {
      data: rows,
      total,
    };
  }
}
