import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FinalizeMeterLinkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(medidorId: bigint): Promise<any> {
    // Desvinculamos el medidor del contrato
    return await this.prisma.medidores.update({
      where: { medidorId },
      data: {
        contratoId: null as any,
      },
    });
  }
}
