import { Decimal } from 'decimal.js';
import type { ContractRow } from '../infrastructure/repositories/contract.include';

export function contractRow(overrides: Partial<ContractRow> = {}): ContractRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    contratoId: 1n,
    clienteId: 10n,
    sectorId: null,
    categoriaTarifaId: 3,
    numeroGuia: 'GUIA-001',
    fechaInicio: now,
    direccionSuministro: 'Av. Principal 123',
    estadoServicio: undefined as never,
    estadoCobranza: undefined as never,
    creadoPor: null,
    comunidadId: 2,
    tramitadorEsTitular: undefined,
    tramitadorNombre: undefined,
    tramitadorIdentificacion: undefined,
    relacionTramitador: undefined,
    observacionesTramite: undefined,
    otrasNovedades: undefined,
    registradoPorId: null,
    latitud: new Decimal('-1.8021'),
    longitud: new Decimal('-80.7554'),
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    categoriaTarifa: null,
    cliente: null,
    comunidad: null,
    sector: null,
    convenios: [],
    historialMedidores: [],
    ...overrides,
  } as unknown as ContractRow;
}
