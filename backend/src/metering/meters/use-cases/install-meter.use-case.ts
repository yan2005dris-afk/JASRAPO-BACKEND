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
export class InstallMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    medidorId: bigint,
    contratoId: bigint,
  ): Promise<MeterResponseDto> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId },
      include: { estado: true },
    });

    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException('Medidor no encontrado');
    }

    if (medidor.estado?.codigo !== 'BODEGA') {
      throw new BadRequestException(
        `El medidor no puede ser instalado desde el estado ${medidor.estado?.nombre}`,
      );
    }

    const updated = await this.prisma.medidores.update({
      where: { medidorId },
      data: {
        estadoId: BigInt(2), // INSTALADO
        contratoId: BigInt(contratoId),
      },
      select: safeMeterSelect,
    });
    return toMeterResponse(updated);
  }
}
