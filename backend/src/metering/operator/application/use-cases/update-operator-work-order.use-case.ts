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
      throw new InvalidDomainOperationException(
        'Las órdenes de lectura deben actualizarse mediante el flujo de lecturas',
      );
    }
    if (order.medidorId === null) {
      throw new InvalidDomainOperationException(
        'La orden no tiene un medidor asignado',
      );
    }

    await this.operatorRepository.verifyMeterOwnership(
      operarioId,
      order.medidorId,
    );

    if (
      order.tipoActividad === TipoActividadCodes.RECONEXION &&
      dto.confirmacionRetiroSello === false
    ) {
      throw new InvalidDomainOperationException(
        'La reconexión requiere confirmar el retiro del sello',
      );
    }

    const hasSeal = dto.estadoSellos !== undefined;
    const hasLeak = dto.hayFugas !== undefined;
    if (
      order.tipoActividad === TipoActividadCodes.INSPECCION &&
      hasSeal !== hasLeak
    ) {
      throw new InvalidDomainOperationException(
        'La inspección requiere informar el estado de sellos y si hay fugas',
      );
    }

    const data: UpdateOperatorWorkOrderData = {
      estado: dto.estado,
      resultadoObservacion: dto.resultadoObservacion,
      evidenciaFotoUrl,
      completadoEn: dto.completadoEn ? new Date(dto.completadoEn) : undefined,
      estadoSellos: dto.estadoSellos,
      hayFugas: dto.hayFugas,
      confirmacionRetiroSello: dto.confirmacionRetiroSello,
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
