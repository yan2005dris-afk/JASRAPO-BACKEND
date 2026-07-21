import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { CreateMeterDto } from '../../interfaces/dto/create-meter.dto';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { EstadoMedidor } from 'src/shared/enums';

@Injectable()
export class CreateMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(createDto: CreateMeterDto): Promise<MeterEntity> {
    return this.meterRepository.create({
      marca: createDto.marca,
      modelo: createDto.modelo,
      serie: createDto.serie,
      estado: EstadoMedidor.BODEGA,
    });
  }
}
