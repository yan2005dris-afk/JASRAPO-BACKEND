import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import type {
  GenerateBatchData,
  GenerateBatchResult,
} from '../../domain/types/batch.types';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import {
  InvalidDomainOperationException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@LogContext()
@Injectable()
export class GenerateBatchUseCase {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(data: GenerateBatchData): Promise<GenerateBatchResult> {
    this.logger.log(`Starting batch generation for period ${data.periodoId}`);

    // 1. Validar si ya existe un lote para este período y comunidad
    const existingCount = await this.batchRepository.count({
      periodoId: data.periodoId,
      ...(data.comunidadId ? { comunidadId: data.comunidadId } : {}),
    });

    if (existingCount > 0) {
      throw new InvalidDomainOperationException(
        'Ya existe un lote de prefacturas generado para este período y comunidad. Revise el listado de lotes para consultar o aprobar.',
      );
    }

    try {
      const loteId = await this.batchRepository.generate({
        periodoId: data.periodoId,
        comunidadId: data.comunidadId ?? null,
        creadoPor: data.creadoPor ?? 'SYSTEM',
      });

      if (!loteId) {
        throw new InvalidDomainOperationException(
          'No se pudo generar el lote. Verifique que existan lecturas en estado APROBADA para los contratos de esta comunidad.',
        );
      }

      return {
        message: 'Lote de prefacturas generado exitosamente',
        batchId: Number(loteId),
      };
    } catch (err: any) {
      if (err instanceof InvalidDomainOperationException) {
        throw err;
      }
      const rawMessage = err?.message || '';
      if (rawMessage.includes('uk_lote_comunidad_periodo') || rawMessage.includes('unique constraint')) {
        throw new InvalidDomainOperationException(
          'Ya existe un lote de prefacturas registrado para esta comunidad y período.',
        );
      }
      if (rawMessage.includes('Rubros requeridos no encontrados')) {
        throw new InvalidDomainOperationException(
          'Faltan rubros base configurados en el sistema (código SRI 001, 002, 003, 004).',
        );
      }
      throw new InvalidDomainOperationException(
        `No se pudo generar el lote: ${rawMessage.split('\n')[0]}`,
      );
    }
  }
}
