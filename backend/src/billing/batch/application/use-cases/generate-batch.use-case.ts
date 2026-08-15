import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import type {
  GenerateBatchData,
  GenerateBatchResult,
} from '../../domain/types/batch.types';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class GenerateBatchUseCase {
  constructor(
    private readonly batchRepository: BatchRepository,
    private readonly logger: LoggerService,
  ) {}

  async execute(data: GenerateBatchData): Promise<GenerateBatchResult> {
    this.logger.log(`Starting batch generation for period ${data.periodoId}`);

    const loteId = await this.batchRepository.generate({
      periodoId: data.periodoId,
      comunidadId: data.comunidadId ?? null,
      creadoPor: data.creadoPor ?? 'SYSTEM',
    });

    return {
      message: 'Batch generated successfully',
      batchId: loteId ? Number(loteId) : null,
    };
  }
}
