import type { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';
import type { Prisma } from 'src/generated/prisma/client';
import type { EstadoMedidor } from 'src/generated/prisma/enums';

export interface IResponseMeters {
  medidorId: bigint;
  contratoId: bigint | null;
  marca: string;
  modelo: string;
  serie: string;
  estado: EstadoMedidor;
  fechaInstalacion: Date | null;
  fechaBaja: Date | null;
  motivo: string | null;
  latitud: Decimal | null;
  longitud: Decimal | null;
}

export const safeMeterSelect = {
  medidorId: true,
  contratoId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
} satisfies Prisma.MedidoresSelect;

export const safeMeterSelectWithDelete = {
  medidorId: true,
  contratoId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
  deletedAt: true,
} satisfies Prisma.MedidoresSelect;
