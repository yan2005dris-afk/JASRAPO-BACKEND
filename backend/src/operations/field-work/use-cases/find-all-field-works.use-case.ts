import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';

@Injectable()
export class FindAllFieldWorksUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.NovedadOperativaWhereInput;
  }): Promise<NovedadOperativaEntity[]> {
    const { skip, take, where } = params;
    const novedades = await this.prisma.novedadOperativa.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return novedades.map((n) => new NovedadOperativaEntity(n));
  }
}
