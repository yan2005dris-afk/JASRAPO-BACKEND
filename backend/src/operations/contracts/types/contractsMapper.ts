import type { IResponseContract } from './IResponseContract';
import type { Contratos, CategoriaTarifa, Clientes, Comunidades, Sectores, Medidores } from 'src/generated/prisma/client';

/**
 * Tipo de entrada desde Prisma (relación incluída)
 */
export type ContractPrismaRaw = Pick<
  Contratos,
  | 'contratoId'
  | 'clienteId'
  | 'sectorId'
  | 'categoriaTarifaId'
  | 'numeroGuia'
  | 'fechaInicio'
  | 'direccionSuministro'
  | 'estado'
  | 'creadoPor'
  | 'comunidadId'
> & {
  categoriaTarifa?: Pick<
    CategoriaTarifa,
    'categoriaTarifaId' | 'nombre' | 'descripcion' | 'valorBase'
  > | null;
  cliente?: Pick<
    Clientes,
    'clienteId' | 'identificacion' | 'nombres' | 'apellidos' | 'razonSocial'
  > | null;
  comunidad?: Pick<
    Comunidades,
    'comunidadId' | 'codigo' | 'nombre'
  > | null;
  sector?: Pick<
    Sectores,
    'sectorId' | 'codigo' | 'nombre'
  > | null;
  medidor?: Pick<
    Medidores,
    'medidorId' | 'serie' | 'marca' | 'modelo'
  > | null;
};

/**
 * Mapea resultado de Prisma a DTO de response
 * Convierte Decimal a number donde sea necesario
 * Excluye campos internos: updatedAt, createdAt, deletedAt
 */
export function toContractResponse(contract: ContractPrismaRaw): IResponseContract {
  return {
    contratoId: contract.contratoId,
    clienteId: contract.clienteId,
    sectorId: contract.sectorId,
    categoriaTarifaId: contract.categoriaTarifaId,
    numeroGuia: contract.numeroGuia,
    fechaInicio: contract.fechaInicio,
    direccionSuministro: contract.direccionSuministro,
    estado: contract.estado,
    creadoPor: contract.creadoPor,
    comunidadId: contract.comunidadId,
    categoriaTarifa: contract.categoriaTarifa
      ? {
          categoriaTarifaId: contract.categoriaTarifa.categoriaTarifaId,
          nombre: contract.categoriaTarifa.nombre,
          descripcion: contract.categoriaTarifa.descripcion,
          valorBase: Number(contract.categoriaTarifa.valorBase), // Convertir Decimal a number
        }
      : null,
    cliente: contract.cliente
      ? {
          clienteId: contract.cliente.clienteId,
          identificacion: contract.cliente.identificacion,
          nombres: contract.cliente.nombres,
          apellidos: contract.cliente.apellidos,
          razonSocial: contract.cliente.razonSocial,
        }
      : null,
    comunidad: contract.comunidad
      ? {
          comunidadId: contract.comunidad.comunidadId,
          codigo: contract.comunidad.codigo,
          nombre: contract.comunidad.nombre,
        }
      : null,
    sector: contract.sector
      ? {
          sectorId: contract.sector.sectorId,
          codigo: contract.sector.codigo,
          nombre: contract.sector.nombre,
        }
      : null,
    medidor: contract.medidor
      ? {
          medidorId: contract.medidor.medidorId,
          serie: contract.medidor.serie,
          marca: contract.medidor.marca,
          modelo: contract.medidor.modelo,
        }
      : null,
  };
}
