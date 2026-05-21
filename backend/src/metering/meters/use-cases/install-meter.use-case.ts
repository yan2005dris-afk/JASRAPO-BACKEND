import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeMeterSelect } from '../types/IResponseMeters';
import { toMeterResponse } from '../types/metersMapper';
import { MeterResponseDto } from '../dto/meter-response.dto';

import { EstadoMedidor } from 'src/generated/prisma/enums';

@Injectable()
export class InstallMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    medidorId: bigint,
    contratoId: bigint,
  ): Promise<MeterResponseDto> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId },
    });

    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException('Medidor no encontrado');
    }

    if (medidor.estado !== EstadoMedidor.BODEGA) {
      throw new BadRequestException(
        `El medidor no puede ser instalado desde el estado ${medidor.estado}`,
      );
    }

    return await this.prisma.$transaction(async (tx) => {
      // 1. Update meter status
      const updated = await tx.medidores.update({
        where: { medidorId },
        data: {
          estado: EstadoMedidor.INSTALADO,
        },
        select: safeMeterSelect,
      });

      // 2. Create initial history entry
      await tx.historialMedidores.create({
        data: {
          medidorId,
          contratoId,
          lecturaInicial: 0, // Default for installation
          motivo: 'INSTALACION INICIAL',
          fechaDesde: new Date(),
        },
      });

      return toMeterResponse(updated);
    });
  }
}
