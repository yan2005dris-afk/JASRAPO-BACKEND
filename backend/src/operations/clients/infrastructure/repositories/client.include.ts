import type { Prisma } from 'src/generated/prisma/client';

export const clientInclude = {
  tipoIdentificacion: true,
} satisfies Prisma.ClientesInclude;

export type ClientRow = Prisma.ClientesGetPayload<{
  include: typeof clientInclude;
}>;
