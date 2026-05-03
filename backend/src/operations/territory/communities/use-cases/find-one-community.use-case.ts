import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeCommunitiesSelect } from '../types/IResponseCommunities';
import { toComunidadResponse } from '../types/communitiesMapper';

@Injectable()
export class FindOneCommunityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const comunidad = await this.prisma.comunidades.findUnique({
      where: { comunidadId: id, deletedAt: null },
      select: safeCommunitiesSelect,
    });

    if (!comunidad) {
      throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
    }

    return toComunidadResponse(comunidad);
  }
}
