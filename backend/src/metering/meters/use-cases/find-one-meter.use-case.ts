import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeMeterSelectWithDelete } from '../types/IResponseMeters';
import { toMeterResponse } from '../types/metersMapper';
import { MeterResponseDto } from '../dto/meter-response.dto';

@Injectable()
export class FindOneMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<MeterResponseDto> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId: id },
      select: safeMeterSelectWithDelete,
    });
    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException(`Medidor con ID ${id} no encontrado`);
    }
    return toMeterResponse(medidor);
  }
}
