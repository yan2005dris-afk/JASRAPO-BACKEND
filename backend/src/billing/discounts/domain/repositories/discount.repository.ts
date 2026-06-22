import type { Prisma } from 'src/generated/prisma/client';

export abstract class DiscountRepository {
  abstract createCatalogo(
    data: Prisma.CatalogoDescuentoCreateInput,
  ): Promise<any>;

  abstract findManyCatalogo(params: {
    where?: Prisma.CatalogoDescuentoWhereInput;
    orderBy?: Prisma.CatalogoDescuentoOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  abstract countCatalogo(params: {
    where?: Prisma.CatalogoDescuentoWhereInput;
  }): Promise<number>;

  abstract findUniqueCatalogo(
    where: Prisma.CatalogoDescuentoWhereUniqueInput,
  ): Promise<any>;

  abstract updateCatalogo(
    where: Prisma.CatalogoDescuentoWhereUniqueInput,
    data: Prisma.CatalogoDescuentoUpdateInput,
  ): Promise<any>;

  abstract executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T>;
}
