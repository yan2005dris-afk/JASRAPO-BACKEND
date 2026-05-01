import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemoveContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const registro = await this.prisma.contratos.findUnique({
      where: { contratoId: id },
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }

    await this.prisma.contratos.update({
      where: { contratoId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Contrato con ID ${id} eliminado` };
  }
}
