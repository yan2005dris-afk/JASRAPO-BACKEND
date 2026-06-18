import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import type { ReportSpec } from '../interfaces/report-spec.interface';
import type { PaymentAgreementLegacyFilterDto } from '../dto/payment-agreement-legacy-filter.dto';

@Injectable()
export class PaymentAgreementLegacyReportSpec implements ReportSpec<PaymentAgreementLegacyFilterDto> {
  readonly type = 'payment-agreement-legacy';

  constructor(private readonly prisma: PrismaService) {}

  async fetchData(
    filters: PaymentAgreementLegacyFilterDto,
  ): Promise<Record<string, unknown>> {
    const convenio = await this.prisma.convenios.findUnique({
      where: { convenioId: BigInt(filters.convenioId), deletedAt: null },
      include: {
        contrato: {
          include: {
            cliente: true,
          },
        },
        cuotaConvenio: {
          where: { numeroCuota: 1, deletedAt: null },
          take: 1,
        },
      },
    });

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${filters.convenioId} no encontrado`,
      );
    }

    return {
      convenio: {
        ...convenio,
        cuotaMensual: Number(convenio.cuotaConvenio[0]?.valorCuota ?? 0),
        cliente: convenio.contrato.cliente,
      },
    };
  }
}
