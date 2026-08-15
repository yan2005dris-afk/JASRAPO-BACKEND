import type { Prisma } from 'src/generated/prisma/client';
import { ClientEntity } from '../entities/client.entity';

export type IResponseClient = ClientEntity;

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
