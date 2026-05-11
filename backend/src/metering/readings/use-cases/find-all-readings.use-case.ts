import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { safeReadingsSelect } from '../types/IResponseReading';
import { toReadingResponse } from '../types/readingMapper';

@Injectable()
export class FindAllReadingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
  }) {
    const { skip, take, where } = params;
    const readings = await this.prisma.lecturas.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      select: safeReadingsSelect,
      orderBy: { fecha: 'desc' },
    });
    return readings.map(toReadingResponse);
  }
}
