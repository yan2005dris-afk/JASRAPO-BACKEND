import type { Clientes, Identificacion } from 'src/generated/prisma/client';
import type { IResponseClient } from './IResponseClient';

/**
 * Tipo de entrada desde Prisma (relación incluída)
 */
export type ClientePrismaRaw = Pick<
  Clientes,
  | 'clienteId'
  | 'identificacion'
  | 'nombres'
  | 'apellidos'
  | 'razonSocial'
  | 'email'
  | 'telefono'
  | 'telefonoSecundario'
  | 'direccionDomicilio'
  | 'activo'
  | 'aplicaDiscapacidad'
  | 'aplicaTerceraEdad'
> & {
  tipoIdentificacion?: Pick<
    Identificacion,
    'identificacionId' | 'codigo' | 'nombre'
  > | null;
};

/**
 * Mapea resultado de Prisma a DTO de response
 * Excluye campos internos: updatedAt, createdAt, deletedAt
 */
export function toClienteResponse(cliente: ClientePrismaRaw): IResponseClient {
  return {
    clienteId: cliente.clienteId,
    identificacion: cliente.identificacion,
    nombres: cliente.nombres,
    apellidos: cliente.apellidos,
    razonSocial: cliente.razonSocial,
    email: cliente.email,
    telefono: cliente.telefono,
    telefonoSecundario: cliente.telefonoSecundario,
    direccionDomicilio: cliente.direccionDomicilio,
    activo: cliente.activo,
    aplicaDiscapacidad: cliente.aplicaDiscapacidad,
    aplicaTerceraEdad: cliente.aplicaTerceraEdad,
    tipoIdentificacion: cliente.tipoIdentificacion
      ? {
          identificacionId: cliente.tipoIdentificacion.identificacionId,
          codigo: cliente.tipoIdentificacion.codigo,
          nombre: cliente.tipoIdentificacion.nombre,
        }
      : null,
  };
}