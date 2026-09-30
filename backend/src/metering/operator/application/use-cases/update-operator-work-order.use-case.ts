import { Injectable } from '@nestjs/common';
import { TipoActividadCodes } from 'src/shared/enums';
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

@Injectable()
export class UpdateOperatorWorkOrderUseCase {
  constructor(
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
    private readonly operatorRepository: OperatorRepository,
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
      const hasCompleteCoordinates =
        dto.latitud !== undefined && dto.longitud !== undefined;
      const modifiesReadingWorkflow =
        dto.estado !== undefined ||
        dto.resultadoObservacion !== undefined ||
        dto.completadoEn !== undefined ||
        evidenciaFotoUrl !== undefined;
      if (!hasCompleteCoordinates || modifiesReadingWorkflow) {
        throw new InvalidDomainOperationException(
          'Las órdenes de lectura solo permiten registrar latitud y longitud; los datos de lectura deben actualizarse mediante el flujo de lecturas',
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

    const data: UpdateOperatorWorkOrderData = {
      estado: dto.estado,
      resultadoObservacion: dto.resultadoObservacion,
      evidenciaFotoUrl,
      completadoEn: dto.completadoEn ? new Date(dto.completadoEn) : undefined,
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
