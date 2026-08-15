import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class RemoveReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const existing = await this.readingRepository.findUnique({
      lecturaId: id,
    });
    if (!existing || existing.deletedAt !== null) {
      throw new EntityNotFoundException('Lectura', id);
    }

    await this.readingRepository.update(
      { lecturaId: id },
      { deletedAt: new Date() },
    );
    return { message: `Lectura con ID ${id} eliminada` };
  }
}
