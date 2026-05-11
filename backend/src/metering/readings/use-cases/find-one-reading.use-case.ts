import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeReadingsSelect } from '../types/IResponseReading';
import { toReadingResponse } from '../types/readingMapper';

@Injectable()
export class FindOneReadingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint) {
    const lectura = await this.prisma.lecturas.findFirst({
      where: { lecturaId: id, deletedAt: null },
      select: safeReadingsSelect,
    });
    if (!lectura) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }
    return toReadingResponse(lectura);
  }
}
