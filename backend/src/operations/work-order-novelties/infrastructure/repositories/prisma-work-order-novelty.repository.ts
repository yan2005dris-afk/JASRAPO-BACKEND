import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  type WorkOrderNoveltyRepository,
  type CreateWorkOrderNoveltyData,
  type UpdateWorkOrderNoveltyData,
  type WorkOrderNoveltyFilters,
} from '../../domain/repositories/work-order-novelty.repository';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';

@Injectable()
export class PrismaWorkOrderNoveltyRepository implements WorkOrderNoveltyRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(row: any): WorkOrderNoveltyEntity {
    return new WorkOrderNoveltyEntity({
      novedadId: row.novedadId,
      ordenTrabajoId: row.ordenTrabajoId,
      lecturaId: row.lecturaId,
      observacion: row.observacion,
      tipo: row.tipo,
      estado: row.estado,
      resolucionTipo: row.resolucionTipo,
      consumoAjustado: row.consumoAjustado ? Number(row.consumoAjustado) : null,
      observacionResolucion: row.observacionResolucion,
      resueltoPorUsuarioId: row.resueltoPorUsuarioId,
      resueltoEn: row.resueltoEn,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
      fotoUrl: row.fotoUrl,
      legacyAnomaliaId: row.legacyAnomaliaId,
    });
  }

  async create(
    data: CreateWorkOrderNoveltyData,
  ): Promise<WorkOrderNoveltyEntity> {
    const created = await this.prisma.novedadOrdenTrabajo.create({
      data: {
        ordenTrabajoId: data.ordenTrabajoId,
        lecturaId: data.lecturaId ?? null,
        observacion: data.observacion ?? null,
        tipo: data.tipo,
        fotoUrl: data.fotoUrl ?? null,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: bigint): Promise<WorkOrderNoveltyEntity | null> {
    const row = await this.prisma.novedadOrdenTrabajo.findUnique({
      where: { novedadId: id },
    });
    return row ? this.toDomain(row) : null;
  }

  async findByWorkOrderId(
    workOrderId: bigint,
  ): Promise<WorkOrderNoveltyEntity[]> {
    const rows = await this.prisma.novedadOrdenTrabajo.findMany({
      where: { ordenTrabajoId: workOrderId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async update(
    id: bigint,
    data: UpdateWorkOrderNoveltyData,
  ): Promise<WorkOrderNoveltyEntity> {
    const updated = await this.prisma.novedadOrdenTrabajo.update({
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
    return this.toDomain(updated);
  }

  async softDelete(
    id: bigint,
    deletedAt: Date,
  ): Promise<WorkOrderNoveltyEntity> {
    const updated = await this.prisma.novedadOrdenTrabajo.update({
      where: { novedadId: id },
      data: { deletedAt },
    });
    return this.toDomain(updated);
  }

  async findSoftDeletedWithEvidence(
    limit: number,
  ): Promise<WorkOrderNoveltyEntity[]> {
    const rows = await this.prisma.novedadOrdenTrabajo.findMany({
      where: {
        deletedAt: { not: null },
        fotoUrl: { not: null },
      },
      orderBy: { deletedAt: 'asc' },
      take: limit,
    });
    return rows.map((r) => this.toDomain(r));
  }

  async clearEvidenceReference(id: bigint): Promise<void> {
    await this.prisma.novedadOrdenTrabajo.update({
      where: { novedadId: id },
      data: { fotoUrl: null },
    });
  }

  async findMany(
    filters: WorkOrderNoveltyFilters,
  ): Promise<{ data: WorkOrderNoveltyEntity[]; total: number }> {
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
      data: rows.map((r) => this.toDomain(r)),
      total,
    };
  }
}
