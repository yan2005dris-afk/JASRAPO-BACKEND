import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { safeAgreementWithInstallmentsSelect } from '../types/IAgreement';

@Injectable()
export class FindOneAgreementUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(convenioId: bigint) {
    const convenio = await this.prisma.convenios.findFirst({
      where: { convenioId, deletedAt: null },
      select: safeAgreementWithInstallmentsSelect,
    });

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${convenioId} no encontrado`,
      );
    }

    return convenio;
  }
}
