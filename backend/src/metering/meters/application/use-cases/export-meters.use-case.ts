import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { ExportMeterDto } from '../../interfaces/dto/export-meter.dto';
import { buildMeterFilters } from '../mappers/meter-filters.mapper';

@Injectable()
export class ExportMetersUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  execute(filters?: ExportMeterDto): Promise<MeterEntity[]> {
    const meterFilters = filters ? buildMeterFilters(filters) : undefined;
    return this.meterRepository.findMany({ where: meterFilters });
  }
}
