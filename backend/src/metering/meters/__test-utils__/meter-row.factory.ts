import { Decimal } from 'decimal.js';
import type {
  MeterRow,
  MeterHistoryRow,
  ReemplazoMedidorRow,
} from '../infrastructure/repositories/meter.include';

export function meterRow(overrides: Partial<MeterRow> = {}): MeterRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    medidorId: 1n,
    codigo: 'MED-001',
    marca: 'Itron',
    modelo: 'CX1000',
    serie: 'SN-001',
    estado: 'BODEGA',
    fechaInstalacion: null,
    fechaBaja: null,
    motivo: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    historial: [],
    ...overrides,
  } as unknown as MeterRow;
}

export function meterHistoryRow(
  overrides: Partial<MeterHistoryRow> = {},
): MeterHistoryRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    historialId: 10n,
    medidorId: 1n,
    contratoId: 1n,
    fechaDesde: now,
    fechaHasta: null,
    lecturaInicial: new Decimal(100),
    lecturaFinal: null,
    motivo: null,
    observacion: null,
    saldoPendienteCambio: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    medidor: {
      medidorId: 1n,
      codigo: 'MED-001',
      marca: 'Itron',
      modelo: 'CX1000',
      serie: 'SN-001',
      estado: 'INSTALADO',
      fechaInstalacion: now,
      fechaBaja: null,
      motivo: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    contrato: {
      contratoId: 1n,
      clienteId: 10n,
      cliente: {
        clienteId: 10n,
        identificacion: '1712345678',
        nombres: 'Juan',
        apellidos: 'Pérez',
        razonSocial: null,
      },
    },
    reemplazosSaliente: null,
    reemplazosEntrante: null,
    ...overrides,
  } as unknown as MeterHistoryRow;
}

export function reemplazoMedidorRow(
  overrides: Partial<ReemplazoMedidorRow> = {},
): ReemplazoMedidorRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    reemplazoId: 1n,
    contratoId: 1n,
    historialSalienteId: 10n,
    historialEntranteId: 11n,
    lecturaFinalSalienteId: null,
    lecturaInicialEntranteId: null,
    ordenTrabajoId: null,
    periodoOrigenId: 1,
    periodoDestinoId: null,
    mesOrigen: 1,
    mesDestino: null,
    motivo: 'DANO',
    responsabilidadDano: 'NO_APLICA',
    detalleMotivo: null,
    tratamientoSaliente: 'FACTURAR_NORMAL',
    tratamientoEntrante: 'DIRECTO',
    consumoMedidoSaliente: new Decimal(20),
    consumoFacturableSaliente: new Decimal(20),
    consumoMedidoEntrante: new Decimal(0),
    consumoFacturableEntrante: new Decimal(0),
    consumoDiferidoEntrante: new Decimal(0),
    ventanaPromedio: null,
    promedioCalculado: null,
    porcentajeCobro: null,
    tarifaOrigenSnapshot: null,
    prefacturaDetalleSalienteId: null,
    prefacturaDetalleEntranteId: null,
    estado: 'RESUELTO',
    solicitadoPorUsuarioId: 1,
    autorizadoPorUsuarioId: null,
    autorizadoEn: null,
    estadoAprobacion: 'APROBADA',
    claveIdempotencia: 'idem-1',
    origenProcesadoEn: null,
    destinoProcesadoEn: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    creadoPor: null,
    actualizadoPor: null,
    ...overrides,
  } as unknown as ReemplazoMedidorRow;
}
