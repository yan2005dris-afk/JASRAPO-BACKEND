import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import type { MeterRow } from '../../infrastructure/repositories/meter.include';
import { ExportMeterDto } from '../../interfaces/dto/export-meter.dto';
import { buildMeterFilters } from '../mappers/meter-filters.mapper';

@Injectable()
export class ExportMetersUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  execute(filters?: ExportMeterDto): Promise<MeterRow[]> {
    const meterFilters = filters ? buildMeterFilters(filters) : undefined;
    return this.meterRepository.findMany({ where: meterFilters });
  }
}
