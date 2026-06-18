import type { IResponseReadingAnomaly } from './IResponseReadingAnomaly';
import type { ReadingAnomalyEntity } from '../domain/entities/reading-anomaly.entity';

/**
 * Mapea resultado de Entidad de Dominio a DTO de response
 */
export function toReadingAnomalyResponse(
  anomaly: ReadingAnomalyEntity | null | undefined,
): IResponseReadingAnomaly | null {
  if (!anomaly) return null;
  return {
    anomaliaId: anomaly.anomaliaId.toString(),
    lecturaId: anomaly.lecturaId.toString(),
    observacion: anomaly.observacion,
    tipo: anomaly.tipo,
    estado: anomaly.estado,
    fotoUrl: anomaly.fotoUrl,
    lectura: anomaly.lectura
      ? {
          lecturaId: anomaly.lectura.lecturaId.toString(),
          fecha: anomaly.lectura.fecha,
          lecturaActual: anomaly.lectura.lecturaActual,
          consumoCalculado: anomaly.lectura.consumoCalculado,
        }
      : null,
  };
}
