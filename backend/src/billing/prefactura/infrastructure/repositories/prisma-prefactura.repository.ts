import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrefacturaRepository } from '../../domain/repositories/prefactura.repository';

@Injectable()
export class PrismaPrefacturaRepository implements PrefacturaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    where?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]> {
    return this.prisma.prefacturas.findMany(params);
  }

  async count(where?: Record<string, any>): Promise<number> {
    return this.prisma.prefacturas.count({
      where: where ?? {},
    });
  }

  async findById(
    id: number | bigint,
    options?: { include?: Record<string, any> },
  ): Promise<any> {
    return this.prisma.prefacturas.findUnique({
      where: { prefacturaId: BigInt(id) },
      include: options?.include,
    });
  }

  async updateEstado(
    id: number | bigint,
    estado: string,
    estadoEsperado: string,
    data?: {
      aprobadaPor?: string;
      motivoRechazo?: string;
      fechaAprobacion?: Date;
    },
  ): Promise<boolean> {
    const result = await this.prisma.prefacturas.updateMany({
      where: {
        prefacturaId: BigInt(id),
        estado: estadoEsperado as any,
      },
      data: {
        estado: estado as any,
        ...(data?.aprobadaPor ? { aprobadaPor: data.aprobadaPor } : {}),
        ...(data?.motivoRechazo ? { motivoRechazo: data.motivoRechazo } : {}),
        ...(data?.fechaAprobacion
          ? { fechaAprobacion: data.fechaAprobacion }
          : {}),
      },
    });
    return result.count > 0;
  }
}
