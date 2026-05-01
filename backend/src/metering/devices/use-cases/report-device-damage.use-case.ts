import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoMedidor, Medidores } from 'src/generated/prisma/client';

@Injectable()
export class ReportDeviceDamageUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(medidorId: bigint): Promise<Medidores> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId },
    });

    if (!medidor || medidor.deletedAt)
      throw new BadRequestException('Medidor no encontrado');

    if (medidor.estado !== EstadoMedidor.INSTALADO) {
      throw new BadRequestException(
        `Solo medidores INSTALADOS pueden reportarse como dañados`,
      );
    }

    return await this.prisma.medidores.update({
      where: { medidorId },
      data: { estado: EstadoMedidor.DANADO },
    });
  }
}
