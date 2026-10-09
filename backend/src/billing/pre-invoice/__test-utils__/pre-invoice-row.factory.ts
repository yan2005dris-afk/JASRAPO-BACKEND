import {
  Prisma,
  EstadoLote,
  CodigoSistemaRubro,
} from 'src/generated/prisma/client';
import type {
  PreInvoiceRow,
  PreInvoiceDetailRow,
} from '../infrastructure/repositories/pre-invoice.include';

export function preInvoiceDetailRow(
  overrides?: Partial<PreInvoiceDetailRow>,
): PreInvoiceDetailRow {
  return {
    prefacturaDetalleId: 1n,
    prefacturaId: 1n,
    rubroId: 1,
    descripcion: 'Agua Potable',
    cantidad: new Prisma.Decimal(1),
    precioUnitario: new Prisma.Decimal(10),
    subtotal: new Prisma.Decimal(10),
    iva: new Prisma.Decimal(1.2),
    total: new Prisma.Decimal(11.2),
    codigoImpuestoSri: '2',
    codigoPorcentajeSri: '2',
    tarifaImpuesto: new Prisma.Decimal(12),
    descuento: new Prisma.Decimal(0),
    cuotaConvenioId: null,
    creadoPor: null,
    actualizadoPor: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    rubro: {
      nombre: 'Instalación',
      codigoSistemaRubro: CodigoSistemaRubro.INSTALACION,
    },
    ...overrides,
  };
}

export function preInvoiceRow(
  overrides?: Partial<PreInvoiceRow>,
): PreInvoiceRow {
  return {
    prefacturaId: 1n,
    uuid: 'uuid-1',
    contratoId: 1n,
    loteId: 1n,
    periodoId: 1,
    puntoEmisionId: 1,
    lecturaAnterior: new Prisma.Decimal(0),
    lecturaActual: new Prisma.Decimal(10),
    consumoM3: new Prisma.Decimal(10),
    subtotal: new Prisma.Decimal(100),
    iva: new Prisma.Decimal(12),
    descuentoTotal: new Prisma.Decimal(0),
    totalPagar: new Prisma.Decimal(112),
    deudaAnterior: new Prisma.Decimal(0),
    saldoVencido: new Prisma.Decimal(0),
    abono: new Prisma.Decimal(0),
    saldoActual: new Prisma.Decimal(112),
    interesMora: new Prisma.Decimal(0),
    tasaInteresUsada: new Prisma.Decimal(0),
    meses_atrasado: 0,
    mes: 1,
    estado: 'GENERADA',
    aprobadaPor: null,
    fechaAprobacion: null,
    motivoRechazo: null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    clienteDireccion: 'Calle Principal 123',
    clienteEmail: 'cliente@test.com',
    clienteIdentificacion: '0912345678',
    clienteNombre: 'Juan Perez',
    tarifaNombre: 'Residencial',
    tarifaValorBase: new Prisma.Decimal(5),
    tarifaValorExcedente: new Prisma.Decimal(0.5),
    lecturaId: 1n,
    comprobanteId: null,
    prefacturaDetalle: [],
    contrato: {
      contratoId: 1n,
      numeroGuia: 'GUIA-001',
      cliente: {
        clienteId: 1n,
        nombres: 'Juan',
        apellidos: 'Perez',
        identificacion: '0912345678',
        direccionDomicilio: 'Calle Principal 123',
        email: 'cliente@test.com',
      },
    },
    lote: {
      loteId: 1n,
      estado: EstadoLote.DEFINITIVO,
      comunidad: {
        nombre: 'Comunidad Centro',
      },
    },
    periodoRel: {
      nombre: 'Enero 2026',
      fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
      fechaFin: new Date('2026-01-31T23:59:59.000Z'),
    },
    puntoEmision: {
      id: 1,
      codigo: '001',
      establecimiento: {
        id: 1,
        codigo: '001',
        emisor: {
          id: 1,
          ruc: '0999999999001',
          razonSocial: 'Junta de Agua Potable',
        },
      },
    },
    ...overrides,
  };
}
