import type { WorkOrderNoveltyRow } from '../infrastructure/repositories/work-order-novelty.include';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';

export function workOrderNoveltyRow(
  overrides: Partial<WorkOrderNoveltyRow> = {},
): WorkOrderNoveltyRow {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    novedadId: 1n,
    ordenTrabajoId: 1n,
    lecturaId: null,
    observacion: 'Observacion test',
    tipo: TipoAnomalia.FUGA,
    estado: EstadoNovedad.OPEN,
    resolucionTipo: null,
    consumoAjustado: null,
    observacionResolucion: null,
    resueltoPorUsuarioId: null,
    resueltoEn: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    fotoUrl: null,
    legacyAnomaliaId: null,
    ...overrides,
  };
}
