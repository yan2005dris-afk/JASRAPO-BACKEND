import type { PrismaClient } from 'src/generated/prisma/client';

/**
 * Seed de pagos y comprobantes para probar el payments-report.
 * Crea comprobantes para prefacturas con estado PAGADA y
 * registros de pago asociados.
 */
export async function seedPagos(prisma: PrismaClient) {
  const empresa = await prisma.empresa.findFirst();
  const puntoEmision = await prisma.puntosEmision.findFirst();
  const formaPago = await prisma.catalogoFormasPago.findFirst({
    where: { codigo: '01' },
  });

  if (!empresa || !puntoEmision || !formaPago) {
    console.warn(
      '⚠️ Faltan empresa, punto de emisión o forma de pago para seed de pagos.',
    );
    return;
  }

  // Prefacturas pagadas: contrato 2 (periodos 1, 2) y contrato 3 (periodo 1)
  const prefacturasPagadas = await prisma.prefacturas.findMany({
    where: {
      estado: 'PAGADA',
      deletedAt: null,
      comprobanteId: null, // evitar duplicados si ya se ejecutó antes
    },
    include: {
      contrato: { include: { cliente: true } },
      periodoRel: true,
    },
  });

  if (prefacturasPagadas.length === 0) {
    console.log('ℹ️ No hay prefacturas pagadas pendientes de comprobante.');
    return;
  }

  // Obtener el último secuencial para generar el siguiente
  const ultimoComprobante = await prisma.comprobantes.findFirst({
    orderBy: { id: 'desc' },
    select: { secuencial: true },
  });
  let siguienteSecuencial = ultimoComprobante
    ? String(Number(ultimoComprobante.secuencial) + 1).padStart(9, '0')
    : '000000001';

  for (const pf of prefacturasPagadas) {
    // 1. Crear comprobante
    const comprobante = await prisma.comprobantes.create({
      data: {
        emisorId: empresa.id,
        puntoEmisionId: puntoEmision.id,
        tipoComprobante: '01', // FACTURA
        ambiente: '1', // PRUEBAS
        tipoEmision: '1',
        secuencial: siguienteSecuencial,
        claveAcceso: `249001234500101001000000001${siguienteSecuencial}123456781`, // ejemplo
        fechaEmision: pf.periodoRel.fechaVencimiento,
        estado: 'AUTORIZADO',
        estadoSri: 'AUTORIZADO',
        fechaAutorizacion: pf.periodoRel.fechaVencimiento,
        totalSinImpuestos: Number(pf.subtotal),
        totalDescuento: Number(pf.descuentoTotal),
        importeTotal: Number(pf.totalPagar),
        moneda: 'DOLAR',
        receptorTipoIdentificacion: '05', // CEDULA
        receptorIdentificacion: pf.clienteIdentificacion,
        receptorRazonSocial: pf.clienteNombre,
        receptorDireccion: pf.clienteDireccion,
        receptorEmail: pf.clienteEmail,
      },
    });

    // 2. Vincular prefactura al comprobante
    await prisma.prefacturas.update({
      where: { prefacturaId: pf.prefacturaId },
      data: { comprobanteId: comprobante.id },
    });

    // 3. Crear pago
    const pago = await prisma.pagos.create({
      data: {
        clienteId: pf.contrato.clienteId,
        fechaPago: pf.periodoRel.fechaVencimiento,
        montoTotalRecibido: Number(pf.totalPagar),
        creadoPor: 'seed',
        estadoValidacion: 'APROBADO',
      },
    });

    // 4. Crear detalle_pago
    await prisma.detallePago.create({
      data: {
        pagoId: pago.pagoId,
        comprobanteId: comprobante.id,
        tipoPago: 'COMPROBANTE',
        montoAbonado: Number(pf.totalPagar),
        formaPagoId: formaPago.id,
        fechaTransaccion: pf.periodoRel.fechaVencimiento,
      },
    });

    // 5. Avanzar secuencial
    siguienteSecuencial = String(Number(siguienteSecuencial) + 1).padStart(9, '0');
  }

  console.log(
    `✅ ${prefacturasPagadas.length} comprobantes, pagos y detalles creados.`,
  );
}
