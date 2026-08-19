import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import type { ReplaceMeterResult } from '../../domain/types/meter.types';
import type {
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

      const pctCobro =
        input.porcentajeCobro !== undefined
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
