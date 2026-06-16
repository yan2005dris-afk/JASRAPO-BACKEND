import { Injectable } from '@nestjs/common';
import { BatchRepository } from '../../domain/repositories/batch.repository';

@Injectable()
export class FindOneBatchUseCase {
  constructor(private readonly batchRepository: BatchRepository) {}

  async execute(id: number) {
    return this.batchRepository.findById(id, {
      include: {
        prefacturas: {
          take: 10,
        },
        comunidad: true,
        periodoRel: true,
      },
    });
  }
}
