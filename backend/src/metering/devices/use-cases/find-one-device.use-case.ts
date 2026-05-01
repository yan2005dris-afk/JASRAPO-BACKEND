import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Medidores } from 'src/generated/prisma/client';

@Injectable()
export class FindOneDeviceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<Medidores> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId: id },
    });
    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException(`Medidor con ID ${id} no encontrado`);
    }
    return medidor;
  }
}
