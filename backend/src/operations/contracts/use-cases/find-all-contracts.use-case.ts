import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { safeContractsSelect } from '../types/IResponseContract';

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
      select: safeContractsSelect,
      orderBy: { createdAt: 'desc' },
    });
  }
}
