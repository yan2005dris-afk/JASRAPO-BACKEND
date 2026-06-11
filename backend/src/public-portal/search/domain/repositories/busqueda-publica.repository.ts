import type { Prisma } from 'src/generated/prisma/client';

export abstract class BusquedaPublicaRepository {
  abstract findManyClientes(params: {
    where: Prisma.ClientesWhereInput;
    skip: number;
    take: number;
    orderBy?: Prisma.ClientesOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract countClientes(where: Prisma.ClientesWhereInput): Promise<number>;

  abstract findManyContratos(params: {
    where: Prisma.ContratosWhereInput;
    include?: Prisma.ContratosInclude;
    skip: number;
    take: number;
  }): Promise<any[]>;

  abstract countContratos(where: Prisma.ContratosWhereInput): Promise<number>;
}
