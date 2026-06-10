import { Prisma } from 'src/generated/prisma/client';

export abstract class ContractRepository {
  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContratosWhereInput;
    orderBy?: Prisma.ContratosOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract findUnique(where: Prisma.ContratosWhereUniqueInput): Promise<any>;

  abstract update(
    where: Prisma.ContratosWhereUniqueInput,
    data: Prisma.ContratosUpdateInput,
  ): Promise<any>;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
