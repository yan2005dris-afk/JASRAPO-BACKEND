import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  PrefacturaService,
  type PrefacturaCuotasInfo,
  type CuotaConvenioStatus,
} from '../../domain/services/prefactura.service';

@Injectable()
export class PrismaPrefacturaService implements PrefacturaService {
  constructor(private readonly prisma: PrismaService) {}

  async findPrefacturaDetalleByCuotaConvenioId(
    cuotaConvenioId: bigint,
  ): Promise<{ prefacturaId: bigint }[]> {
    const records = await this.prisma.prefacturaDetalle.findMany({
      where: { cuotaConvenioId },
      select: { prefacturaId: true },
    });
    return records.map((r) => ({ prefacturaId: BigInt(r.prefacturaId) }));
  }

  async findPrefacturaWithDetails(
    prefacturaId: bigint,
  ): Promise<PrefacturaCuotasInfo | null> {
    const record = await this.prisma.prefacturas.findFirst({
      where: { prefacturaId, deletedAt: null },
      select: {
        prefacturaId: true,
        comprobanteId: true,
        prefacturaDetalle: {
          select: { cuotaConvenioId: true },
        },
      },
    });

    if (!record) return null;

    const cuotaConvenioIds = record.prefacturaDetalle
      .map((d) => (d.cuotaConvenioId ? BigInt(d.cuotaConvenioId) : null))
      .filter((id): id is bigint => id !== null);

    return {
      prefacturaId: BigInt(record.prefacturaId),
      comprobanteId: record.comprobanteId ? BigInt(record.comprobanteId) : null,
      cuotaConvenioIds,
    };
  }

  async findCuotasByIds(
    cuotaConvenioIds: bigint[],
  ): Promise<CuotaConvenioStatus[]> {
    const records = await this.prisma.cuotaConvenio.findMany({
      where: { cuotaConvenioId: { in: cuotaConvenioIds }, deletedAt: null },
      select: { cuotaConvenioId: true, estado: true },
    });

    return records.map((r) => ({
      cuotaConvenioId: BigInt(r.cuotaConvenioId),
      estado: r.estado,
    }));
  }
}
