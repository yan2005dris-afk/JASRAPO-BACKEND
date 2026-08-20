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
  solicitadoPorUsuarioId?: string;
  autorizadoPorUsuarioId?: string;
  autorizadoEn?: Date;
  fechaReemplazo?: Date;
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

      const initialEntrante =
        input.lecturaInicialEntrante !== undefined
          ? new Decimal(input.lecturaInicialEntrante.toString())
          : new Decimal(0);

      if (initialEntrante.isNegative()) {
        throw new InvalidDomainOperationException(
          'La lectura inicial del nuevo medidor no puede ser negativa',
        );
      }

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
        if (!input.ventanaPromedio || input.ventanaPromedio <= 0) {
          throw new InvalidDomainOperationException(
            'La ventana de promedio histórico debe ser de al menos 1 mes',
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

        const esPosterior =
          input.periodoDestinoId > input.periodoOrigenId ||
          (input.periodoDestinoId === input.periodoOrigenId &&
            input.mesDestino > mesOrigen);

        if (!esPosterior) {
          throw new InvalidDomainOperationException(
            'El ciclo de facturación destino (período y mes) debe ser posterior al ciclo de origen al diferir el cobro',
          );
        }
      }

      const pctCobro =
        input.porcentajeCobro !== undefined && input.porcentajeCobro !== null
          ? new Decimal(input.porcentajeCobro.toString())
          : undefined;

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
        autorizadoPorUsuarioId: input.autorizadoPorUsuarioId,
        autorizadoEn: input.autorizadoEn,
        fechaReemplazo: input.fechaReemplazo || new Date(),
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
}
