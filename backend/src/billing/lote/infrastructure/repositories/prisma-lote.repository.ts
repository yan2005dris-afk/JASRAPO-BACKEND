import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { LoteRepository } from '../../domain/repositories/lote.repository';

@Injectable()
export class PrismaLoteRepository implements LoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]> {
    return this.prisma.lote.findMany(params);
  }

  async count(params?: {
    where?: Record<string, any>;
  }): Promise<number> {
    return this.prisma.lote.count({
      where: (params?.where ?? {}) as any,
    });
  }

  async findById(
    id: number | bigint,
    options?: { include?: Record<string, any> },
  ): Promise<any> {
    return this.prisma.lote.findUnique({
      where: { loteId: BigInt(id) },
      include: options?.include,
    });
  }

  async generarLote(
    periodoId: number,
    comunidadId: number | null,
    creadoPor: string,
  ): Promise<any> {
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT generar_prefacturas_lote($1, $2, $3) as "loteId"`,
      periodoId,
      comunidadId ?? null,
      creadoPor,
    );
    return result[0]?.loteId;
  }
}
