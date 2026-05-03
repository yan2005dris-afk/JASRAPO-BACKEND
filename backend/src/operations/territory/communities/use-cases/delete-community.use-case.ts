import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeCommunitiesSelect } from '../types/IResponseCommunities';
import { toComunidadResponse } from '../types/communitiesMapper';

@Injectable()
export class DeleteCommunityUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const existing = await this.prisma.comunidades.findUnique({
      where: { comunidadId: id },
    });

    if (!existing) {
      throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
    }

    const deleted = await this.prisma.comunidades.update({
      where: { comunidadId: id },
      data: { deletedAt: new Date() },
      select: safeCommunitiesSelect,
    });

    return toComunidadResponse(deleted);
  }
}
