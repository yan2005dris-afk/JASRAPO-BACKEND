import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CrearLecturaDto } from '../../interfaces/dto/create-lectura.dto';
import { EstadoLectura } from 'src/shared/enums';
import { LecturaEntity } from '../../domain/entities/lectura.entity';

@Injectable()
export class CreateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const rawLectura = await this.readingRepository.create({
      fecha: new Date(createDto.fecha),
      lecturaAnterior: createDto.lecturaAnterior,
      lecturaActual: createDto.lecturaActual,
      consumoCalculado: createDto.consumoCalculado ?? 0,
      medidorId: BigInt(createDto.medidorId),
      descripcionAnomalia: createDto.descripcionAnomalia,
      fotoUrl: createDto.fotoUrl,
      lecturaInicial: createDto.lecturaInicial,
      periodoId: createDto.periodoId,
      estado: EstadoLectura.PENDIENTE,
    });

    const lectura = await this.readingRepository.findUnique({
      lecturaId: rawLectura.lecturaId,
    });

    if (!lectura) {
      throw new NotFoundException('Lectura no encontrada');
    }

    return lectura;
  }
}
