import { Prisma } from 'src/generated/prisma/client';

export abstract class ContractRepository {
  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContratosWhereInput;
    orderBy?: Prisma.ContratosOrderByWithRelationInput;
    select?: Prisma.ContratosSelect;
    include?: Prisma.ContratosInclude;
  }): Promise<any[]>;

  abstract findUnique(
    where: Prisma.ContratosWhereUniqueInput,
    select?: Prisma.ContratosSelect,
  ): Promise<any>;

  abstract count(params: {
    where?: Prisma.ContratosWhereInput;
  }): Promise<number>;

  abstract update(
    where: Prisma.ContratosWhereUniqueInput,
    data: Prisma.ContratosUpdateInput,
  ): Promise<any>;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
