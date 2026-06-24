import { Injectable, NotFoundException } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CrearLecturaDto } from '../../interfaces/dto/create-lectura.dto';
import { EstadoLectura, EstadoPeriodo } from 'src/shared/enums';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  StorageService,
  SRI_BUCKETS,
} from 'src/infrastructure/storage/storage.service';
import * as crypto from 'crypto';

@Injectable()
export class CreateReadingUseCase {
  constructor(
    private readonly readingRepository: ReadingRepository,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async execute(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const periodoId = await this.resolvePeriodoId(createDto.periodoId);
    const fotoUrl = await this.resolvePhotoUrl(createDto);

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

  private async resolvePhotoUrl(
    createDto: CrearLecturaDto,
  ): Promise<string | undefined> {
    if (createDto.fotoUrl) return createDto.fotoUrl;
    if (!createDto.fotoBase64) return undefined;

    const base64Data = createDto.fotoBase64.replace(
      /^data:image\/\w+;base64,/,
      '',
    );
    const buffer = Buffer.from(base64Data, 'base64');
    const key = `readings/${crypto.randomUUID()}.jpg`;

    await this.storageService.upload(SRI_BUCKETS.READINGS, key, buffer, {
      contentType: 'image/jpeg',
    });

    return key;
  }
}
