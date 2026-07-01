import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EstadoLectura } from 'src/shared/enums';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import type { UpdateReadingRepositoryData } from '../../domain/repositories/reading.repository';
import { ActualizarLecturaDto } from '../../interfaces/dto/update-lectura.dto';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

/**
 * State machine: define qué transiciones de estado son válidas.
 *
 * Estados terminales (sin transiciones salientes):
 *   - APROBADA
 *   - RECHAZADA_VERIFICACION
 *   - PLANILLADA (pendiente de definir transiciones)
 *
 * Estados sin transiciones definidas aún:
 *   - ESTIMADA
 *   - PLANILLADA
 *
 * Solo se agregan transiciones explícitas. La ausencia de una transición
 * implica que no está permitida y será rechazada por canTransition().
 */
const TRANSITIONS: Record<string, Partial<Record<string, true>>> = {
  [EstadoLectura.PENDIENTE]: {
    [EstadoLectura.POR_REVISION]: true,
  },
  [EstadoLectura.POR_REVISION]: {
    [EstadoLectura.APROBADA]: true,
    [EstadoLectura.RECHAZADA_VERIFICACION]: true,
  },
};

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
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    // Build update payload — solo campos que el usuario envió
    const { file: _file, ...fieldsToUpdate } = updateDto as any;
    const dataToUpdate = Object.fromEntries(
      Object.entries(fieldsToUpdate).filter(([_, v]) => v !== undefined),
    ) as Partial<UpdateReadingRepositoryData>;

    if (targetEstado) {
      // State machine validation
      const currentEstado = existing.estado as EstadoLectura;
      if (!this.canTransition(currentEstado, targetEstado)) {
        throw new BadRequestException(
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
        throw new BadRequestException(
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

  private canTransition(from: EstadoLectura, to: EstadoLectura): boolean {
    if (from === to) return true;
    return !!TRANSITIONS[from]?.[to];
  }
}
