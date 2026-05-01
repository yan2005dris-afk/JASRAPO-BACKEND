import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContratosWhereInput;
  }): Promise<any[]> {
    return await this.prisma.contratos.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
