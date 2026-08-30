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
type Cursor = {
  v: 2;
  operatorId: number;
  periodId: number;
  snapshotVersion: string;
  scope: string;
  positions: Partial<
    Record<Collection, { updatedAt: string; id: string; completed: boolean }>
  >;
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
    if (state && state.scope !== scope) {
      throw new ConflictDomainException(
        'El alcance de rutas asignadas cambió durante la sincronización',
      );
    }
    const snapshot = state ? new Date(state.snapshotVersion) : new Date();
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
      routes: this.mapPage(routePage as SyncPage<any>, (item) =>
        OperatorRouteResponseDto.fromEntity(item),
      ),
      workOrders: this.mapPage(orderPage, (item) => this.workOrderDto(item)),
      meters: this.mapPage(meterPage, (item) =>
        MeterResponseDto.fromEntity(this.toMeterEntity(item)),
      ),
      readings: this.mapPage(readingPage, (item) => this.readingDto(item)),
      pendingAnomalies: this.mapPage(anomalyPage as SyncPage<any>, (item) =>
        OperatorReadingAnomalyResponseDto.fromEntity(item),
      ),
    };
    const nextState: Cursor = {
      v: 2,
      operatorId,
      periodId: period.periodoId,
      snapshotVersion: snapshot.toISOString(),
      scope,
      positions: {},
    };
    for (const name of Object.keys(pages) as Collection[]) {
      const page = [routePage, orderPage, meterPage, readingPage, anomalyPage][
        (
          [
            'routes',
            'workOrders',
            'meters',
            'readings',
            'pendingAnomalies',
          ] as Collection[]
        ).indexOf(name)
      ];
      const previous = state?.positions[name];
      nextState.positions[name] = page.nextPosition
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
    const encoded = this.encodeCursor(nextState);
    for (const page of Object.values(pages))
      page.nextCursor = page.hasMore ? encoded : null;
    return new OperatorSyncManifestDto({
      snapshotVersion: snapshot.toISOString(),
      periodId: period.periodoId,
      cursor: cursor ?? null,
      complete: Object.values(pages).every((page) => !page.hasMore),
      ...pages,
    });
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
        decoded.v !== 2 ||
        !Number.isSafeInteger(decoded.operatorId) ||
        !Number.isSafeInteger(decoded.periodId) ||
        typeof decoded.scope !== 'string' ||
        typeof decoded.snapshotVersion !== 'string' ||
        !decoded.positions ||
        !Number.isFinite(new Date(decoded.snapshotVersion).getTime())
      )
        throw new Error();
      for (const position of Object.values(decoded.positions)) {
        if (
          !position ||
          typeof position.completed !== 'boolean' ||
          !/^[0-9]+$/.test(position.id) ||
          !Number.isFinite(new Date(position.updatedAt).getTime())
        )
          throw new Error();
      }
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

  private toMeterEntity(m: any): MeterEntity {
    const h = m.historial?.[0]?.contrato;
    return new MeterEntity({
      ...m,
      latitud: m.latitud == null ? null : Number(m.latitud),
      longitud: m.longitud == null ? null : Number(m.longitud),
      contratoId: h?.contratoId ?? null,
      clienteNombre: h?.cliente
        ? `${h.cliente.nombres} ${h.cliente.apellidos}`.trim()
        : null,
      direccionSuministro: h?.direccionSuministro ?? null,
    });
  }
  private readingDto(r: any): Record<string, unknown> {
    const c = r.medidor?.historial?.[0]?.contrato;
    return {
      lecturaId: r.lecturaId.toString(),
      fecha: r.fecha,
      lecturaAnterior: Number(r.lecturaAnterior),
      lecturaActual: Number(r.lecturaActual),
      consumoCalculado: Number(r.consumoCalculado),
      contratoId: c?.contratoId?.toString() ?? '',
      descripcionAnomalia: r.descripcionAnomalia,
      fechaValidacion: r.fechaValidacion,
      evidenciaFotoUrl: r.evidenciaFotoUrl,
      isValidada: r.estado !== 'PENDIENTE',
      lecturaInicial: r.lecturaInicial,
      periodoId: r.periodoId,
      tieneAnomalia: !!r.descripcionAnomalia,
      estado: r.estado,
      medidor: r.medidor
        ? { ...r.medidor, medidorId: r.medidor.medidorId.toString() }
        : null,
      periodoRel: r.periodoRel,
    };
  }
  private workOrderDto(order: any): Record<string, unknown> {
    return {
      ordenTrabajoId: order.ordenTrabajoId.toString(),
      rutaId: order.rutaId.toString(),
      tipoActividad: order.tipoActividad,
      estado: order.estado,
      ordenVisita: order.ordenVisita,
      resultadoObservacion: order.resultadoObservacion,
      evidenciaFotoUrl: order.evidenciaFotoUrl,
      completadoEn: order.completadoEn?.toISOString(),
      lecturaId: order.lecturaId?.toString() ?? null,
      contrato: {
        numeroContrato: order.contrato.numeroGuia,
        clienteNombre:
          `${order.contrato.cliente.nombres} ${order.contrato.cliente.apellidos}`.trim(),
        direccion: order.contrato.direccionSuministro,
      },
      medidor: order.medidor
        ? { ...order.medidor, medidorId: order.medidor.medidorId.toString() }
        : null,
    };
  }
}
