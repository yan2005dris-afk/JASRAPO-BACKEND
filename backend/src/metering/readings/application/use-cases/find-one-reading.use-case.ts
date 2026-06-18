import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

@Injectable()
export class FindOneReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(id: bigint): Promise<LecturaEntity> {
    const lectura = await this.readingRepository.findUnique({
      lecturaId: id,
    });
    if (!lectura || lectura.deletedAt !== null) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }
    return lectura;
  }
}
