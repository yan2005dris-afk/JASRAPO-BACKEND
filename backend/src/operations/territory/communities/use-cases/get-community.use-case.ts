import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class GetCommunityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const community = await this.prisma.comunidades.findUnique({
      where: { comunidadId: id },
    });

    if (!community) {
      throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
    }

    return community;
  }
}
