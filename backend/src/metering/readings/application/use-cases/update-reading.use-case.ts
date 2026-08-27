import { Injectable } from '@nestjs/common';
import { EstadoLectura } from 'src/shared/enums';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import type { UpdateReadingRepositoryData } from '../../domain/repositories/reading.repository';
import { ActualizarLecturaDto } from '../../interfaces/dto/update-lectura.dto';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { canTransitionReadingState } from '../../domain/reading-state';

@Injectable()
export class UpdateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  /**
   * Actualiza una lectura.
   *
   * @param id - ID de la lectura
   * @param updateDto - Campos a actualizar
   * @param targetEstado - Estado destino (opcional). Si se provee, la state
   *                       machine valida que la transición desde el estado
   *                       actual sea legal y el update se hace vía CAS
   *                       (compare-and-swap) para evitar TOCTOU.
   */
  async execute(
    id: bigint,
    updateDto: ActualizarLecturaDto,
    targetEstado?: EstadoLectura,
  ): Promise<LecturaEntity> {
    const existing = await this.readingRepository.findUnique({
      lecturaId: id,
    });

    if (!existing || existing.deletedAt) {
      throw new EntityNotFoundException('Lectura', id);
    }

    const isLinked =
      await this.readingRepository.isReadingLinkedToReplacement(id);
    if (isLinked) {
      throw new InvalidDomainOperationException(
        'No se puede modificar una lectura vinculada a un reemplazo de medidor auditado',
      );
    }

    // Build update payload — solo campos que el usuario envió
    const dataToUpdate = Object.fromEntries(
      Object.entries(updateDto).filter(([_, v]) => v !== undefined),
    ) as Partial<UpdateReadingRepositoryData>;

    if (targetEstado) {
      // State machine validation
      const currentEstado = existing.estado as EstadoLectura;
      if (!canTransitionReadingState(currentEstado, targetEstado)) {
        throw new InvalidDomainOperationException(
          `No se puede cambiar el estado de ${currentEstado} a ${targetEstado}`,
        );
      }

      dataToUpdate.estado = targetEstado;

      // CAS update: solo funciona si el estado actual no cambió
      const updated = await this.readingRepository.updateWithCas(
        { lecturaId: id, estado: currentEstado },
        dataToUpdate,
      );

      if (!updated) {
        throw new InvalidDomainOperationException(
          'La lectura fue modificada por otro usuario. Intentalo de nuevo.',
        );
      }

      return updated;
    }

    // Field-level update without state transition
    if (Object.keys(dataToUpdate).length === 0) {
      return existing;
    }

    return this.readingRepository.update({ lecturaId: id }, dataToUpdate);
  }
}
