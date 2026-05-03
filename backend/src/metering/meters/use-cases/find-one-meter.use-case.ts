import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  IResponseMeters,
  safeMeterSelectWithDelete,
} from '../types/IResponseMeters';

@Injectable()
export class FindOneMeterUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<IResponseMeters> {
    const medidor = await this.prisma.medidores.findUnique({
      where: { medidorId: id },
      select: safeMeterSelectWithDelete,
    });
    if (!medidor || medidor.deletedAt) {
      throw new NotFoundException(`Medidor con ID ${id} no encontrado`);
    }
    return medidor;
  }
}
