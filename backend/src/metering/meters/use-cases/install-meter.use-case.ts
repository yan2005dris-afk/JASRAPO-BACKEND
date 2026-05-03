import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoMedidor, Medidores } from 'src/generated/prisma/client';

@Injectable()
export class InstallMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(medidorId: bigint, contratoId: bigint): Promise<Medidores> {
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

    return await this.prisma.medidores.update({
      where: { medidorId },
      data: {
        estado: EstadoMedidor.INSTALADO,
        contratoId: BigInt(contratoId),
      },
    });
  }
}
