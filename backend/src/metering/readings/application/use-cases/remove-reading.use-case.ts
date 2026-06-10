import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';

@Injectable()
export class RemoveReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const existing = await this.readingRepository.findUnique({
      lecturaId: id,
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    await this.readingRepository.update(
      { lecturaId: id },
      { deletedAt: new Date() },
    );
    return { message: `Lectura con ID ${id} eliminada` };
  }
}
