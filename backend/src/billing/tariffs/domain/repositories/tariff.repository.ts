import { Prisma } from 'src/generated/prisma/client';

export abstract class TariffRepository {
  abstract findFirst(
    where: Prisma.CategoriaTarifaWhereInput,
  ): Promise<any>;

  abstract findMany(params: {
    where?: Prisma.CategoriaTarifaWhereInput;
    orderBy?: Prisma.CategoriaTarifaOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract create(
    data: Prisma.CategoriaTarifaCreateInput,
  ): Promise<any>;

  abstract update(
    where: Prisma.CategoriaTarifaWhereUniqueInput,
    data: Prisma.CategoriaTarifaUpdateInput,
  ): Promise<any>;

  abstract executeTransaction<T>(
    callback: (tx: any) => Promise<T>,
  ): Promise<T>;
}
