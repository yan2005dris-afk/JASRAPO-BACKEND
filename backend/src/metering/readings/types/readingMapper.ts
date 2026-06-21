import type { IResponseReading } from './IResponseReading';
import type { LecturaEntity } from '../domain/entities/lectura.entity';

/**
 * Mapea resultado de Entidad de Dominio a DTO de response
 */
export function toReadingResponse(
  reading: LecturaEntity | null | undefined,
): IResponseReading | null {
  if (!reading) return null;
  const activeContrato = reading.contrato;

  return {
    lecturaId: reading.lecturaId.toString(),
    fecha: reading.fecha,
    lecturaAnterior: reading.lecturaAnterior,
    lecturaActual: reading.lecturaActual,
    consumoCalculado: reading.consumoCalculado,
    contratoId: activeContrato ? activeContrato.contratoId.toString() : '',
    descripcionAnomalia: reading.descripcionAnomalia,
    fechaValidacion: reading.fechaValidacion,
    fotoUrl: reading.fotoUrl,
    isValidada: reading.isValidada,
    lecturaInicial: reading.lecturaInicial,
    periodoId: reading.periodoId,
    tieneAnomalia: reading.tieneAnomalia,
    estado: reading.estado,
    contrato: activeContrato
      ? {
          contratoId: activeContrato.contratoId.toString(),
          numeroGuia: activeContrato.numeroGuia,
          direccionSuministro: activeContrato.direccionSuministro,
          estado: activeContrato.estado,
        }
      : null,
    medidor: reading.medidor
      ? {
          medidorId: reading.medidor.medidorId.toString(),
          serie: reading.medidor.serie,
          marca: reading.medidor.marca,
          modelo: reading.medidor.modelo,
        }
      : null,
    periodoRel: reading.periodoRel
      ? {
          periodoId: reading.periodoRel.periodoId,
          nombre: reading.periodoRel.nombre,
          fechaInicio: reading.periodoRel.fechaInicio,
          fechaFin: reading.periodoRel.fechaFin,
        }
      : null,
  };
}
