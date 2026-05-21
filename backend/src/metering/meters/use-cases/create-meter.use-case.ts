import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateMeterDto } from '../dto/create-meter.dto';
import { safeMeterSelect } from '../types/IResponseMeters';
import { toMeterResponse } from '../types/metersMapper';
import { MeterResponseDto } from '../dto/meter-response.dto';

import { EstadoMedidor } from 'src/generated/prisma/enums';

@Injectable()
export class CreateMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(createDto: CreateMeterDto): Promise<MeterResponseDto> {
    const meter = await this.prisma.medidores.create({
      data: {
        ...createDto,
        estado: EstadoMedidor.BODEGA,
      },
      select: safeMeterSelect,
    });
    return toMeterResponse(meter);
  }
}
