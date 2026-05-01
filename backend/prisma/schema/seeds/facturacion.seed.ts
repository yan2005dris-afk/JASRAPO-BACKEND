import { PrismaClient } from "src/generated/prisma/client";

export async function seedFacturacion(prisma: PrismaClient) {
    // 1. Obtener datos necesarios
    const contrato = await prisma.contratos.findFirst({
        where: { estado: 'ACTIVO' },
        include: { cliente: true }
    });

    if (!contrato) {
        console.warn('⚠️ No se encontraron contratos activos para el seed de facturación.');
        return;
    }

    const periodo = await prisma.periodos.findFirst({
        where: { estado: 'ABIERTO' }
    });

    const puntoEmision = await prisma.puntosEmision.findFirst();

    const rubros = await prisma.rubros.findMany();
    
    // Buscamos por nombre para ser más seguros en el seed
    const descTerceraEdad = await prisma.catalogoDescuento.findFirst({
        where: { nombre: { contains: 'Tercera Edad' } }
    });

    if (!periodo || !puntoEmision || rubros.length === 0) {
        console.warn('⚠️ Faltan periodos, puntos de emisión o rubros para el seed de facturación.');
        return;
    }

    // 2. Crear una Prefactura de prueba
    const prefactura = await prisma.prefacturas.create({
        data: {
            contrato: { connect: { contratoId: contrato.contratoId } },
            periodoRel: { connect: { periodoId: periodo.periodoId } },
            puntoEmision: { connect: { puntoEmisionId: puntoEmision.puntoEmisionId } },
            clienteNombre: `${contrato.cliente.nombres} ${contrato.cliente.apellidos}`,
            clienteIdentificacion: contrato.cliente.identificacion,
            clienteDireccion: contrato.cliente.direccionDomicilio || 'Olón',
            clienteEmail: contrato.cliente.email || 'test@test.com',
            subtotal: 15.00,
            iva: 0,
            descuentoTotal: 2.50,
            totalPagar: 12.50,
            estado: 'GENERADA',
            interesMora: 0,
            deudaAnterior: 0,
            saldoVencido: 0,
            abono: 0,
            saldoActual: 12.50,
            mesesAtrasado: 0
        }
    });

    // 3. Crear detalles
    const rubroAgua = rubros.find(r => r.nombre.includes('Agua')) || rubros[0];
    const detalleAgua = await prisma.prefacturaDetalle.create({
        data: {
            prefactura: { connect: { prefacturaId: prefactura.prefacturaId } },
            rubro: { connect: { rubroId: rubroAgua.rubroId } },
            descripcion: 'Consumo de agua potable m3',
            cantidad: 1,
            precioUnitario: 5.00,
            subtotal: 5.00,
            iva: 0,
            descuento: 2.50,
            total: 2.50,
            tarifaImpuesto: 0
        }
    });

    if (descTerceraEdad) {
        await prisma.descuentoDetalle.create({
            data: {
                prefacturaDetalle: { connect: { prefacturaDetalleId: detalleAgua.prefacturaDetalleId } },
                catalogo: { connect: { id: descTerceraEdad.id } },
                valorAplicado: 50,
                montoDescontado: 2.50,
                esPorcentaje: true
            }
        });
    }

    const rubroCargo = rubros.find(r => r.nombre.includes('Cargo')) || rubros[1];
    await prisma.prefacturaDetalle.create({
        data: {
            prefactura: { connect: { prefacturaId: prefactura.prefacturaId } },
            rubro: { connect: { rubroId: rubroCargo.rubroId } },
            descripcion: 'Cargo Fijo Mensual',
            cantidad: 1,
            precioUnitario: 5.00,
            subtotal: 5.00,
            iva: 0,
            descuento: 0,
            total: 5.00,
            tarifaImpuesto: 0
        }
    });

    const rubroSeguridad = rubros.find(r => r.nombre.includes('Seguridad')) || rubros[2];
    await prisma.prefacturaDetalle.create({
        data: {
            prefactura: { connect: { prefacturaId: prefactura.prefacturaId } },
            rubro: { connect: { rubroId: rubroSeguridad.rubroId } },
            descripcion: 'Tasa Seguridad Ciudadana',
            cantidad: 1,
            precioUnitario: 5.00,
            subtotal: 5.00,
            iva: 0,
            descuento: 0,
            total: 5.00,
            tarifaImpuesto: 0
        }
    });

    console.log(`✅ Prefactura de prueba creada para el contrato ${contrato.numeroGuia}`);
}
