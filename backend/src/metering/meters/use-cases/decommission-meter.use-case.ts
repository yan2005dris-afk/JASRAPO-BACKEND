import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeMeterSelect } from '../types/IResponseMeters';
import { toMeterResponse } from '../types/metersMapper';
import { MeterResponseDto } from '../dto/meter-response.dto';

import { EstadoMedidor } from 'src/generated/prisma/enums';

@Injectable()
export class DecommissionMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(medidorId: bigint, motivo: string): Promise<MeterResponseDto> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId },
    });

    if (!medidor || medidor.deletedAt)
      throw new BadRequestException('Medidor no encontrado');

    if (medidor.estado !== EstadoMedidor.DANADO) {
      throw new BadRequestException(
        `Un medidor debe estar DANADO antes de darse de baja`,
      );
    }

    const updated = await this.prisma.medidores.update({
      where: { medidorId },
      data: {
        estado: EstadoMedidor.BAJA,
        fechaBaja: new Date(),
        motivo,
      },
      select: safeMeterSelect,
    });
    return toMeterResponse(updated);
  }
}
