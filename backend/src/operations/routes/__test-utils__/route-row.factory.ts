import { Decimal } from 'decimal.js';
import type {
  RouteRow,
  OrdenTrabajoRow,
  ReadingForRouteRow,
} from '../infrastructure/repositories/route.include';
import {
  EstadoRuta,
  EstadoOrdenTrabajo,
  EstadoLectura,
} from 'src/shared/enums';

export function routeRow(overrides: Partial<RouteRow> = {}): RouteRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    rutaId: 1n,
    nombre: 'Ruta 1',
    descripcion: null,
    operarioId: 10,
    tipoActividadId: 1,
    comunidadId: 1,
    sectorId: null,
    periodoId: null,
    estado: EstadoRuta.PENDIENTE,
    fechaInicio: null,
    fechaFin: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    tipoActividad: {
      codigo: 'LECTURA',
    },
    ...overrides,
  } as unknown as RouteRow;
}

export function ordenTrabajoRow(
  overrides: Partial<OrdenTrabajoRow> = {},
): OrdenTrabajoRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    ordenTrabajoId: 1n,
    rutaId: 1n,
    contratoId: 1n,
    medidorId: null,
    estado: EstadoOrdenTrabajo.PENDIENTE,
    ordenVisita: 1,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    latitud: null,
    longitud: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    lecturaId: null,
    ruta: {
      tipoActividad: {
        codigo: 'LECTURA',
      },
    },
    contrato: {
      numeroGuia: 'G-001',
      direccionSuministro: 'Calle Principal 123',
      cliente: {
        nombres: 'Juan',
        apellidos: 'Perez',
      },
    },
    medidor: null,
    lectura: null,
    ...overrides,
  } as unknown as OrdenTrabajoRow;
}

export function readingForRouteRow(
  overrides: Partial<ReadingForRouteRow> = {},
): ReadingForRouteRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    lecturaId: 1n,
    medidorId: 1n,
    periodoId: 1,
    lecturaAnterior: new Decimal(100),
    lecturaActual: new Decimal(120),
    consumoCalculado: new Decimal(20),
    descripcionAnomalia: null,
    estado: EstadoLectura.PENDIENTE,
    fecha: now,
    fotoUrl: null,
    observacion: null,
    origen: 'OPERARIO',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    medidor: {
      serie: 'MED-001',
      historial: [
        {
          fechaHasta: null,
          contrato: {
            numeroGuia: 'G-001',
            direccionSuministro: 'Calle Principal 123',
            estadoServicio: 'ACTIVO',
            cliente: {
              nombres: 'Juan',
              apellidos: 'Perez',
            },
            sector: {
              nombre: 'Sector Norte',
            },
          },
        },
      ],
    },
    ...overrides,
  } as unknown as ReadingForRouteRow;
}
