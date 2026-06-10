import type { Prisma } from 'src/generated/prisma/client';

export abstract class MeterRepository {
  abstract findUnique(
    where: Prisma.MedidoresWhereUniqueInput,
    select?: Prisma.MedidoresSelect,
  ): Promise<any>;

  abstract findMany(params: {
    select?: Prisma.MedidoresSelect;
    where?: Prisma.MedidoresWhereInput;
    orderBy?: Prisma.MedidoresOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]>;

  abstract create(
    data: Prisma.MedidoresCreateInput,
    select?: Prisma.MedidoresSelect,
  ): Promise<any>;

  abstract update(
    where: Prisma.MedidoresWhereUniqueInput,
    data: Prisma.MedidoresUpdateInput,
    select?: Prisma.MedidoresSelect,
    tx?: any,
  ): Promise<any>;

  abstract createHistory(
    data:
      | Prisma.HistorialMedidoresCreateInput
      | Prisma.HistorialMedidoresUncheckedCreateInput,
    tx?: any,
  ): Promise<any>;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
