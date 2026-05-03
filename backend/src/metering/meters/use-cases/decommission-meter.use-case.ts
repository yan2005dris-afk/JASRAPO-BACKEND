import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoMedidor, Medidores } from 'src/generated/prisma/client';

@Injectable()
export class DecommissionMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(medidorId: bigint, motivo: string): Promise<Medidores> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId },
    });

    if (!medidor || medidor.deletedAt)
      throw new BadRequestException('Medidor no encontrado');

    if (medidor.estado !== EstadoMedidor.DANADO) {
      throw new BadRequestException(
        `Un medidor debe estar DAÑADO antes de darse de baja`,
      );
    }

    return await this.prisma.medidores.update({
      where: { medidorId },
      data: { estado: EstadoMedidor.BAJA, fechaBaja: new Date(), motivo },
    });
  }
}
