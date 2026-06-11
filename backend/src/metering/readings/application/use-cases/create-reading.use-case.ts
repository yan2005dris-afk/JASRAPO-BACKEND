import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CrearLecturaDto } from '../../interfaces/dto/create-lectura.dto';
import { EstadoLectura } from 'src/generated/prisma/enums';
import { toReadingResponse } from '../../types/readingMapper';
import { safeReadingsSelect } from '../../types/IResponseReading';

@Injectable()
export class CreateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(createDto: CrearLecturaDto) {
    const rawLectura = await this.readingRepository.create({
      fecha: new Date(createDto.fecha),
      lecturaAnterior: createDto.lecturaAnterior,
      lecturaActual: createDto.lecturaActual,
      consumoCalculado: createDto.consumoCalculado ?? 0,
      medidorId: BigInt(createDto.medidorId),
      descripcionAnomalia: createDto.descripcionAnomalia,
      fotoUrlMinIo: createDto.fotoUrlMinIo,
      lecturaInicial: createDto.lecturaInicial,
      periodoId: createDto.periodoId,
      estado: EstadoLectura.PENDIENTE,
    });

    const lectura = await this.readingRepository.findUnique(
      { lecturaId: rawLectura.lecturaId },
      safeReadingsSelect,
    );

    return toReadingResponse(lectura);
  }
}
