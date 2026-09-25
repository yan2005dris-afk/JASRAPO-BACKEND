import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type { PeriodEntity } from '../../domain/entities/period.entity';
import { EstadoPeriodo } from 'src/generated/prisma/enums';
import { GenerateAnnualPeriodsDto } from '../../interfaces/dto/generate-annual-periods.dto';

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
    const estado = dto.estadoInicial ?? EstadoPeriodo.PENDIENTE;

    const createdPeriods: PeriodEntity[] = [];

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthName = MONTH_NAMES[monthIndex];
      const periodName = `${monthName} ${year}`;

      // Check if period with this name already exists
      const existing = await this.periodRepository.findByName(periodName);
      if (existing) {
        createdPeriods.push(existing);
        continue;
      }

      // Calculate start and end date of month
      const fechaInicio = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0));
      const fechaFin = new Date(
        Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999),
      );

      // Due date: diaVencimiento of following month
      let dueYear = year;
      let dueMonth = monthIndex + 1;
      if (dueMonth > 11) {
        dueMonth = 0;
        dueYear = year + 1;
      }
      const fechaVencimiento = new Date(
        Date.UTC(dueYear, dueMonth, diaVencimiento, 23, 59, 59, 999),
      );

      const period = await this.periodRepository.create({
        nombre: periodName,
        fechaInicio,
        fechaFin,
        fechaVencimiento,
        estado,
      });

      createdPeriods.push(period);
    }

    return createdPeriods;
  }
}
