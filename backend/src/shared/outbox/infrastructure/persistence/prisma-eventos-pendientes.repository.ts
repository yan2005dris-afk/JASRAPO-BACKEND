import { Injectable } from '@nestjs/common';
import type { Prisma } from 'src/generated/prisma/client';
import { EstadoEvento } from 'src/shared/enums';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  EventoPendiente,
  EventosPendientesRepository,
} from '../../domain/repositories/eventos-pendientes.repository';

@Injectable()
export class PrismaEventosPendientesRepository implements EventosPendientesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolves which Prisma client to use: an externally provided
   * TransactionClient (so the outbox write joins the caller's atomic block),
   * or the global PrismaService otherwise.
   */
  private client(tx?: Prisma.TransactionClient): Prisma.TransactionClient {
    return tx ?? this.prisma;
  }

  private toEntity(row: unknown): EventoPendiente {
    const r = row as {
      id: bigint;
      tipo: string;
      aggregateType: string | null;
      aggregateId: string | null;
      payload: Record<string, unknown>;
      estado: EstadoEvento;
      intentos: number;
      ultimoError: string | null;
      createdAt: Date;
      processedAt: Date | null;
    };
    return {
      id: r.id,
      tipo: r.tipo,
      aggregateType: r.aggregateType,
      aggregateId: r.aggregateId,
      payload: r.payload,
      estado: r.estado,
      intentos: r.intentos,
      ultimoError: r.ultimoError,
      createdAt: r.createdAt,
      processedAt: r.processedAt,
    };
  }

  async createPending(
    tipo: string,
    payload: Record<string, unknown>,
    aggregateType?: string,
    aggregateId?: string,
    tx?: Prisma.TransactionClient,
  ): Promise<EventoPendiente> {
    const data: Prisma.EventosPendientesUncheckedCreateInput = {
      tipo,
      payload: payload as Prisma.InputJsonValue,
      estado: EstadoEvento.PENDIENTE,
      intentos: 0,
    };
    if (aggregateType !== undefined) data.aggregateType = aggregateType;
    if (aggregateId !== undefined) data.aggregateId = aggregateId;

    const row = await this.client(tx).eventosPendientes.create({ data });
    return this.toEntity(row);
  }

  async findPendingByTipo(
    tipo: string,
    limit: number,
  ): Promise<EventoPendiente[]> {
    const rows = await this.prisma.eventosPendientes.findMany({
      where: {
        tipo,
        estado: EstadoEvento.PENDIENTE,
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findAllPending(limit: number): Promise<EventoPendiente[]> {
    const rows = await this.prisma.eventosPendientes.findMany({
      where: { estado: EstadoEvento.PENDIENTE },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return rows.map((row) => this.toEntity(row));
  }

  async markProcessed(id: bigint): Promise<void> {
    await this.prisma.eventosPendientes.update({
      where: { id },
      data: {
        estado: EstadoEvento.PROCESADO,
        processedAt: new Date(),
      },
    });
  }

  async markFailed(id: bigint, error: string): Promise<void> {
    await this.prisma.eventosPendientes.update({
      where: { id },
      data: {
        ultimoError: error,
        intentos: { increment: 1 },
      },
    });
  }
}
