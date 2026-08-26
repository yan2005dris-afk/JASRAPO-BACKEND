import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

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

    const isLinked =
      await this.readingRepository.isReadingLinkedToReplacement(id);
    if (isLinked) {
      throw new InvalidDomainOperationException(
        'No se puede eliminar una lectura vinculada a un reemplazo de medidor auditado',
      );
    }

    await this.readingRepository.update(
      { lecturaId: id },
      { deletedAt: new Date() },
    );
    return { message: `Lectura con ID ${id} eliminada` };
  }
}
