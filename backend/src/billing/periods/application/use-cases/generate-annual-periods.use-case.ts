import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type { PeriodEntity } from '../../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import { GenerateAnnualPeriodsDto } from '../../interfaces/dto/generate-annual-periods.dto';
import type { CreatePeriodData } from '../../domain/types/period.types';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

@Injectable()
export class GenerateAnnualPeriodsUseCase {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async execute(dto: GenerateAnnualPeriodsDto): Promise<PeriodEntity[]> {
    const year = dto.year;
    const diaVencimiento = dto.diaVencimiento ?? 15;
    const estado = dto.estadoInicial ?? EstadoPeriodo.CERRADO;

    // 1. Precalculate 12-month period definitions
    const periodDefinitions: CreatePeriodData[] = MONTH_NAMES.map(
      (monthName, monthIndex) => {
        const periodName = `${monthName} ${year}`;
        const fechaInicio = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
        const fechaFin = new Date(
          Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999),
        );

        let dueYear = year;
        let dueMonth = monthIndex + 1;
        if (dueMonth > 11) {
          dueMonth = 0;
          dueYear = year + 1;
        }
        const fechaVencimiento = new Date(
          Date.UTC(dueYear, dueMonth, diaVencimiento, 23, 59, 59, 999),
        );

        return {
          nombre: periodName,
          fechaInicio,
          fechaFin,
          fechaVencimiento,
          estado,
        };
      },
    );

    // 2. Fetch existing periods in a single query (batch read)
    const allNames = periodDefinitions.map((p) => p.nombre);
    const existingPeriods = await this.periodRepository.findByNames(allNames);
    const existingNames = new Set(existingPeriods.map((p) => p.nombre));

    // 3. Filter missing periods and create them in an atomic batch
    const toCreate = periodDefinitions.filter(
      (p) => !existingNames.has(p.nombre),
    );
    const newlyCreatedPeriods =
      await this.periodRepository.createBatch(toCreate);

    // 4. Return all 12 periods ordered chronologically
    const allPeriods = [...existingPeriods, ...newlyCreatedPeriods];
    return allPeriods.sort(
      (a, b) => a.fechaInicio.getTime() - b.fechaInicio.getTime(),
    );
  }
}
