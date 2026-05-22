import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedAgreements(prisma: PrismaClient) {
  // Agreements conocidos para testing
  const agreementsData = [
    {
      convenioId: 1n,
      contratoId: 1n,
      numeroCuotas: 3,
      abonoInicial: 10,
      deudaTotal: 100,
      mesesMoraActual: 2,
      estado: 'ACTIVO' as const,
      fechaPrimerPago: new Date('2026-06-01T00:00:00.000Z'),
      fechaProximoPago: new Date('2026-06-01T00:00:00.000Z'),
      montoPagadoActual: 10,
      motivo: 'Solicitud del cliente por problemas económicos',
    },
    {
      convenioId: 2n,
      contratoId: 2n,
      numeroCuotas: 6,
      abonoInicial: 0,
      deudaTotal: 215.75,
      mesesMoraActual: 3,
      estado: 'PREPARADO' as const,
      fechaPrimerPago: new Date('2026-07-01T00:00:00.000Z'),
      fechaProximoPago: new Date('2026-07-01T00:00:00.000Z'),
      montoPagadoActual: 0,
      motivo: null,
    },
    {
      convenioId: 3n,
      contratoId: 3n,
      numeroCuotas: 2,
      abonoInicial: 0,
      deudaTotal: 50,
      mesesMoraActual: 1,
      estado: 'ANULADO' as const,
      fechaPrimerPago: new Date('2026-05-01T00:00:00.000Z'),
      fechaProximoPago: null,
      montoPagadoActual: 0,
      motivo: 'Cliente no cumplió con el acuerdo',
      deletedAt: new Date('2026-05-15T00:00:00.000Z'),
    },
  ];

  for (const a of agreementsData) {
    const { convenioId, ...data } = a;
    await prisma.convenios.upsert({
      where: { convenioId },
      update: {},
      create: data,
    });
  }

  // Installments for agreement 1 (ACTIVO - 3 cuotas, primera pagada)
  const installmentsAgreement1 = [
    {
      cuotaConvenioId: 1n,
      convenioId: 1n,
      numeroCuota: 1,
      valorCuota: 30.9,
      fechaVencimiento: new Date('2026-06-01T00:00:00.000Z'),
      estado: 'PAGADA' as const,
      fechaPago: new Date('2026-06-01T00:00:00.000Z'),
      montoPagado: 30.9,
      saldoPendiente: 0,
      diasRetraso: 0,
      interesMoraAplicado: 0.9,
      pagoCompleto: true,
    },
    {
      cuotaConvenioId: 2n,
      convenioId: 1n,
      numeroCuota: 2,
      valorCuota: 30.9,
      fechaVencimiento: new Date('2026-07-01T00:00:00.000Z'),
      estado: 'PENDIENTE' as const,
      fechaPago: null,
      montoPagado: 0,
      saldoPendiente: 30.9,
      diasRetraso: 0,
      interesMoraAplicado: 0.9,
      pagoCompleto: false,
    },
    {
      cuotaConvenioId: 3n,
      convenioId: 1n,
      numeroCuota: 3,
      valorCuota: 30.9,
      fechaVencimiento: new Date('2026-08-01T00:00:00.000Z'),
      estado: 'PENDIENTE' as const,
      fechaPago: null,
      montoPagado: 0,
      saldoPendiente: 30.9,
      diasRetraso: 0,
      interesMoraAplicado: 0.9,
      pagoCompleto: false,
    },
  ];

  // Installments for agreement 2 (PREPARADO - 6 cuotas, todas pendientes)
  const installmentsAgreement2: Array<{
    cuotaConvenioId: bigint;
    convenioId: bigint;
    numeroCuota: number;
    valorCuota: number;
    fechaVencimiento: Date;
    estado: 'PENDIENTE';
    fechaPago: null;
    montoPagado: number;
    saldoPendiente: number;
    diasRetraso: number;
    interesMoraAplicado: number;
    pagoCompleto: boolean;
  }> = [];
  for (let i = 0; i < 6; i++) {
    const cuotaIndex = 4 + i;
    const valorCuota = i < 5 ? 35.95 : 35.99;
    installmentsAgreement2.push({
      cuotaConvenioId: BigInt(cuotaIndex),
      convenioId: 2n,
      numeroCuota: i + 1,
      valorCuota,
      fechaVencimiento: new Date(`2026-${String(7 + i).padStart(2, '0')}-01T00:00:00.000Z`),
      estado: 'PENDIENTE' as const,
      fechaPago: null,
      montoPagado: 0,
      saldoPendiente: valorCuota,
      diasRetraso: 0,
      interesMoraAplicado: 0,
      pagoCompleto: false,
    });
  }

  // Installments for agreement 3 (ANULADO - 2 cuotas, anuladas)
  const installmentsAgreement3 = [
    {
      cuotaConvenioId: 10n,
      convenioId: 3n,
      numeroCuota: 1,
      valorCuota: 25,
      fechaVencimiento: new Date('2026-05-01T00:00:00.000Z'),
      estado: 'PENDIENTE' as const,
      fechaPago: null,
      montoPagado: 0,
      saldoPendiente: 25,
      diasRetraso: 14,
      interesMoraAplicado: 0,
      pagoCompleto: false,
    },
    {
      cuotaConvenioId: 11n,
      convenioId: 3n,
      numeroCuota: 2,
      valorCuota: 25,
      fechaVencimiento: new Date('2026-06-01T00:00:00.000Z'),
      estado: 'PENDIENTE' as const,
      fechaPago: null,
      montoPagado: 0,
      saldoPendiente: 25,
      diasRetraso: 0,
      interesMoraAplicado: 0,
      pagoCompleto: false,
    },
  ];

  const allInstallments = [
    ...installmentsAgreement1,
    ...installmentsAgreement2,
    ...installmentsAgreement3,
  ];

  for (const inst of allInstallments) {
    const { cuotaConvenioId, ...data } = inst;
    await prisma.cuotaConvenio.upsert({
      where: { cuotaConvenioId },
      update: {},
      create: data,
    });
  }

  console.log(`✅ ${agreementsData.length} agreements and ${allInstallments.length} installments created.`);
}
