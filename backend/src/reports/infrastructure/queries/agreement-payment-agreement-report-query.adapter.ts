import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PaymentAgreementReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  PaymentAgreementReportFilters,
  PaymentAgreementReportReadModel,
} from '../../application/read-models/payment-agreement.read-model';
import type { ReportRequestContext } from '../../application/models/report-request-context';

@Injectable()
export class AgreementPaymentAgreementReportQueryAdapter extends PaymentAgreementReportQueryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async query(
    context: ReportRequestContext<PaymentAgreementReportFilters>,
  ): Promise<PaymentAgreementReportReadModel> {
    const { filters } = context;
    const convenioId = BigInt(filters.convenioId);

    const convenio = await this.prisma.convenios.findFirst({
      where: { convenioId, deletedAt: null },
      include: {
        contrato: {
          select: {
            numeroGuia: true,
            direccionSuministro: true,
            fechaInicio: true,
            cliente: {
              select: {
                nombres: true,
                apellidos: true,
                razonSocial: true,
                identificacion: true,
                email: true,
              },
            },
          },
        },
        cuotaConvenio: {
          where: { numeroCuota: 1, deletedAt: null },
          take: 1,
          select: { valorCuota: true },
        },
      },
    });

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${filters.convenioId} no encontrado`,
      );
    }

    const firstInstallment = Number(convenio.cuotaConvenio[0]?.valorCuota ?? 0);

    return {
      convenio: {
        convenioId: String(convenio.convenioId),
        contratoId: String(convenio.contratoId),
        deudaTotal: Number(convenio.deudaTotal),
        abonoInicial: Number(convenio.abonoInicial),
        numeroCuotas: convenio.numeroCuotas,
        fechaPrimerPago: convenio.fechaPrimerPago.toISOString(),
        periodoInicio: convenio.contrato.fechaInicio.toISOString(),
        motivo: convenio.motivo,
        createdAt: convenio.createdAt.toISOString(),
        cuotaMensual: firstInstallment,
        primeraCuota: firstInstallment,
        contrato: {
          numeroGuia: convenio.contrato.numeroGuia,
          direccionSuministro: convenio.contrato.direccionSuministro,
        },
        cliente: {
          nombres: convenio.contrato.cliente.nombres,
          apellidos: convenio.contrato.cliente.apellidos,
          razonSocial: convenio.contrato.cliente.razonSocial,
          identificacion: convenio.contrato.cliente.identificacion,
          email: convenio.contrato.cliente.email,
        },
      },
    };
  }
}
