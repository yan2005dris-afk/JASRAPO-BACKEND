import type { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';
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

  static fromRow(entity: WorkOrderNoveltyEntity): ResponseWorkOrderNoveltyDto {
    const dto = new ResponseWorkOrderNoveltyDto();
    dto.novedadId = entity.novedadId.toString();
    dto.ordenTrabajoId = entity.ordenTrabajoId.toString();
    dto.lecturaId = entity.lecturaId ? entity.lecturaId.toString() : null;
    dto.observacion = entity.observacion;
    dto.tipo = entity.tipo;
    dto.estado = entity.estado;
    dto.resolucionTipo = entity.resolucionTipo;
    dto.consumoAjustado = entity.consumoAjustado;
    dto.observacionResolucion = entity.observacionResolucion;
    dto.resueltoPorUsuarioId = entity.resueltoPorUsuarioId;
    dto.resueltoEn = entity.resueltoEn;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.fotoUrl = entity.fotoUrl;
    return dto;
  }
}
