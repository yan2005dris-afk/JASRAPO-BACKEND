import { Prisma } from 'src/generated/prisma/client';

export abstract class ClientRepository {
  abstract findFirst(
    where: Prisma.ClientesWhereInput,
    options?: { include?: Prisma.ClientesInclude; select?: Prisma.ClientesSelect },
  ): Promise<any>;

  abstract findUnique(
    where: Prisma.ClientesWhereUniqueInput,
  ): Promise<any>;

  abstract findMany(params: {
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithRelationInput;
    select?: Prisma.ClientesSelect;
  }): Promise<any[]>;

  abstract create(
    data: Prisma.ClientesCreateInput,
    select?: Prisma.ClientesSelect,
  ): Promise<any>;

  abstract update(
    where: Prisma.ClientesWhereUniqueInput,
    data: Prisma.ClientesUpdateInput,
    select?: Prisma.ClientesSelect,
  ): Promise<any>;

  abstract updateMany(
    where: Prisma.ClientesWhereInput,
    data: Prisma.ClientesUpdateManyMutationInput,
  ): Promise<any>;

  abstract findCatalogoTipoIdentificacion(
    where: Prisma.CatalogoTiposIdentificacionWhereUniqueInput,
  ): Promise<any>;

  abstract findManyCatalogoTipoIdentificacion(params: {
    where?: Prisma.CatalogoTiposIdentificacionWhereInput;
    orderBy?: Prisma.CatalogoTiposIdentificacionOrderByWithRelationInput;
  }): Promise<any[]>;
}
