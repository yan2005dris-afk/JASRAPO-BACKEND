import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import type { ReplaceMeterResult } from '../../domain/types/meter.types';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
} from 'src/shared/enums';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import { createHash } from 'node:crypto';

export interface ReplaceMeterInput {
  contratoId: bigint;
  nuevoMedidorId: bigint;
  lecturaFinalSaliente: number | string | Decimal;
  lecturaInicialEntrante?: number | string | Decimal;
  motivo: MotivoReemplazoMedidor;
  responsabilidadDano?: ResponsabilidadDano;
  detalleMotivo?: string;
  tratamientoSaliente: TratamientoSaliente;
  tratamientoEntrante: TratamientoEntrante;
  porcentajeCobro?: number | string | Decimal;
  ventanaPromedio?: number;
  periodoOrigenId: number;
  periodoDestinoId?: number;
  mesOrigen?: number;
  mesDestino?: number;
  ordenTrabajoId?: bigint;
  solicitadoPorUsuarioId: number;
  autorizadoPorUsuarioId?: number;
  autorizadoEn?: Date;
  fechaReemplazo?: Date;
  claveIdempotencia: string;
  userRole?: string;
}

@LogContext()
@Injectable()
export class ReplaceMeterUseCase {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(input: ReplaceMeterInput): Promise<ReplaceMeterResult> {
    try {
      const finalSaliente = new Decimal(input.lecturaFinalSaliente.toString());
      if (finalSaliente.isNegative()) {
        throw new InvalidDomainOperationException(
          'La lectura final del medidor saliente no puede ser negativa',
        );
      }

      // Solo admin/superadmin puede definir lecturaInicialEntrante; para otros roles se fuerza a 0
      const isAdmin =
        input.userRole?.toLowerCase() === 'admin' ||
        input.userRole?.toLowerCase() === 'superadmin';
      const initialEntrante =
        isAdmin && input.lecturaInicialEntrante !== undefined
          ? new Decimal(input.lecturaInicialEntrante.toString())
          : new Decimal(0);

      this.validateConditionalFields(input);

      if (input.tratamientoSaliente === TratamientoSaliente.COBRO_PARCIAL) {
        if (
          input.porcentajeCobro === undefined ||
          input.porcentajeCobro === null
        ) {
          throw new InvalidDomainOperationException(
            'El porcentaje de cobro es obligatorio cuando el tratamiento es COBRO_PARCIAL',
          );
        }
        const pct = new Decimal(input.porcentajeCobro.toString());
        if (pct.lessThan(1) || pct.greaterThan(100)) {
          throw new InvalidDomainOperationException(
            'El porcentaje de cobro parcial debe estar entre 1% y 100%',
          );
        }
      }

      if (
        input.tratamientoSaliente === TratamientoSaliente.PROMEDIO_HISTORICO
      ) {
        if (![3, 6].includes(input.ventanaPromedio ?? 0)) {
          throw new InvalidDomainOperationException(
            'La ventana de promedio histórico debe ser de 3 o 6 meses',
          );
        }
      }

      const mesOrigen = input.mesOrigen || new Date().getMonth() + 1;

      if (
        input.tratamientoEntrante ===
        TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO
      ) {
        if (!input.periodoDestinoId || !input.mesDestino) {
          throw new InvalidDomainOperationException(
            'El período y mes destino son obligatorios cuando se difiere el cobro del medidor entrante',
          );
        }

        const esPosteriorInmediato =
          (mesOrigen < 12 &&
            input.periodoDestinoId === input.periodoOrigenId &&
            input.mesDestino === mesOrigen + 1) ||
          (mesOrigen === 12 &&
            input.periodoDestinoId !== input.periodoOrigenId &&
            input.mesDestino === 1);

        if (!esPosteriorInmediato) {
          throw new InvalidDomainOperationException(
            'El ciclo destino debe ser el ciclo mensual inmediatamente posterior al origen',
          );
        }
      }

      const pctCobro =
        input.porcentajeCobro !== undefined && input.porcentajeCobro !== null
          ? new Decimal(input.porcentajeCobro.toString())
          : undefined;
      const requiereAprobacion =
        input.tratamientoSaliente !== TratamientoSaliente.COBRO_REAL ||
        input.tratamientoEntrante !==
          TratamientoEntrante.FACTURAR_PERIODO_ACTUAL;
      const huellaSolicitud = this.createFingerprint(input, mesOrigen);

      return await this.meterRepository.replaceMeter({
        contratoId: input.contratoId,
        nuevoMedidorId: input.nuevoMedidorId,
        lecturaFinalSaliente: finalSaliente,
        lecturaInicialEntrante: initialEntrante,
        motivo: input.motivo,
        responsabilidadDano: input.responsabilidadDano,
        detalleMotivo: input.detalleMotivo,
        tratamientoSaliente: input.tratamientoSaliente,
        tratamientoEntrante: input.tratamientoEntrante,
        porcentajeCobro: pctCobro,
        ventanaPromedio: input.ventanaPromedio,
        periodoOrigenId: input.periodoOrigenId,
        periodoDestinoId: input.periodoDestinoId,
        mesOrigen,
        mesDestino: input.mesDestino,
        ordenTrabajoId: input.ordenTrabajoId,
        solicitadoPorUsuarioId: input.solicitadoPorUsuarioId,
        autorizadoPorUsuarioId: requiereAprobacion
          ? undefined
          : input.solicitadoPorUsuarioId,
        autorizadoEn: requiereAprobacion
          ? undefined
          : (input.autorizadoEn ?? new Date()),
        fechaReemplazo: input.fechaReemplazo || new Date(),
        claveIdempotencia: input.claveIdempotencia,
        huellaSolicitud,
        requiereAprobacion,
      });
    } catch (error) {
      this.logger.error(
        `Error al reemplazar medidor en contrato #${input.contratoId}`,
        error instanceof Error ? error.stack : String(error),
        ReplaceMeterUseCase.name,
      );
      throw error;
    }
  }

