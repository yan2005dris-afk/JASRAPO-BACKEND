import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { safeReadingsSelect } from '../../types/IResponseReading';
import { toReadingResponse } from '../../types/readingMapper';

@Injectable()
export class FindOneReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(id: bigint) {
    const lectura = await this.readingRepository.findUnique(
      { lecturaId: id },
      safeReadingsSelect,
    );
    if (!lectura || lectura.deletedAt !== null) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }
    return toReadingResponse(lectura);
  }
}
