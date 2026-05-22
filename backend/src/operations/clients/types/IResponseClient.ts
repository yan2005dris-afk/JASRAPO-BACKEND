import type { Prisma } from 'src/generated/prisma/client';

export interface IResponseClient {
  clienteId: bigint;
  identificacion: string;
  nombres: string;
  apellidos: string;
  razonSocial: string | null;
  email: string | null;
  telefono: string | null;
  telefonoSecundario: string | null;
  direccionDomicilio: string | null;
  activo: boolean;
  aplicaDiscapacidad: boolean;
  aplicaTerceraEdad: boolean;
  tipoIdentificacion: {
    id: number;
    codigo: string;
    descripcion: string;
  } | null;
}

export const safeClientesSelect = {
  clienteId: true,
  identificacion: true,
  nombres: true,
  apellidos: true,
  razonSocial: true,
  email: true,
  telefono: true,
  telefonoSecundario: true,
  direccionDomicilio: true,
  activo: true,
  aplicaDiscapacidad: true,
  aplicaTerceraEdad: true,
  tipoIdentificacion: {
    select: {
      id: true,
      codigo: true,
      descripcion: true,
    },
  },
} satisfies Prisma.ClientesSelect;