  async approve(
    reemplazoId: bigint,
    autorizadoPorUsuarioId: number,
  ): Promise<ReplaceMeterResult> {
    return this.meterRepository.approveReplacement({
      reemplazoId,
      autorizadoPorUsuarioId,
    });
  }

  private validateConditionalFields(input: ReplaceMeterInput): void {
    if (
      input.motivo === MotivoReemplazoMedidor.OTRO &&
      !input.detalleMotivo?.trim()
    ) {
      throw new InvalidDomainOperationException(
        'El detalle del motivo es obligatorio cuando el motivo es OTRO',
      );
    }
    if (
      input.motivo === MotivoReemplazoMedidor.DANO &&
      (!input.responsabilidadDano ||
        input.responsabilidadDano === ResponsabilidadDano.NO_APLICA)
    ) {
      throw new InvalidDomainOperationException(
        'Debe establecer la responsabilidad cuando el motivo es DANO',
      );
    }
    if (
      input.motivo !== MotivoReemplazoMedidor.DANO &&
      input.responsabilidadDano &&
      input.responsabilidadDano !== ResponsabilidadDano.NO_APLICA
    ) {
      throw new InvalidDomainOperationException(
        'La responsabilidad de daño solo aplica cuando el motivo es DANO',
      );
    }
    if (
      input.tratamientoSaliente !== TratamientoSaliente.COBRO_PARCIAL &&
      input.porcentajeCobro !== undefined
    ) {
      throw new InvalidDomainOperationException(
        'El porcentaje de cobro solo aplica a COBRO_PARCIAL',
      );
    }
    if (
      input.tratamientoSaliente !== TratamientoSaliente.PROMEDIO_HISTORICO &&
      input.ventanaPromedio !== undefined
    ) {
      throw new InvalidDomainOperationException(
        'La ventana de promedio solo aplica a PROMEDIO_HISTORICO',
      );
    }
    if (
      input.tratamientoEntrante !==
        TratamientoEntrante.DIFERIR_SIGUIENTE_PERIODO &&
      (input.periodoDestinoId !== undefined || input.mesDestino !== undefined)
    ) {
      throw new InvalidDomainOperationException(
        'El ciclo destino solo aplica cuando el consumo se difiere',
      );
    }
  }

  private createFingerprint(
    input: ReplaceMeterInput,
    mesOrigen: number,
  ): string {
    const canonical = JSON.stringify({
      ...input,
      contratoId: input.contratoId.toString(),
      nuevoMedidorId: input.nuevoMedidorId.toString(),
      ordenTrabajoId: input.ordenTrabajoId?.toString(),
      lecturaFinalSaliente: input.lecturaFinalSaliente.toString(),
      lecturaInicialEntrante: input.lecturaInicialEntrante?.toString() ?? '0',
      porcentajeCobro: input.porcentajeCobro?.toString(),
      mesOrigen,
      fechaReemplazo: input.fechaReemplazo?.toISOString(),
    });
    return createHash('sha256').update(canonical).digest('hex');
  }
}
