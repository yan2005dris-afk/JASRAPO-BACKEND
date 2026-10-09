import type { Prisma } from 'src/generated/prisma/client';

export const contractInclude = {
  categoriaTarifa: true,
  cliente: true,
  comunidad: true,
  sector: true,
  historialMedidores: {
    include: {
      medidor: {
        include: {
          lecturas: {
            where: { estado: 'APROBADA', deletedAt: null },
            orderBy: [{ fecha: 'desc' }, { lecturaId: 'desc' }],
            take: 1,
          },
        },
      },
    },
  },
  convenios: {
    where: {
      deletedAt: null,
      estado: { in: ['ACTIVO', 'PENDIENTE_ABONO'] },
    },
    select: { convenioId: true },
    take: 1,
  },
} satisfies Prisma.ContratosInclude;

export type ContractRow = Prisma.ContratosGetPayload<{
  include: typeof contractInclude;
}>;
