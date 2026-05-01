import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NovedadOperativaEntity } from '../entities/novedad-operativa.entity';

@Injectable()
export class FindOneFieldWorkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<NovedadOperativaEntity> {
    const novedad = await this.prisma.novedadOperativa.findUnique({
      where: { novedadId: id },
    });
    if (!novedad || novedad.deletedAt) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }
    return new NovedadOperativaEntity(novedad);
  }
}
