import type { IResponseReadingAnomaly } from './IResponseReadingAnomaly';
import type { LecturaAnomalia, Lecturas } from 'src/generated/prisma/client';

/**
 * Tipo de entrada desde Prisma (relación incluída)
 */
export type ReadingAnomalyPrismaRaw = Pick<
  LecturaAnomalia,
  | 'anomaliaId'
  | 'lecturaId'
  | 'observacion'
  | 'tipo'
  | 'estado'
  | 'fotoUrlMinIo'
> & {
  lectura?: Pick<
    Lecturas,
    'lecturaId' | 'fecha' | 'lecturaActual' | 'consumoCalculado'
  > | null;
};

/**
 * Mapea resultado de Prisma a DTO de response
 * Excluye campos internos: updatedAt, createdAt, deletedAt
 */
export function toReadingAnomalyResponse(anomaly: ReadingAnomalyPrismaRaw): IResponseReadingAnomaly {
  return {
    anomaliaId: anomaly.anomaliaId.toString(),
    lecturaId: anomaly.lecturaId.toString(),
    observacion: anomaly.observacion,
    tipo: anomaly.tipo,
    estado: anomaly.estado,
    fotoUrlMinIo: anomaly.fotoUrlMinIo,
    lectura: anomaly.lectura
      ? {
          lecturaId: anomaly.lectura.lecturaId.toString(),
          fecha: anomaly.lectura.fecha,
          lecturaActual: Number(anomaly.lectura.lecturaActual),
          consumoCalculado: Number(anomaly.lectura.consumoCalculado),
        }
      : null,
  };
}
