import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CrearLecturaDto } from '../dto/create-lectura.dto';
import { LecturaEntity } from '../entities/lectura.entity';

@Injectable()
export class CreateReadingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const lectura = await this.prisma.lecturas.create({
      data: {
        fecha: new Date(createDto.fecha),
        lecturaAnterior: createDto.lecturaAnterior,
        lecturaActual: createDto.lecturaActual,
        consumoCalculado: createDto.consumoCalculado ?? 0,
        contratoId: BigInt(createDto.contratoId),
        descripcionAnomalia: createDto.descripcionAnomalia,
        fotoUrlMinIo: createDto.fotoUrlMinIo,
        isValidada: createDto.isValidada ?? false,
        lecturaInicial: createDto.lecturaInicial,
        periodoId: createDto.periodoId,
        tieneAnomalia: createDto.tieneAnomalia ?? false,
      },
    });
    return new LecturaEntity(lectura);
  }
}
