import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { LecturaEntity } from '../entities/lectura.entity';

@Injectable()
export class FindAllReadingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
  }): Promise<LecturaEntity[]> {
    const { skip, take, where } = params;
    const lecturas = await this.prisma.lecturas.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { fecha: 'desc' },
    });
    return lecturas.map((l) => new LecturaEntity(l));
  }
}
