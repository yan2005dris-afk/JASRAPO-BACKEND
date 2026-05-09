import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeContractsSelect } from '../types/IResponseContract';

@Injectable()
export class FindOneContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<any> {
    const registro = await this.prisma.contratos.findFirst({
      where: { contratoId: id, deletedAt: null },
      select: safeContractsSelect,
    });
    if (!registro) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }
    return registro;
  }
}
