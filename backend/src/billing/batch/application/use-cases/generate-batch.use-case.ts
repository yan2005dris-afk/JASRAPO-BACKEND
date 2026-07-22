import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { GenerateBatchDto } from '../../interfaces/dto/generate-batch.dto';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class GenerateBatchUseCase {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(dto: GenerateBatchDto) {
    this.logger.log(`Starting batch generation for period ${dto.periodoId}`);

    const loteId = await this.batchRepository.generate(
      dto.periodoId,
      dto.comunidadId ?? null,
      dto.creadoPor ?? 'SYSTEM',
    );

    return {
      message: 'Batch generated successfully',
      batchId: loteId ? Number(loteId) : null,
    };
  }
}
