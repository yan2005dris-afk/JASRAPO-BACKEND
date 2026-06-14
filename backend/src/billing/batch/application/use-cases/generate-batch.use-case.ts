import { Injectable, Logger } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';
import { GenerateBatchDto } from '../../interfaces/dto/generate-batch.dto';

@Injectable()
export class GenerateBatchUseCase {
  private readonly logger = new Logger(GenerateBatchUseCase.name);

  constructor(private readonly batchRepository: BatchRepository) {}

  async execute(dto: GenerateBatchDto) {
    this.logger.log(
      `Starting batch generation for period ${dto.periodoId}`,
    );

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
