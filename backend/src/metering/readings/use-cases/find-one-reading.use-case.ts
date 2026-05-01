import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { LecturaEntity } from '../entities/lectura.entity';

@Injectable()
export class FindOneReadingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<LecturaEntity> {
    const lectura = await this.prisma.lecturas.findUnique({
      where: { lecturaId: id },
    });
    if (!lectura || lectura.deletedAt) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }
    return new LecturaEntity(lectura);
  }
}
