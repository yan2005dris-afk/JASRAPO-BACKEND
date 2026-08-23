import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { AccountStatementReportQueryPort } from '../../application/ports/report-query.ports';
import type {
  AccountStatementReportFilters,
  AccountStatementReportReadModel,
} from '../../application/read-models/account-statement.read-model';

@Injectable()
export class PrismaAccountStatementReportQueryAdapter extends AccountStatementReportQueryPort {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async query(
    filters: AccountStatementReportFilters,
  ): Promise<AccountStatementReportReadModel> {
    const contractId = BigInt(filters.contratoId);
    const contract = await this.prisma.contratos.findFirst({
      where: { contratoId: contractId, deletedAt: null },
      include: {
        cliente: true,
        sector: { select: { nombre: true } },
        categoriaTarifa: true,
        historialMedidores: {
          where: { fechaHasta: null },
          take: 1,
          include: { medidor: { select: { serie: true } } },
        },
      },
    });

    if (!contract) {
      return {
        contractId: filters.contratoId,
        contract: null,
        periods: [],
        generatedAt: new Date(),
      };
    }

    const preInvoices = await this.prisma.prefacturas.findMany({
      where: {
        contratoId: contractId,
        deletedAt: null,
        estado: { notIn: ['ANULADA'] },
        ...(filters.fechaDesde || filters.fechaHasta
          ? {
              periodoRel: {
                ...(filters.fechaDesde
                  ? { fechaInicio: { gte: new Date(filters.fechaDesde) } }
                  : {}),
                ...(filters.fechaHasta
                  ? { fechaFin: { lte: new Date(filters.fechaHasta) } }
                  : {}),
              },
            }
          : {}),
      },
      include: { periodoRel: { select: { nombre: true } } },
      orderBy: { periodoRel: { fechaInicio: 'desc' } },
      take: 6,
    });
    preInvoices.reverse();

    const meterId = contract.historialMedidores[0]?.medidorId;
    const periodIds = preInvoices.map((preInvoice) => preInvoice.periodoId);
    const readings =
      meterId && periodIds.length > 0
        ? await this.prisma.lecturas.findMany({
            where: {
              medidorId: meterId,
              periodoId: { in: periodIds },
              deletedAt: null,
              estado: 'APROBADA',
            },
            orderBy: [{ periodoId: 'asc' }, { fecha: 'asc' }],
          })
        : [];
    const readingsByPeriod = new Map<number, typeof readings>();
    for (const reading of readings) {
      const current = readingsByPeriod.get(reading.periodoId) ?? [];
      current.push(reading);
      readingsByPeriod.set(reading.periodoId, current);
    }

    const tariffId = contract.categoriaTarifaId;
    const rubros = tariffId
      ? await this.prisma.rubros.findMany({
          where: {
            categoriaTarifaId: tariffId,
            deletedAt: null,
            activo: true,
          },
        })
      : [];

    const cargoFijoRubro = rubros.find((r) => r.tipoRubro === 'FIJO');
    const variableRubro = rubros.find((r) => r.tipoRubro === 'VARIABLE');
    const baseValue = Number(cargoFijoRubro?.precioUnitario ?? 0);
    const excessValuePerM3 = Number(variableRubro?.precioUnitario ?? 0);

    return {
      contractId: filters.contratoId,
      contract: {
        guideNumber: contract.numeroGuia,
        supplyAddress: contract.direccionSuministro,
        sectorName: contract.sector?.nombre ?? null,
        tariffName: contract.categoriaTarifa?.nombre ?? null,
        minimumMonthlyConsumption: Number(
          contract.categoriaTarifa?.consumoMinimoMensual ?? 0,
        ),
        baseValue,
        excessValuePerM3,
        meterSerial: contract.historialMedidores[0]?.medidor.serie ?? null,
        client: {
          nombres: contract.cliente.nombres,
          apellidos: contract.cliente.apellidos,
          razonSocial: contract.cliente.razonSocial,
          identificacion: contract.cliente.identificacion,
          email: contract.cliente.email,
        },
      },
      periods: preInvoices.map((preInvoice) => ({
        periodName: preInvoice.periodoRel?.nombre ?? null,
        annualPayment: Number(preInvoice.abono ?? 0),
        readings: (readingsByPeriod.get(preInvoice.periodoId) ?? []).map(
          (reading) => ({
            date: reading.fecha,
            currentReading: Number(reading.lecturaActual ?? 0),
            previousReading: Number(reading.lecturaAnterior ?? 0),
            consumption: Number(reading.consumoCalculado ?? 0),
          }),
        ),
      })),
      generatedAt: new Date(),
    };
  }
}
