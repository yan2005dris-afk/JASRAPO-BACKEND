import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { RouteEntity } from '../types/route.entity';
import { RouteMapper } from '../types/mappers';

@Injectable()
export class FindAllRoutesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RutasWhereInput;
  }): Promise<{ data: RouteEntity[]; total: number }> {
    const { skip, take, where } = params;

    const total = await this.prisma.rutas.count({
      where: { ...where, deletedAt: null },
    });

    const rutas = await this.prisma.rutas.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: rutas.map((r) => RouteMapper.toEntity(r)),
      total,
    };
  }
}
