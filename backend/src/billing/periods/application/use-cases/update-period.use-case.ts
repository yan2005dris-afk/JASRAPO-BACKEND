import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type {
  UpdatePeriodData,
  PeriodRow,
} from '../../domain/types/period.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { DateUtil } from 'src/shared/utils/date.util';

@Injectable()
export class UpdatePeriodUseCase {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async execute(id: number, data: UpdatePeriodData): Promise<PeriodRow> {
    const existing = await this.periodRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Periodo', id);
    }

    // Validate name uniqueness if being changed
    if (data.nombre !== undefined) {
      const trimmedName = data.nombre.trim();
      if (!trimmedName) {
        throw new InvalidDomainOperationException(
          'El nombre del periodo no puede estar vacío',
        );
      }
      if (trimmedName !== existing.nombre) {
        const withSameName =
          await this.periodRepository.findByName(trimmedName);
        if (withSameName && withSameName.periodoId !== id) {
          throw new EntityAlreadyExistsException(
            'Periodo',
            'nombre',
            trimmedName,
          );
        }
      }
    }

    // Validate dates if any date is being changed
    const effectiveFechaInicio =
      data.fechaInicio !== undefined
        ? (DateUtil.parseFrontendDate(data.fechaInicio) ??
          new Date(data.fechaInicio))
        : existing.fechaInicio;

    const effectiveFechaFin =
      data.fechaFin !== undefined
        ? (DateUtil.parseFrontendDate(data.fechaFin) ?? new Date(data.fechaFin))
        : existing.fechaFin;

    const effectiveFechaVencimiento =
      data.fechaVencimiento !== undefined
        ? (DateUtil.parseFrontendDate(data.fechaVencimiento) ??
          new Date(data.fechaVencimiento))
        : existing.fechaVencimiento;

    if (isNaN(effectiveFechaInicio.getTime())) {
      throw new InvalidDomainOperationException('Fecha de inicio inválida');
    }
    if (isNaN(effectiveFechaFin.getTime())) {
      throw new InvalidDomainOperationException('Fecha de fin inválida');
    }
    if (isNaN(effectiveFechaVencimiento.getTime())) {
      throw new InvalidDomainOperationException(
        'Fecha de vencimiento inválida',
      );
    }

    if (effectiveFechaInicio > effectiveFechaFin) {
      throw new InvalidDomainOperationException(
        'La fecha de inicio no puede ser posterior a la fecha de fin',
      );
    }

    if (effectiveFechaFin > effectiveFechaVencimiento) {
      throw new InvalidDomainOperationException(
        'La fecha de vencimiento no puede ser anterior a la fecha de fin',
      );
    }

    const overlapping = await this.periodRepository.findOverlapping(
      effectiveFechaInicio,
      effectiveFechaFin,
      id,
    );
    if (overlapping) {
      throw new InvalidDomainOperationException(
        `El rango de fechas (${DateUtil.formatForFrontend(effectiveFechaInicio)} al ${DateUtil.formatForFrontend(effectiveFechaFin)}) se solapa con el período existente "${overlapping.nombre}" (${DateUtil.formatForFrontend(overlapping.fechaInicio)} al ${DateUtil.formatForFrontend(overlapping.fechaFin)})`,
      );
    }

    return this.periodRepository.update(id, {
      ...data,
      nombre: data.nombre !== undefined ? data.nombre.trim() : undefined,
      fechaInicio:
        data.fechaInicio !== undefined ? effectiveFechaInicio : undefined,
      fechaFin: data.fechaFin !== undefined ? effectiveFechaFin : undefined,
      fechaVencimiento:
        data.fechaVencimiento !== undefined
          ? effectiveFechaVencimiento
          : undefined,
    });
  }
}
