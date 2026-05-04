import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeMeterSelect } from '../types/IResponseMeters';
import { toMeterResponse } from '../types/metersMapper';
import { MeterResponseDto } from '../dto/meter-response.dto';

@Injectable()
export class ReportDefectUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(medidorId: bigint): Promise<MeterResponseDto> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId },
      include: { estado: true },
    });

    if (!medidor || medidor.deletedAt)
      throw new NotFoundException('Medidor no encontrado');

    if (medidor.estado?.codigo !== 'INSTALADO') {
      throw new BadRequestException(
        `Solo medidores INSTALADOS pueden reportarse como dañados`,
      );
    }

    const updated = await this.prisma.medidores.update({
      where: { medidorId },
      data: {
        estadoId: BigInt(3), // DANADO
      },
      select: safeMeterSelect,
    });
    return toMeterResponse(updated);
  }
}
