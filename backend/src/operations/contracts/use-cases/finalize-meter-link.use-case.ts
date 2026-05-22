import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FinalizeMeterLinkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(medidorId: bigint): Promise<any> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Close active history for this medidor
      await tx.historialMedidores.updateMany({
        where: { medidorId, fechaHasta: null },
        data: { fechaHasta: new Date() },
      });

      // 2. Return the medidor status
      return await tx.medidores.findUnique({
        where: { medidorId },
      });
    });
  }
}
