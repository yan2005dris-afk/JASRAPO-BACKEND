import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContratosWhereInput;
  }): Promise<any[]> {
    return this.contractRepository.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}
