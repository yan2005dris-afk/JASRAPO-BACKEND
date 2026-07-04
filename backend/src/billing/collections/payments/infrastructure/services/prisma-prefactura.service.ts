import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrefacturaService } from '../../domain/services/prefactura.service';
import type { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class PrismaPrefacturaService implements PrefacturaService {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async findPrefacturaDetalleByCuotaConvenioId(
    cuotaConvenioId: bigint,
    tx?: Prisma.TransactionClient,
  ): Promise<any[]> {
    return this.client(tx).prefacturaDetalle.findMany({
      where: { cuotaConvenioId },
    });
  }

  async findPrefacturaById(
    prefacturaId: bigint,
    select?: any,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).prefacturas.findUnique({
      where: { prefacturaId },
      ...(select ? { select } : {}),
    });
  }

  async findManyCuotaConvenio(
    where: Prisma.CuotaConvenioWhereInput,
    select?: any,
    tx?: Prisma.TransactionClient,
  ): Promise<any[]> {
    return this.client(tx).cuotaConvenio.findMany({
      where,
      ...(select ? { select } : {}),
    });
  }
}
