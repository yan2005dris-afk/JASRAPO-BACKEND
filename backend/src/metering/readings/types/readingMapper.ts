import type { IResponseReading } from './IResponseReading';
import type { Lecturas, Contratos, Medidores, Periodos } from 'src/generated/prisma/client';

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
  | 'contratoId'
  | 'descripcionAnomalia'
  | 'fechaValidacion'
  | 'fotoUrlMinIo'
  | 'lecturaInicial'
  | 'periodoId'
  | 'estado'
> & {
  contrato?: Pick<
    Contratos,
    'contratoId' | 'numeroGuia' | 'direccionSuministro' | 'estado'
  > | null;
  medidor?: Pick<
    Medidores,
    'medidorId' | 'serie' | 'marca' | 'modelo'
  > | null;
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
  return {
    lecturaId: reading.lecturaId.toString(),
    fecha: reading.fecha,
    lecturaAnterior: Number(reading.lecturaAnterior), // Convertir Decimal a number
    lecturaActual: Number(reading.lecturaActual), // Convertir Decimal a number
    consumoCalculado: Number(reading.consumoCalculado), // Convertir Decimal a number
    contratoId: reading.contratoId.toString(),
    descripcionAnomalia: reading.descripcionAnomalia,
    fechaValidacion: reading.fechaValidacion,
    fotoUrlMinIo: reading.fotoUrlMinIo,
    isValidada: reading.estado !== 'PENDIENTE',
    lecturaInicial: reading.lecturaInicial,
    periodoId: reading.periodoId,
    tieneAnomalia: !!reading.descripcionAnomalia,
    contrato: reading.contrato
      ? {
          contratoId: reading.contrato.contratoId.toString(),
          numeroGuia: reading.contrato.numeroGuia,
          direccionSuministro: reading.contrato.direccionSuministro,
          estado: reading.contrato.estado,
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
