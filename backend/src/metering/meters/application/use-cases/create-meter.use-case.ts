import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { CreateMeterDto } from '../../interfaces/dto/create-meter.dto';
import type { MeterRow } from '../../infrastructure/repositories/meter.include';
import { EstadoMedidor } from 'src/shared/enums';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class CreateMeterUseCase {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(createDto: CreateMeterDto): Promise<MeterRow> {
    try {
      return await this.meterRepository.create({
        marca: createDto.marca,
        modelo: createDto.modelo,
        serie: createDto.serie,
        estado: EstadoMedidor.BODEGA,
      });
    } catch (error) {
      this.logger.error(
        `Failed to create meter with serial ${createDto.serie}`,
        error instanceof Error ? error.stack : String(error),
        CreateMeterUseCase.name,
      );
      throw error;
    }
  }
}
