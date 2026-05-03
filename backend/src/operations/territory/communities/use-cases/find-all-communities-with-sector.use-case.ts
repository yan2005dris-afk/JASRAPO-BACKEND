import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeCommunitiesSelectWithSector } from '../types/IResponseCommunities';
import { toComunidadResponse } from '../types/communitiesMapper';

@Injectable()
export class FindAllCommunitiesWithSectorUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(options?: { sectorId?: number }) {
    const where: Record<string, unknown> = { deletedAt: null };

    if (options?.sectorId) {
      where.sector = {
        some: { sectorId: options.sectorId, deletedAt: null },
      };
    }

    const comunidades = await this.prisma.comunidades.findMany({
      where,
      select: safeCommunitiesSelectWithSector,
    });
    return comunidades.map(toComunidadResponse);
  }
}
