import type { IResponseReading } from './IResponseReading';
import type {
  Lecturas,
  Contratos,
  Medidores,
  Periodos,
} from 'src/generated/prisma/client';

/**
 * Tipo de entrada desde Prisma (relación incluída)
 */
export type ReadingPrismaRaw = Pick<
  Lecturas,
  | 'lecturaId'
  | 'fecha'
  | 'lecturaAnterior'
  | 'lecturaActual'
  | 'consumoCalculado'
  | 'descripcionAnomalia'
  | 'fechaValidacion'
  | 'fotoUrlMinIo'
  | 'lecturaInicial'
  | 'periodoId'
  | 'estado'
  | 'medidorId'
> & {
  medidor?:
    | (Pick<Medidores, 'medidorId' | 'serie' | 'marca' | 'modelo'> & {
        historial?: Array<{
          contrato: Pick<
            Contratos,
            'contratoId' | 'numeroGuia' | 'direccionSuministro' | 'estado'
          >;
        }>;
      })
    | null;
  periodoRel?: Pick<
    Periodos,
    'periodoId' | 'nombre' | 'fechaInicio' | 'fechaFin'
  > | null;
};

/**
 * Mapea resultado de Prisma a DTO de response
 * Convierte Decimal a number donde sea necesario
 * Excluye campos internos: updatedAt, createdAt, deletedAt
 */
export function toReadingResponse(reading: ReadingPrismaRaw): IResponseReading {
  const activeContrato = reading.medidor?.historial?.[0]?.contrato;

  return {
    lecturaId: reading.lecturaId.toString(),
    fecha: reading.fecha,
    lecturaAnterior: Number(reading.lecturaAnterior), // Convertir Decimal a number
    lecturaActual: Number(reading.lecturaActual), // Convertir Decimal a number
    consumoCalculado: Number(reading.consumoCalculado), // Convertir Decimal a number
    contratoId: activeContrato ? activeContrato.contratoId.toString() : '',
    descripcionAnomalia: reading.descripcionAnomalia,
    fechaValidacion: reading.fechaValidacion,
    fotoUrlMinIo: reading.fotoUrlMinIo,
    isValidada: reading.estado !== 'PENDIENTE',
    lecturaInicial: reading.lecturaInicial,
    periodoId: reading.periodoId,
    tieneAnomalia: !!reading.descripcionAnomalia,
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
