import type {
  TipoAnomalia,
  EstadoNovedad,
  ResolucionEconomicaAnomalia,
} from 'src/shared/enums';

export class WorkOrderNoveltyEntity {
  novedadId: bigint;
  ordenTrabajoId: bigint;
  lecturaId: bigint | null;
  observacion: string | null;
  tipo: TipoAnomalia;
  estado: EstadoNovedad;
  resolucionTipo: ResolucionEconomicaAnomalia | null;
  consumoAjustado: number | null;
  observacionResolucion: string | null;
  resueltoPorUsuarioId: number | null;
  resueltoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  fotoUrl: string | null;
  legacyAnomaliaId: bigint | null;

  constructor(partial: Partial<WorkOrderNoveltyEntity>) {
    Object.assign(this, partial);
  }
}
