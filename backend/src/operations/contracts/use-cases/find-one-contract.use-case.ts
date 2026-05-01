import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FindOneContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<any> {
    const registro = await this.prisma.contratos.findUnique({
      where: { contratoId: id },
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }
    return registro;
  }
}
