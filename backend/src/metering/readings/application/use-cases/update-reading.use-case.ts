import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { ActualizarLecturaDto } from '../../interfaces/dto/update-lectura.dto';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { EstadoLectura } from 'src/shared/enums';

const OPERATOR_EDITABLE_ESTADOS = new Set<string>([
  EstadoLectura.PENDIENTE,
  EstadoLectura.RECHAZADA_VERIFICACION,
]);

@Injectable()
export class UpdateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(
    id: bigint,
    updateDto: ActualizarLecturaDto,
  ): Promise<LecturaEntity> {
    const existing = await this.readingRepository.findUnique({
      lecturaId: id,
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.medidorId) {
      dataToUpdate.medidorId = BigInt(updateDto.medidorId);
    }
    if (updateDto.fecha) {
      dataToUpdate.fecha = new Date(updateDto.fecha);
    }

    // Auto-transition to POR_REVISION when operator submits a measured value
    if (OPERATOR_EDITABLE_ESTADOS.has(existing.estado)) {
      dataToUpdate.estado = EstadoLectura.POR_REVISION;
    }

    await this.readingRepository.update({ lecturaId: id }, dataToUpdate);

    const lectura = await this.readingRepository.findUnique({
      lecturaId: id,
    });

    if (!lectura) {
      throw new NotFoundException('Lectura no encontrada');
    }

    return lectura;
  }
}
