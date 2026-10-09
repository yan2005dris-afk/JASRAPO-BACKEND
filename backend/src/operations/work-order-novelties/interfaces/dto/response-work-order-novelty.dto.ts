import type { WorkOrderNoveltyRow } from '../../infrastructure/repositories/work-order-novelty.include';
import type {
  TipoAnomalia,
  EstadoNovedad,
  ResolucionEconomicaAnomalia,
} from 'src/shared/enums';

export class ResponseWorkOrderNoveltyDto {
  novedadId: string;
  ordenTrabajoId: string;
  lecturaId: string | null;
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
  fotoUrl: string | null;

  static fromRow(row: WorkOrderNoveltyRow): ResponseWorkOrderNoveltyDto {
    const dto = new ResponseWorkOrderNoveltyDto();
    dto.novedadId = row.novedadId.toString();
    dto.ordenTrabajoId = row.ordenTrabajoId.toString();
    dto.lecturaId = row.lecturaId ? row.lecturaId.toString() : null;
    dto.observacion = row.observacion;
    dto.tipo = row.tipo;
    dto.estado = row.estado;
    dto.resolucionTipo = row.resolucionTipo;
    dto.consumoAjustado = row.consumoAjustado
      ? Number(row.consumoAjustado)
      : null;
    dto.observacionResolucion = row.observacionResolucion;
    dto.resueltoPorUsuarioId = row.resueltoPorUsuarioId;
    dto.resueltoEn = row.resueltoEn;
    dto.createdAt = row.createdAt;
    dto.updatedAt = row.updatedAt;
    dto.fotoUrl = row.fotoUrl;
    return dto;
  }
}
