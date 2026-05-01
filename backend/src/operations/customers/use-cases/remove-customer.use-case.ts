import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemoveCustomerUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const clienteId = BigInt(id);
    const cliente = await this.prisma.clientes.findFirst({ where: { clienteId, deletedAt: null } });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    return this.prisma.clientes.update({
      where: { clienteId },
      data: { deletedAt: new Date() },
    });
  }
}
