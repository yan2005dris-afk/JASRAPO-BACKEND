import { PrismaClient } from "src/generated/prisma/client";

export async function seedFacturacion(prisma: PrismaClient) {
    const puntoEmision = await prisma.puntosEmision.findFirst({
        include: { establecimiento: { include: { emisor: true } } }
    });
    const rubros = await prisma.rubros.findMany();
    const periodos = await prisma.periodos.findMany({ orderBy: { periodoId: 'asc' } });

    if (!puntoEmision || rubros.length === 0 || periodos.length === 0) {
        console.warn('⚠️ Faltan puntos de emisión, rubros o periodos para el seed de facturación.');
        return;
    }

    const emisorId = puntoEmision.establecimiento.emisorId;
    let secuencialCounter = 1;

    const rubroAgua = rubros.find(r => r.nombre.includes('Agua')) ?? rubros[0];
    const rubroCargo = rubros.find(r => r.nombre.includes('Cargo')) ?? rubros[1];
    const rubroSeguridad = rubros.find(r => r.nombre.includes('Seguridad')) ?? rubros[2];

    const descTerceraEdad = await prisma.catalogoDescuento.findFirst({
        where: { nombre: { contains: 'Tercera Edad' } }
    });

    // Crear prefacturas para contratos base 1, 2, 3 en todos los periodos
    // Contrato 4 ya tiene prefacturas creadas por agreements-prefacturas.seed.ts
    const contratosBaseIds = [1n, 2n, 3n];

    for (const contratoId of contratosBaseIds) {
        const contrato = await prisma.contratos.findUnique({
            where: { contratoId },
            include: { cliente: true },
        });
        if (!contrato) continue;

        for (let idx = 0; idx < periodos.length; idx++) {
            const periodo = periodos[idx];

            // Evitar duplicados
            const existe = await prisma.prefacturas.findFirst({
                where: { contratoId, periodoId: periodo.periodoId, deletedAt: null },
            });
            if (existe) continue;

            // Valores variables por contrato y periodo para tener datos diversos
            const variaciones: Record<string, { consumo: number; subtotal: number; total: number; abono: number; saldo: number; estado: string; meses: number; interes: number }> = {
                '1-1': { consumo: 25, subtotal: 40.0, total: 45.5, abono: 0, saldo: 45.5, estado: 'APROBADA', meses: 3, interes: 2.05 },
                '1-2': { consumo: 20, subtotal: 35.0, total: 39.2, abono: 7.2, saldo: 32.0, estado: 'APROBADA', meses: 2, interes: 0 },
                '1-3': { consumo: 30, subtotal: 70.0, total: 78.0, abono: 0, saldo: 78.0, estado: 'APROBADA', meses: 1, interes: 0 },
                '2-1': { consumo: 15, subtotal: 22.5, total: 25.0, abono: 25.0, saldo: 0, estado: 'PAGADA', meses: 0, interes: 0 },
                '2-2': { consumo: 18, subtotal: 28.0, total: 31.0, abono: 31.0, saldo: 0, estado: 'PAGADA', meses: 0, interes: 0 },
                '2-3': { consumo: 22, subtotal: 50.0, total: 56.0, abono: 0, saldo: 56.0, estado: 'APROBADA', meses: 0, interes: 0 },
                '3-1': { consumo: 10, subtotal: 18.0, total: 20.0, abono: 20.0, saldo: 0, estado: 'PAGADA', meses: 0, interes: 0 },
                '3-2': { consumo: 12, subtotal: 20.0, total: 22.5, abono: 0, saldo: 22.5, estado: 'APROBADA', meses: 1, interes: 0.5 },
                '3-3': { consumo: 28, subtotal: 60.0, total: 67.0, abono: 0, saldo: 67.0, estado: 'APROBADA', meses: 0, interes: 0 },
            };

            const key = `${Number(contratoId)}-${periodo.periodoId}`;
            const v = variaciones[key] ?? { consumo: 20, subtotal: 30.0, total: 33.5, abono: 0, saldo: 33.5, estado: 'APROBADA', meses: 0, interes: 0 };

            const secuencialStr = String(secuencialCounter++).padStart(9, '0');
            const comprobante = await prisma.comprobantes.create({
                data: {
                    emisorId,
                    puntoEmisionId: puntoEmision.id,
                    tipoComprobante: '01', // FACTURA
                    ambiente: '1',
                    tipoEmision: '1',
                    secuencial: secuencialStr,
                    fechaEmision: new Date(),
                    estado: v.estado === 'PAGADA' ? 'AUTORIZADO' : 'PENDIENTE',
                    totalSinImpuestos: v.subtotal,
                    totalDescuento: 0,
                    importeTotal: v.total,
                    receptorTipoIdentificacion: '05',
                    receptorIdentificacion: contrato.cliente.identificacion,
                    receptorRazonSocial: `${contrato.cliente.nombres} ${contrato.cliente.apellidos}`.trim() || (contrato.cliente.razonSocial ?? 'CONSUMIDOR FINAL'),
                    receptorDireccion: contrato.cliente.direccionDomicilio || 'Olón',
                    receptorEmail: contrato.cliente.email || 'yan2005dro@gmail.com',
                }
            });

            const prefactura = await prisma.prefacturas.create({
                data: {
                    contrato: { connect: { contratoId } },
                    periodoRel: { connect: { periodoId: periodo.periodoId } },
                    puntoEmision: { connect: { id: puntoEmision.id } },
                    comprobante: { connect: { id: comprobante.id } },
                    clienteNombre: `${contrato.cliente.nombres} ${contrato.cliente.apellidos}`.trim() || contrato.cliente.razonSocial,
                    clienteIdentificacion: contrato.cliente.identificacion,
                    clienteDireccion: contrato.cliente.direccionDomicilio || 'Olón',
                    clienteEmail: contrato.cliente.email || 'yan2005dro@gmail.com',
                    subtotal: v.subtotal,
                    iva: 0,
                    descuentoTotal: 0,
                    totalPagar: v.total,
                    estado: v.estado as any,
                    interesMora: v.interes,
                    deudaAnterior: 0,
                    saldoVencido: v.saldo,
                    abono: v.abono,
                    saldoActual: v.saldo,
                    meses_atrasado: v.meses,
                }
            });

            // Detalles
            const detalleAgua = await prisma.prefacturaDetalle.create({
                data: {
                    prefactura: { connect: { prefacturaId: prefactura.prefacturaId } },
                    rubro: { connect: { rubroId: rubroAgua.rubroId } },
                    descripcion: 'Consumo de agua potable m3',
                    cantidad: v.consumo,
                    precioUnitario: 0.50,
                    subtotal: v.consumo * 0.50,
                    iva: 0,
                    descuento: 0,
                    total: v.consumo * 0.50,
                    tarifaImpuesto: 0,
                }
            });

            if (descTerceraEdad && Number(contratoId) === 1 && periodo.periodoId === 1) {
                await prisma.descuentoDetalle.create({
                    data: {
                        prefacturaDetalle: { connect: { prefacturaDetalleId: detalleAgua.prefacturaDetalleId } },
                        catalogo: { connect: { id: descTerceraEdad.id } },
                        valorAplicado: 50,
                        montoDescontado: 2.50,
                        esPorcentaje: true,
                    }
                });
            }

            await prisma.prefacturaDetalle.create({
                data: {
                    prefactura: { connect: { prefacturaId: prefactura.prefacturaId } },
                    rubro: { connect: { rubroId: rubroCargo.rubroId } },
                    descripcion: 'Cargo Fijo Mensual',
                    cantidad: 1,
                    precioUnitario: 7.50,
                    subtotal: 7.50,
                    iva: 0,
                    descuento: 0,
                    total: 7.50,
                    tarifaImpuesto: 0,
                }
            });

            await prisma.prefacturaDetalle.create({
                data: {
                    prefactura: { connect: { prefacturaId: prefactura.prefacturaId } },
                    rubro: { connect: { rubroId: rubroSeguridad.rubroId } },
                    descripcion: 'Tasa Seguridad Ciudadana',
                    cantidad: 1,
                    precioUnitario: 2.00,
                    subtotal: 2.00,
                    iva: 0,
                    descuento: 0,
                    total: 2.00,
                    tarifaImpuesto: 0,
                }
            });
        }
    }

    console.log('✅ Prefacturas de prueba creadas para contratos 1, 2 y 3 en todos los periodos.');
}
