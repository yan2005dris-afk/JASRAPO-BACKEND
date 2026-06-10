import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { CreateMeterDto } from '../../interfaces/dto/create-meter.dto';
import { safeMeterSelect } from '../../domain/types/IResponseMeters';
import { toMeterResponse } from '../../domain/types/metersMapper';
import { MeterResponseDto } from '../../interfaces/dto/meter-response.dto';

import { EstadoMedidor } from 'src/generated/prisma/enums';

@Injectable()
export class CreateMeterUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(createDto: CreateMeterDto): Promise<MeterResponseDto> {
    const meter = await this.meterRepository.create(
      {
        ...createDto,
        estado: EstadoMedidor.BODEGA,
      },
      safeMeterSelect,
    );
    return toMeterResponse(meter);
  }
}
