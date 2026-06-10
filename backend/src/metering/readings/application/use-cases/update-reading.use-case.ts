import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { ActualizarLecturaDto } from '../../interfaces/dto/update-lectura.dto';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

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
    if (updateDto.medidorId)
      dataToUpdate.medidorId = BigInt(updateDto.medidorId);
    if (updateDto.fecha) dataToUpdate.fecha = new Date(updateDto.fecha);

    const lectura = await this.readingRepository.update(
      { lecturaId: id },
      dataToUpdate,
    );
    return new LecturaEntity(lectura);
  }
}
