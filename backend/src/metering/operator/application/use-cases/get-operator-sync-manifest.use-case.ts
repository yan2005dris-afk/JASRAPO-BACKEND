import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MeterEntity } from 'src/metering/meters/domain/entities/meter.entity';
import {
  EntityNotFoundException,
  ConflictDomainException,
  DomainValidationException,
} from 'src/shared/domain/exceptions/domain.exception';
import {
  OperatorRepository,
  type RouteData,
} from '../../domain/repositories/operator.repository';
import type {
  SyncCursorPosition,
  SyncPage,
  OperatorSyncChange,
} from '../../domain/repositories/repository-types';
import { OperatorRouteResponseDto } from '../../interfaces/dto/operator-route-response.dto';
import { OperatorReadingAnomalyResponseDto } from '../../interfaces/dto/operator-reading-anomaly-response.dto';
import { MeterResponseDto } from 'src/metering/meters/interfaces/dto/meter-response.dto';
import {
  OperatorSyncManifestDto,
  type OperatorSyncPage,
} from '../../interfaces/dto/operator-sync-manifest.dto';

type Collection =
  | 'routes'
  | 'workOrders'
  | 'meters'
  | 'readings'
  | 'pendingAnomalies';
type Position = { updatedAt: string; id: string; completed: boolean };
type CursorScopeRoute = {
  rutaId: string | null;
  comunidadId: number;
  sectorId: number | null;
};
type Cursor = {
  v: 3;
  operatorId: number;
  periodId: number;
  snapshotVersion: string;
  scope: string;
  scopeRoutes?: CursorScopeRoute[];
  initialComplete: boolean;
  watermark: string;
  positions: Partial<Record<Collection, Position>>;
  sequence: string;
};

