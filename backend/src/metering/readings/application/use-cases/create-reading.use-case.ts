import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CrearLecturaDto } from '../../interfaces/dto/create-lectura.dto';
import { EstadoLectura } from 'src/shared/enums';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const periodoId = await this.resolvePeriodoId(createDto.periodoId);
    const fotoUrl = createDto.fotoUrl;
    const fecha = this.validateFecha(createDto.fecha);

    const rawLectura = await this.readingRepository.create({
      fecha,
      lecturaAnterior: createDto.lecturaAnterior,
      lecturaActual: createDto.lecturaActual,
      consumoCalculado: createDto.consumoCalculado ?? 0,
      medidorId: this.validateMedidorId(createDto.medidorId),
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
      throw new EntityNotFoundException('Lectura', rawLectura.lecturaId);
    }

    return lectura;
  }

  private validateMedidorId(medidorId: string | number): bigint {
    if (!/^\d+$/.test(String(medidorId))) {
      throw new InvalidDomainOperationException(
        'medidorId inválido: debe ser un número entero',
      );
    }
    return BigInt(medidorId);
  }

  private validateFecha(fecha: string): Date {
    const parsed = new Date(fecha);
    if (isNaN(parsed.getTime())) {
      throw new InvalidDomainOperationException(`fecha inválida: ${fecha}`);
    }
    return parsed;
  }

  private async resolvePeriodoId(periodoId?: number): Promise<number> {
    if (periodoId) return periodoId;

    const activePeriod = await this.readingRepository.findActivePeriod();

    if (!activePeriod) {
      throw new EntityNotFoundException('Periodo', 'ABIERTO');
    }

    return activePeriod.periodoId;
  }
}
