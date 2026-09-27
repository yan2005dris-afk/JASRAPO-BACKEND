import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type { CreatePeriodData } from '../../domain/types/period.types';
import type { PeriodEntity } from '../../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import {
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { DateUtil } from 'src/shared/utils/date.util';

@Injectable()
export class CreatePeriodUseCase {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async execute(data: CreatePeriodData): Promise<PeriodEntity> {
    const trimmedName = data.nombre?.trim();
    if (!trimmedName) {
      throw new InvalidDomainOperationException(
        'El nombre del periodo es requerido',
      );
    }

    const fechaInicio =
      DateUtil.parseFrontendDate(data.fechaInicio) ??
      new Date(data.fechaInicio);
    const fechaFin =
      DateUtil.parseFrontendDate(data.fechaFin) ?? new Date(data.fechaFin);
    const fechaVencimiento =
      DateUtil.parseFrontendDate(data.fechaVencimiento) ??
      new Date(data.fechaVencimiento);

    if (isNaN(fechaInicio.getTime())) {
      throw new InvalidDomainOperationException('Fecha de inicio inválida');
    }
    if (isNaN(fechaFin.getTime())) {
      throw new InvalidDomainOperationException('Fecha de fin inválida');
    }
    if (isNaN(fechaVencimiento.getTime())) {
      throw new InvalidDomainOperationException(
        'Fecha de vencimiento inválida',
      );
    }

    if (fechaInicio > fechaFin) {
      throw new InvalidDomainOperationException(
        'La fecha de inicio no puede ser posterior a la fecha de fin',
      );
    }

    if (fechaFin > fechaVencimiento) {
      throw new InvalidDomainOperationException(
        'La fecha de vencimiento no puede ser anterior a la fecha de fin',
      );
    }

    const existingPeriod = await this.periodRepository.findByName(trimmedName);
    if (existingPeriod) {
      throw new EntityAlreadyExistsException('Periodo', 'nombre', trimmedName);
    }

    const overlapping = await this.periodRepository.findOverlapping(
      fechaInicio,
      fechaFin,
    );
    if (overlapping) {
      throw new InvalidDomainOperationException(
        `El rango de fechas (${DateUtil.formatForFrontend(fechaInicio)} al ${DateUtil.formatForFrontend(fechaFin)}) se solapa con el período existente "${overlapping.nombre}" (${DateUtil.formatForFrontend(overlapping.fechaInicio)} al ${DateUtil.formatForFrontend(overlapping.fechaFin)})`,
      );
    }

    return this.periodRepository.create({
      nombre: trimmedName,
      fechaInicio,
      fechaFin,
      fechaVencimiento,
      estado: data.estado ?? EstadoPeriodo.ABIERTO,
    });
  }
}
