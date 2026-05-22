import type { PrismaClient } from 'src/generated/prisma/client';

/**
 * Seed de datos para probar el flujo de creación de convenios (agreements):
 * - Crea una tasa de interés activa (ParametroTasainteres) si no existe
 * - Crea prefacturas impagadas para contratos SIN convenio activo
 *   para poder probar POST /agreements
 */
export async function seedAgreementsPrefacturas(prisma: PrismaClient) {
  // ── 1. Asegurar que exista una tasa de interés activa ──────────────────────
  const tasaExistente = await prisma.parametroTasainteres.findFirst({
    where: { activo: true, deletedAt: null },
  });

  if (!tasaExistente) {
    await prisma.parametroTasainteres.create({
      data: {
        tasa: 1.5, // 1.5% mensual
        vigenteDesde: new Date('2025-01-01'),
        descripcion: 'Tasa de interés por mora mensual - default seed',
        activo: true,
      },
    });
    console.log('✅ Tasa de interés moratoria (1.5%) creada.');
  } else {
    console.log('ℹ️ Tasa de interés ya existente, saltando.');
  }

  // ── 2. Crear prefacturas impagadas para contratos sin convenio ────────────
  // Usamos contrato 4 que no tiene ningún convenio
  const contrato4 = await prisma.contratos.findFirst({
    where: { contratoId: 4n, deletedAt: null },
    select: { contratoId: true },
  });

  if (!contrato4) {
    console.warn(
      '⚠️ Contrato 4 no encontrado, no se pueden crear prefacturas de prueba.',
    );
    return;
  }

  const periodo = await prisma.periodos.findFirst({
    where: { estado: 'ABIERTO' },
    orderBy: { periodoId: 'asc' },
  });

  const puntoEmision = await prisma.puntosEmision.findFirst();
  const rubros = await prisma.rubros.findMany();

  if (!periodo || !puntoEmision || rubros.length === 0) {
    console.warn('⚠️ Faltan periodos, puntos de emisión o rubros.');
    return;
  }

  const rubroAgua = rubros.find((r) => r.nombre.includes('Agua')) || rubros[0];
  const rubroCargo =
    rubros.find((r) => r.nombre.includes('Cargo')) || rubros[1];
  const rubroSeguridad =
    rubros.find((r) => r.nombre.includes('Seguridad')) || rubros[2];

  // ── Prefactura 1: período 1, 3 meses atrasado, $45.50, GENERADA ──────────
  const p1exists = await prisma.prefacturas.findFirst({
    where: { contratoId: 4n, periodoId: 1, deletedAt: null },
  });

  if (!p1exists) {
    const p1 = await prisma.prefacturas.create({
      data: {
        contrato: { connect: { contratoId: 4n } },
        periodoRel: { connect: { periodoId: 1 } },
        puntoEmision: { connect: { id: puntoEmision.id } },
        clienteNombre: 'Cliente Test Contrato 4',
        clienteIdentificacion: '9999999999',
        clienteDireccion: 'Olón',
        clienteEmail: 'test4@test.com',
        subtotal: 40.0,
        iva: 5.5,
        descuentoTotal: 0,
        totalPagar: 45.5,
        estado: 'GENERADA',
        interesMora: 2.05,
        deudaAnterior: 0,
        saldoVencido: 45.5,
        abono: 0,
        saldoActual: 45.5,
        meses_atrasado: 3,
      },
    });

    await prisma.prefacturaDetalle.createMany({
      data: [
        {
          prefacturaId: p1.prefacturaId,
          rubroId: rubroAgua.rubroId,
          descripcion: 'Consumo de agua m3',
          cantidad: 30,
          precioUnitario: 0.5,
          subtotal: 15.0,
          iva: 1.8,
          total: 16.8,
          tarifaImpuesto: 15,
        },
        {
          prefacturaId: p1.prefacturaId,
          rubroId: rubroCargo.rubroId,
          descripcion: 'Cargo Fijo Mensual',
          cantidad: 3,
          precioUnitario: 5.0,
          subtotal: 15.0,
          iva: 1.8,
          total: 16.8,
          tarifaImpuesto: 15,
        },
        {
          prefacturaId: p1.prefacturaId,
          rubroId: rubroSeguridad.rubroId,
          descripcion: 'Tasa Seguridad Ciudadana',
          cantidad: 3,
          precioUnitario: 2.0,
          subtotal: 6.0,
          iva: 0,
          total: 6.0,
          tarifaImpuesto: 0,
        },
      ],
    });
  }

  // ── Prefactura 2: período 5, 2 meses atrasado, parcial $32.00, APROBADA ──
  const p2exists = await prisma.prefacturas.findFirst({
    where: { contratoId: 4n, periodoId: 5, deletedAt: null },
  });

  if (!p2exists) {
    const p2 = await prisma.prefacturas.create({
      data: {
        contrato: { connect: { contratoId: 4n } },
        periodoRel: { connect: { periodoId: 5 } },
        puntoEmision: { connect: { id: puntoEmision.id } },
        clienteNombre: 'Cliente Test Contrato 4',
        clienteIdentificacion: '9999999999',
        clienteDireccion: 'Olón',
        clienteEmail: 'test4@test.com',
        subtotal: 35.0,
        iva: 4.2,
        descuentoTotal: 0,
        totalPagar: 39.2,
        estado: 'APROBADA',
        interesMora: 0,
        deudaAnterior: 0,
        saldoVencido: 32.0,
        abono: 7.2,
        saldoActual: 32.0,
        meses_atrasado: 2,
      },
    });

    await prisma.prefacturaDetalle.createMany({
      data: [
        {
          prefacturaId: p2.prefacturaId,
          rubroId: rubroAgua.rubroId,
          descripcion: 'Consumo de agua m3',
          cantidad: 25,
          precioUnitario: 0.5,
          subtotal: 12.5,
          iva: 0,
          total: 12.5,
          tarifaImpuesto: 0,
        },
        {
          prefacturaId: p2.prefacturaId,
          rubroId: rubroCargo.rubroId,
          descripcion: 'Cargo Fijo Mensual',
          cantidad: 2,
          precioUnitario: 5.0,
          subtotal: 10.0,
          iva: 1.2,
          total: 11.2,
          tarifaImpuesto: 15,
        },
        {
          prefacturaId: p2.prefacturaId,
          rubroId: rubroSeguridad.rubroId,
          descripcion: 'Tasa Seguridad Ciudadana',
          cantidad: 2,
          precioUnitario: 2.0,
          subtotal: 4.0,
          iva: 0,
          total: 4.0,
          tarifaImpuesto: 0,
        },
      ],
    });
  }

  // ── Prefactura 3: período 10, 1 mes atrasado, $78.00, GENERADA ───────────
  const p3exists = await prisma.prefacturas.findFirst({
    where: { contratoId: 4n, periodoId: 10, deletedAt: null },
  });

  if (!p3exists) {
    const p3 = await prisma.prefacturas.create({
      data: {
        contrato: { connect: { contratoId: 4n } },
        periodoRel: { connect: { periodoId: 10 } },
        puntoEmision: { connect: { id: puntoEmision.id } },
        clienteNombre: 'Cliente Test Contrato 4',
        clienteIdentificacion: '9999999999',
        clienteDireccion: 'Olón',
        clienteEmail: 'test4@test.com',
        subtotal: 70.0,
        iva: 8.0,
        descuentoTotal: 0,
        totalPagar: 78.0,
        estado: 'GENERADA',
        interesMora: 0,
        deudaAnterior: 0,
        saldoVencido: 78.0,
        abono: 0,
        saldoActual: 78.0,
        meses_atrasado: 1,
      },
    });

    await prisma.prefacturaDetalle.createMany({
      data: [
        {
          prefacturaId: p3.prefacturaId,
          rubroId: rubroAgua.rubroId,
          descripcion: 'Consumo de agua m3',
          cantidad: 40,
          precioUnitario: 0.5,
          subtotal: 20.0,
          iva: 2.4,
          total: 22.4,
          tarifaImpuesto: 15,
        },
        {
          prefacturaId: p3.prefacturaId,
          rubroId: rubroCargo.rubroId,
          descripcion: 'Cargo Fijo Mensual',
          cantidad: 4,
          precioUnitario: 5.0,
          subtotal: 20.0,
          iva: 2.4,
          total: 22.4,
          tarifaImpuesto: 15,
        },
        {
          prefacturaId: p3.prefacturaId,
          rubroId: rubroSeguridad.rubroId,
          descripcion: 'Tasa Seguridad Ciudadana',
          cantidad: 4,
          precioUnitario: 2.0,
          subtotal: 8.0,
          iva: 0,
          total: 8.0,
          tarifaImpuesto: 0,
        },
      ],
    });
  }

  console.log('✅ Prefacturas para agreements creadas para contrato 4:');
  console.log('   - Período 1  → $45.50 (3 meses atraso, GENERADA)');
  console.log('   - Período 5  → $32.00 (2 meses atraso, APROBADA, abono $7.20)');
  console.log('   - Período 10 → $78.00 (1 mes atraso, GENERADA)');
  console.log('   → Deuda total: $155.50');
}
