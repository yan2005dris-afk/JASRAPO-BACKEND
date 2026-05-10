import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeConvenioWithCuotasSelect } from '../types/IConvenio';

@Injectable()
export class FindOneConvenioUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(convenioId: bigint) {
    const convenio = await this.prisma.convenios.findUnique({
      where: { convenioId },
      select: safeConvenioWithCuotasSelect,
    });

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${convenioId} no encontrado`,
      );
    }

    return convenio;
  }
}
