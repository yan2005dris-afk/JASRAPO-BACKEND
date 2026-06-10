import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { ActualizarLecturaDto } from '../../interfaces/dto/update-lectura.dto';
import { toReadingResponse } from '../../types/readingMapper';
import { safeReadingsSelect } from '../../types/IResponseReading';

@Injectable()
export class UpdateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(
    id: bigint,
    updateDto: ActualizarLecturaDto,
  ) {
    const existing = await this.readingRepository.findUnique({
      lecturaId: id,
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.medidorId)
      dataToUpdate.medidorId = BigInt(updateDto.medidorId);
    if (updateDto.fecha) dataToUpdate.fecha = new Date(updateDto.fecha);

    await this.readingRepository.update(
      { lecturaId: id },
      dataToUpdate,
    );

    const lectura = await this.readingRepository.findUnique(
      { lecturaId: id },
      safeReadingsSelect,
    );

    return toReadingResponse(lectura);
  }
}
