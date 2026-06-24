import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { SecuencialRepository } from '../../domain/repositories/secuencial.repository';
import { Prisma } from '../../../../generated/prisma/client.js';

@Injectable()
export class PrismaSecuencialRepository extends SecuencialRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getNextSecuencial(
    puntoEmisionId: number,
    tipoComprobante: string,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const client = tx ?? this.prisma;

    const result = await client.secuenciales.upsert({
      where: {
        puntoEmisionId_tipoComprobante: {
          puntoEmisionId,
          tipoComprobante,
        },
      },
      create: {
        puntoEmisionId,
        tipoComprobante,
        ultimoSecuencial: 1,
      },
      update: {
        ultimoSecuencial: { increment: 1 },
      },
    });

    return String(result.ultimoSecuencial).padStart(9, '0');
  }
}
