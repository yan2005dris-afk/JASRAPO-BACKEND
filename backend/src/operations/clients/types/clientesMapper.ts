import type { Clientes, CatalogoTiposIdentificacion } from 'src/generated/prisma/client';
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
    CatalogoTiposIdentificacion,
    'id' | 'codigo' | 'descripcion'
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
          id: cliente.tipoIdentificacion.id,
          codigo: cliente.tipoIdentificacion.codigo,
          descripcion: cliente.tipoIdentificacion.descripcion,
        }
      : null,
  };
}
