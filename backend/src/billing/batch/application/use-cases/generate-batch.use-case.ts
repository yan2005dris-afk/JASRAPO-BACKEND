import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { RouteRepository } from 'src/operations/routes/domain/repositories/route.repository';
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
    private readonly routeRepository: RouteRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(data: GenerateBatchData): Promise<GenerateBatchResult> {
    this.logger.log(`Starting batch generation for period ${data.periodoId}`);

    // 0. La generación SIEMPRE sale de una ruta de trabajo de TOMA_LECTURA COMPLETADA
    const rutaId = BigInt(data.rutaId);
    const ruta = await this.routeRepository.findById(rutaId);

    if (!ruta) {
      throw new InvalidDomainOperationException(
        'La ruta de trabajo seleccionada no existe o fue eliminada.',
      );
    }

    if (ruta.tipoRuta !== 'TOMA_LECTURA') {
      throw new InvalidDomainOperationException(
        'Solo se pueden generar lotes de prefacturas desde rutas de tipo TOMA_LECTURA.',
      );
    }

    if (ruta.estado !== 'COMPLETADA') {
      throw new InvalidDomainOperationException(
        'La ruta de trabajo debe estar en estado COMPLETADA para generar el lote de prefacturas.',
      );
    }

    if (ruta.periodoId !== null && Number(ruta.periodoId) !== Number(data.periodoId)) {
      throw new InvalidDomainOperationException(
        'La ruta seleccionada pertenece a un período diferente al indicado.',
      );
    }

    if (data.comunidadId && Number(ruta.comunidadId) !== Number(data.comunidadId)) {
      throw new InvalidDomainOperationException(
        'La ruta seleccionada pertenece a una comunidad diferente a la indicada.',
      );
    }

    // 1. Validar si ya existe un lote generado desde esta misma ruta
    const existingCount = await this.batchRepository.count({
      periodoId: data.periodoId,
      mes: data.mes,
      rutaId,
      ...(data.comunidadId ? { comunidadId: data.comunidadId } : {}),
    });

    if (existingCount > 0) {
      throw new InvalidDomainOperationException(
        'Ya existe un lote de prefacturas generado para esta ruta, período, mes y comunidad. Revise el listado de lotes para consultar o aprobar.',
      );
    }

    try {
      const loteId = await this.batchRepository.generate({
        periodoId: data.periodoId,
        mes: data.mes,
        comunidadId: data.comunidadId ?? ruta.comunidadId,
        rutaId,
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
      if (rawMessage.includes('uk_lote_comunidad_periodo_mes') || rawMessage.includes('unique constraint')) {
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
