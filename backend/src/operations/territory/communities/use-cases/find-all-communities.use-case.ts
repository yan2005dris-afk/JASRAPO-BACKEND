import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeCommunitiesSelect } from '../types/IResponseCommunities';
import { toComunidadResponse } from '../types/communitiesMapper';

@Injectable()
export class FindAllCommunitiesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const comunidades = await this.prisma.comunidades.findMany({
      where: { deletedAt: null },
      select: safeCommunitiesSelect,
    });
    return comunidades.map(toComunidadResponse);
  }
}