@Injectable()
export class GetOperatorSyncManifestUseCase {
  constructor(
    private readonly repository: OperatorRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(
    operatorId: number,
    cursor?: string,
    requestedLimit = 100,
  ): Promise<OperatorSyncManifestDto> {
    const limit = Math.min(Math.max(Number(requestedLimit) || 100, 1), 500);
    const period = await this.repository.findActivePeriod();
    if (!period) throw new EntityNotFoundException('Periodo', 'ABIERTO');
    const routes = await this.repository.findActiveRoutes(
      operatorId,
      period.periodoId,
    );
    const scope = this.scopeFingerprint(routes);
    const state = cursor ? this.decodeCursor(cursor) : null;
    if (
      state &&
      (state.operatorId !== operatorId || state.periodId !== period.periodoId)
    ) {
      throw new ConflictDomainException(
        'El cursor no pertenece al operador o período activo',
      );
    }
    const scopeChanged = state && state.scope !== scope;
    const previousRoutes = state?.scopeRoutes;
    const isActiveScopeRemoval =
      scopeChanged === true &&
      previousRoutes !== undefined &&
      routes.every((route) =>
        previousRoutes.some(
          (previous) =>
            previous.rutaId === (route.rutaId?.toString() ?? null) &&
            previous.comunidadId === route.comunidadId &&
            previous.sectorId === (route.sectorId ?? null),
        ),
      );
    if (scopeChanged && !isActiveScopeRemoval) {
      throw new ConflictDomainException(
        'El alcance de rutas asignadas cambió durante la sincronización',
      );
    }

    if (state?.initialComplete)
      return this.incremental(
        period.periodoId,
        routes,
        state,
        limit,
        isActiveScopeRemoval ? this.routesFromCursor(state) : routes,
      );

    let snapshot: Date;
    let watermark: string;

    if (state) {
      snapshot = new Date(state.snapshotVersion);
      watermark = state.watermark;
    } else {
      const context = this.repository.getSyncSnapshotContext
        ? await this.repository.getSyncSnapshotContext()
        : {
            snapshotVersion: new Date(),
            watermark: this.repository.getSyncWatermark
              ? await this.repository.getSyncWatermark()
              : 0n,
          };
      snapshot = context.snapshotVersion;
      watermark = context.watermark.toString();
    }
    const position = (name: Collection): SyncCursorPosition | null => {
      const value = state?.positions[name];
      return value
        ? { updatedAt: new Date(value.updatedAt), id: BigInt(value.id) }
        : null;
    };
    const completed = (name: Collection) =>
      state?.positions[name]?.completed === true;
    const emptyPage = <T>(): SyncPage<T> => ({
      items: [],
      total: 0,
      hasMore: false,
      nextPosition: null,
    });
    const [routePage, orderPage, meterPage, readingPage, anomalyPage] =
      await Promise.all([
        completed('routes')
          ? emptyPage()
          : this.repository.findSyncRoutes(
              operatorId,
              period.periodoId,
              snapshot,
              position('routes'),
              limit,
            ),
        completed('workOrders')
          ? emptyPage()
          : this.repository.findSyncWorkOrders(
              operatorId,
              period.periodoId,
              routes.flatMap((r) => (r.rutaId ? [r.rutaId] : [])),
              snapshot,
              position('workOrders'),
              limit,
            ),
        completed('meters')
          ? emptyPage()
          : this.repository.findSyncMeters(
              routes,
              snapshot,
              position('meters'),
              limit,
            ),
        completed('readings')
          ? emptyPage()
          : this.repository.findSyncReadings(
              period.periodoId,
              routes,
              snapshot,
              position('readings'),
              limit,
            ),
        completed('pendingAnomalies')
          ? emptyPage()
          : this.repository.findSyncPendingAnomalies(
              operatorId,
              period.periodoId,
              routes,
              snapshot,
              position('pendingAnomalies'),
              limit,
            ),
      ]);
    const pages: Record<Collection, OperatorSyncPage<unknown>> = {
      routes: this.mapPage(routePage, (item) =>
        OperatorRouteResponseDto.fromEntity(item as any),
      ),
      workOrders: this.mapPage(orderPage, (item) => this.workOrderDto(item)),
      meters: this.mapPage(meterPage, (item) =>
        MeterResponseDto.fromEntity(this.toMeterEntity(item)),
      ),
      readings: this.mapPage(readingPage, (item) => this.readingDto(item)),
      pendingAnomalies: this.mapPage(anomalyPage, (item) =>
        OperatorReadingAnomalyResponseDto.fromEntity(item as any),
      ),
    };
    const rawPages = {
      routes: routePage,
      workOrders: orderPage,
      meters: meterPage,
      readings: readingPage,
      pendingAnomalies: anomalyPage,
    };
    const positions: Partial<Record<Collection, Position>> = {};
    for (const name of Object.keys(rawPages) as Collection[]) {
      const page = rawPages[name];
      const previous = state?.positions[name];
      positions[name] = page.nextPosition
        ? {
            updatedAt: page.nextPosition.updatedAt.toISOString(),
            id: page.nextPosition.id.toString(),
            completed: false,
          }
        : {
            updatedAt: previous?.updatedAt ?? snapshot.toISOString(),
            id: previous?.id ?? '0',
            completed: true,
          };
    }
    const complete = Object.values(pages).every((page) => !page.hasMore);
    const nextCursor = this.encodeCursor({
      v: 3,
      operatorId,
      periodId: period.periodoId,
      snapshotVersion: snapshot.toISOString(),
      scope,
      scopeRoutes: routes.map((route) => ({
        rutaId: route.rutaId?.toString() ?? null,
        comunidadId: route.comunidadId,
        sectorId: route.sectorId ?? null,
      })),
      initialComplete: complete,
      watermark,
      positions,
      sequence: watermark,
    });
    for (const page of Object.values(pages))
      page.nextCursor = page.hasMore ? nextCursor : null;
    return new OperatorSyncManifestDto({
      snapshotVersion: snapshot.toISOString(),
      mode: 'snapshot',
      periodId: period.periodoId,
      cursor: cursor ?? null,
      nextCursor,
      complete,
      changes: [],
      ...pages,
    });
  }

  private async incremental(
    periodId: number,
    routes: RouteData[],
    state: Cursor,
    limit: number,
    changeRoutes = routes,
  ): Promise<OperatorSyncManifestDto> {
    const page = await this.repository.findSyncChanges(
      periodId,
      changeRoutes,
      BigInt(state.sequence),
      limit,
    );
    const nextSequence =
      page.nextSequence ??
      page.items.at(-1)?.sequenceId ??
      BigInt(state.sequence);
    const nextCursor = this.encodeCursor({
      ...state,
      sequence: nextSequence.toString(),
    });
    const changes = page.items.map((change) => this.changeDto(change));
    return new OperatorSyncManifestDto({
      snapshotVersion: state.snapshotVersion,
      mode: 'incremental',
      periodId,
      cursor: null,
      nextCursor: page.hasMore ? nextCursor : nextCursor,
      complete: !page.hasMore,
      changes,
      routes: this.emptyResponsePage(),
      workOrders: this.emptyResponsePage(),
      meters: this.emptyResponsePage(),
      readings: this.emptyResponsePage(),
      pendingAnomalies: this.emptyResponsePage(),
    });
  }

  private routesFromCursor(state: Cursor): RouteData[] {
    return (state.scopeRoutes ?? []).map((route) => ({
      rutaId: route.rutaId == null ? undefined : BigInt(route.rutaId),
      comunidadId: route.comunidadId,
      sectorId: route.sectorId,
    }));
  }

  private emptyResponsePage(): OperatorSyncPage<unknown> {
    return { items: [], total: undefined, hasMore: false, nextCursor: null };
  }
  private changeDto(change: OperatorSyncChange): Record<string, unknown> {
    return {
      sequenceId: change.sequenceId.toString(),
      entityType: change.entityType,
      entityId: change.entityId.toString(),
      operation: change.operation,
      changedAt: change.changedAt.toISOString(),
      data: this.sanitizeBigInt(change.data),
    };
  }
  private mapPage<T, R>(
    page: SyncPage<T>,
    map: (item: T) => R,
  ): OperatorSyncPage<R> {
    return {
      items: page.items.map(map),
      total: page.total,
      hasMore: page.hasMore,
      nextCursor: null,
    };
  }

  private decodeCursor(value: string): Cursor {
    try {
      const [encoded, signature] = value.split('.');
      if (
        !encoded ||
        !signature ||
        !/^[A-Za-z0-9_-]+$/.test(encoded) ||
        !/^[A-Za-z0-9_-]+$/.test(signature) ||
        value.length > 4096
      )
        throw new Error();
      const expected = this.sign(encoded);
      if (
        signature.length !== expected.length ||
        !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
      )
        throw new Error();
      const decoded = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8'),
      ) as Cursor;
      if (
        decoded.v !== 3 ||
        !Number.isSafeInteger(decoded.operatorId) ||
        !Number.isSafeInteger(decoded.periodId) ||
        typeof decoded.scope !== 'string' ||
        typeof decoded.snapshotVersion !== 'string' ||
        typeof decoded.watermark !== 'string' ||
        typeof decoded.sequence !== 'string' ||
        !decoded.positions ||
        typeof decoded.initialComplete !== 'boolean' ||
        !Number.isFinite(new Date(decoded.snapshotVersion).getTime()) ||
        !/^\d+$/.test(decoded.watermark) ||
        !/^\d+$/.test(decoded.sequence)
      )
        throw new Error();
      for (const position of Object.values(decoded.positions))
        if (
          !position ||
          typeof position.completed !== 'boolean' ||
          !/^\d+$/.test(position.id) ||
          !Number.isFinite(new Date(position.updatedAt).getTime())
        )
          throw new Error();
      return decoded;
    } catch {
      throw new DomainValidationException('Cursor de sincronización inválido');
    }
  }
  private encodeCursor(value: Cursor): string {
    const encoded = Buffer.from(JSON.stringify(value)).toString('base64url');
    return `${encoded}.${this.sign(encoded)}`;
  }
  private sign(value: string): string {
    const secret = this.config.get<string>('JWT_ACCESS_SECRET');
    if (!secret)
      throw new Error('JWT_ACCESS_SECRET es requerido para firmar cursores');
    return createHmac('sha256', secret).update(value).digest('base64url');
  }
  private scopeFingerprint(routes: RouteData[]): string {
    return createHash('sha256')
      .update(
        JSON.stringify(
          routes
            .map((r) => [
              r.rutaId?.toString() ?? null,
              r.comunidadId,
              r.sectorId,
            ])
            .sort(),
        ),
      )
      .digest('base64url');
  }
  private sanitizeBigInt(value: unknown): unknown {
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((v) => this.sanitizeBigInt(v));
    if (value && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        sanitized[k] = this.sanitizeBigInt(v);
      }
      return sanitized;
    }
    return value;
  }

  private toMeterEntity(m: any): MeterEntity {
    const h = m.historial?.[0]?.contrato;
    return new MeterEntity({
      ...m,
      medidorId: BigInt(m.medidorId),
      latitud: m.latitud == null ? null : Number(m.latitud),
      longitud: m.longitud == null ? null : Number(m.longitud),
      contratoId: h?.contratoId ? BigInt(h.contratoId) : null,
      clienteNombre: h?.cliente
        ? `${h.cliente.nombres} ${h.cliente.apellidos}`.trim()
        : null,
      direccionSuministro: h?.direccionSuministro ?? null,
    });
  }

  private readingDto(r: any): Record<string, unknown> {
    const c = r.medidor?.historial?.[0]?.contrato;
    const sanitizedMedidor = r.medidor
      ? (this.sanitizeBigInt(r.medidor) as Record<string, unknown>)
      : null;
    return {
      ...(this.sanitizeBigInt(r) as Record<string, unknown>),
      lecturaId: r.lecturaId.toString(),
      lecturaAnterior: Number(r.lecturaAnterior),
      lecturaActual: Number(r.lecturaActual),
      consumoCalculado: Number(r.consumoCalculado),
      contratoId: c?.contratoId?.toString() ?? '',
      fechaValidacion: r.fechaValidacion
        ? new Date(r.fechaValidacion).toISOString()
        : null,
      evidenciaFotoUrl: r.evidenciaFotoUrl,
      isValidada: r.estado !== 'PENDIENTE',
      medidor: sanitizedMedidor,
    };
  }

  private workOrderDto(order: any): Record<string, unknown> {
    return {
      ...(this.sanitizeBigInt(order) as Record<string, unknown>),
      ordenTrabajoId: order.ordenTrabajoId.toString(),
      rutaId: order.rutaId.toString(),
      contratoId: order.contratoId ? order.contratoId.toString() : '',
      medidorId: order.medidorId?.toString() ?? null,
      lecturaId: order.lecturaId?.toString() ?? null,
      completadoEn: order.completadoEn
        ? new Date(order.completadoEn).toISOString()
        : null,
      medidor: order.medidor ? this.sanitizeBigInt(order.medidor) : null,
    };
  }
}
