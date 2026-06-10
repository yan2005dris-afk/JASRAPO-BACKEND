import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { LoteRepository } from '../../domain/repositories/lote.repository';

@Injectable()
export class PrismaLoteRepository implements LoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<any[]> {
    return this.prisma.lote.findMany(params);
  }

  async findUnique(params: {
    where: Record<string, any>;
    include?: Record<string, any>;
  }): Promise<any> {
    return this.prisma.lote.findUnique(params);
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
