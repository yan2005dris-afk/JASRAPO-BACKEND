import { Injectable } from '@nestjs/common';
import { EstadoRuta, TipoActividadCodes } from 'src/shared/enums';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { OrdenTrabajoRepository } from 'src/operations/routes/domain/repositories/orden-trabajo.repository';
import type { OrdenTrabajoEntity } from 'src/operations/routes/domain/entities/orden-trabajo.entity';
import type { UpdateOperatorWorkOrderData } from 'src/operations/routes/domain/types/orden-trabajo.types';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import { UpdateOperatorWorkOrderDto } from '../../interfaces/dto/update-operator-work-order.dto';
import type { EvidenceReplacementCleanup } from './update-operator-reading.use-case';

import { UpdateReadingUseCase } from 'src/metering/readings/application/use-cases/update-reading.use-case';
import { ActualizarLecturaDto } from 'src/metering/readings/interfaces/dto/update-lectura.dto';
import { EstadoLectura, EstadoOrdenTrabajo } from 'src/shared/enums';

@Injectable()
export class UpdateOperatorWorkOrderUseCase {
  constructor(
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
    private readonly operatorRepository: OperatorRepository,
    private readonly updateReadingUseCase: UpdateReadingUseCase,
  ) {}

  async execute(
    id: bigint,
    operarioId: number,
    dto: UpdateOperatorWorkOrderDto,
    evidenciaFotoUrl?: string,
    cleanupOldEvidence?: EvidenceReplacementCleanup,
  ): Promise<OrdenTrabajoEntity> {
    const order = await this.ordenTrabajoRepository.findById(id);
    if (!order) {
      throw new EntityNotFoundException('Orden de Trabajo', id.toString());
    }

    if (order.tipoActividad === TipoActividadCodes.LECTURA) {
      const isSubmittingReading = dto.lecturaActual !== undefined;
      const hasCoordinates =
        dto.latitud !== undefined || dto.longitud !== undefined;

      if (!isSubmittingReading && !hasCoordinates) {
        throw new InvalidDomainOperationException(
          'Las órdenes de lectura requieren registrar la lectura actual o coordenadas GPS',
        );
      }

      if (isSubmittingReading && !order.lecturaId) {
        throw new InvalidDomainOperationException(
          'La orden de lectura no tiene una lectura asociada para registrar el valor',
        );
      }
    }
    if (order.medidorId === null) {
      // Sin medidor no hay ownership por medidor: se valida que el operario
      // esté asignado a esta orden concreta (ruta abierta, periodo ABIERTO).
      // GPS, observación, foto y completadoEn no requieren medidor.
      await this.ordenTrabajoRepository.verifyOperatorWorkOrderOwnership(
        operarioId,
        id,
      );
    } else {
      await this.operatorRepository.verifyMeterOwnership(
        operarioId,
        order.medidorId,
      );
    }

    // Si la ruta asociada se encuentra en estado PENDIENTE, transicionarla a EN_PROGRESO
    if (order.rutaId) {
      try {
        await this.operatorRepository.updateRouteState(
          order.rutaId,
          {
            estado: EstadoRuta.EN_PROGRESO,
            fechaInicio: new Date(),
          },
          EstadoRuta.PENDIENTE,
        );
      } catch {
        // Ignorar si ya fue transicionada concurrentemente o no estaba en PENDIENTE
      }
    }

    if (
      order.tipoActividad === TipoActividadCodes.LECTURA &&
      dto.lecturaActual !== undefined &&
      order.lecturaId
    ) {
      const readingUpdateDto: ActualizarLecturaDto = {
        lecturaActual: dto.lecturaActual,
        lecturaAnterior: dto.lecturaAnterior,
        descripcionAnomalia: dto.descripcionAnomalia,
        fecha: dto.fechaLectura ?? dto.completadoEn ?? new Date().toISOString(),
      };

      await this.updateReadingUseCase.execute(
        order.lecturaId,
        readingUpdateDto,
        dto.descripcionAnomalia
          ? EstadoLectura.CON_NOVEDAD
          : EstadoLectura.POR_REVISION,
      );
    }

    const isReadingSubmission =
      order.tipoActividad === TipoActividadCodes.LECTURA &&
      dto.lecturaActual !== undefined;

    const data: UpdateOperatorWorkOrderData = {
      estado: dto.estado,
      resultadoObservacion: dto.resultadoObservacion ?? dto.descripcionAnomalia,
      evidenciaFotoUrl,
      completadoEn: dto.completadoEn
        ? new Date(dto.completadoEn)
        : isReadingSubmission
          ? new Date()
          : undefined,
      latitud: dto.latitud,
      longitud: dto.longitud,
    };

    const updated = await this.ordenTrabajoRepository.updateOperatorWorkOrder(
      id,
      data,
    );
    if (evidenciaFotoUrl && order.evidenciaFotoUrl && cleanupOldEvidence) {
      await cleanupOldEvidence(order.evidenciaFotoUrl, evidenciaFotoUrl);
    }
    return updated;
  }
}
