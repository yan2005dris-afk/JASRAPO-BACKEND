import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CrearLecturaDto } from '../../interfaces/dto/create-lectura.dto';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { EstadoLectura } from 'src/generated/prisma/enums';

@Injectable()
export class CreateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const lectura = await this.readingRepository.create({
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
    return new LecturaEntity(lectura);
  }
}
