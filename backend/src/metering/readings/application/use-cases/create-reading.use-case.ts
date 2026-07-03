import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CrearLecturaDto } from '../../interfaces/dto/create-lectura.dto';
import { EstadoLectura, EstadoPeriodo } from 'src/shared/enums';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class CreateReadingUseCase {
  constructor(
    private readonly readingRepository: ReadingRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const periodoId = await this.resolvePeriodoId(createDto.periodoId);
    const fotoUrl = createDto.fotoUrl;

    const rawLectura = await this.readingRepository.create({
      fecha: new Date(createDto.fecha),
      lecturaAnterior: createDto.lecturaAnterior,
      lecturaActual: createDto.lecturaActual,
      consumoCalculado: createDto.consumoCalculado ?? 0,
      medidorId: BigInt(createDto.medidorId),
      descripcionAnomalia: createDto.descripcionAnomalia,
      fotoUrl,
      lecturaInicial: createDto.lecturaInicial,
      periodoId,
      estado: EstadoLectura.POR_REVISION,
    });

    const lectura = await this.readingRepository.findUnique({
      lecturaId: rawLectura.lecturaId,
    });

    if (!lectura) {
      throw new NotFoundException('Lectura no encontrada');
    }

    return lectura;
  }

  private async resolvePeriodoId(periodoId?: number): Promise<number> {
    if (periodoId) return periodoId;

    const activePeriod = await this.prisma.periodos.findFirst({
      where: { estado: EstadoPeriodo.ABIERTO },
      select: { periodoId: true },
    });

    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    return activePeriod.periodoId;
  }
}
