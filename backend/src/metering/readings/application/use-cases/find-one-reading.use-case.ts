import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(id: bigint): Promise<LecturaEntity> {
    const lectura = await this.readingRepository.findUnique({
      lecturaId: id,
    });
    if (!lectura || lectura.deletedAt !== null) {
      throw new EntityNotFoundException('Lectura', id);
    }
    return lectura;
  }
}
