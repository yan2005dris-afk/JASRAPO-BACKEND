import { Injectable } from '@nestjs/common';
import { ReadingRepository } from '../../domain/repositories/reading.repository';
import { CrearLecturaDto } from '../../interfaces/dto/create-lectura.dto';
import { LecturaEntity } from '../../domain/entities/lectura.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { Decimal } from 'decimal.js';

@Injectable()
export class CreateReadingUseCase {
  constructor(private readonly readingRepository: ReadingRepository) {}

  async execute(createDto: CrearLecturaDto): Promise<LecturaEntity> {
    const periodoId = await this.resolvePeriodoId(createDto.periodoId);
    const fotoUrl = createDto.fotoUrl;
    const fecha = this.validateFecha(createDto.fecha);
    const medidorId = this.validateMedidorId(createDto.medidorId);
    const lecturaActual = this.validateLecturaActual(createDto.lecturaActual);

    const lectura = await this.readingRepository.createWithAtomicSnapshot({
      fecha,
      lecturaActual,
      medidorId,
      periodoId,
      descripcionAnomalia: createDto.descripcionAnomalia,
      fotoUrl,
      estado: createDto.estado,
    });

    return lectura;
  }

  private validateLecturaActual(lecturaActual: number | string): Decimal {
    if (
      lecturaActual === undefined ||
      lecturaActual === null ||
      isNaN(Number(lecturaActual))
    ) {
      throw new InvalidDomainOperationException(
        'lecturaActual inválida: debe ser un número válido',
      );
    }
    return new Decimal(lecturaActual);
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
