import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeSectoresSelect } from '../types/IResponseSector';

@Injectable()
export class GetAllSectorsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return this.prisma.sectores.findMany({
      where: { deletedAt: null },
      select: safeSectoresSelect,
    });
  }
}
