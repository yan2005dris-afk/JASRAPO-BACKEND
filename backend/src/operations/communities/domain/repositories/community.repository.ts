import { Prisma } from 'src/generated/prisma/client';

export abstract class CommunityRepository {
  abstract findUnique(
    where: Prisma.ComunidadesWhereUniqueInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any>;

  abstract findFirst(
    where: Prisma.ComunidadesWhereInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any>;

  abstract findMany(params: {
    select?: Prisma.ComunidadesSelect;
    where?: Prisma.ComunidadesWhereInput;
    orderBy?: Prisma.ComunidadesOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]>;

  abstract create(
    data: Prisma.ComunidadesCreateInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any>;

  abstract update(
    where: Prisma.ComunidadesWhereUniqueInput,
    data: Prisma.ComunidadesUpdateInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any>;
}
