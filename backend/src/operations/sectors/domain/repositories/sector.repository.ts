import { Prisma } from 'src/generated/prisma/client';

export abstract class SectorRepository {
  abstract findUnique(
    where: Prisma.SectoresWhereUniqueInput,
    select?: Prisma.SectoresSelect,
  ): Promise<any>;

  abstract findMany(params?: {
    where?: Prisma.SectoresWhereInput;
    orderBy?: Prisma.SectoresOrderByWithRelationInput;
    skip?: number;
    take?: number;
    select?: Prisma.SectoresSelect;
    include?: Prisma.SectoresInclude;
  }): Promise<any[]>;

  abstract count(params: {
    where?: Prisma.SectoresWhereInput;
  }): Promise<number>;

  abstract create(data: Prisma.SectoresCreateInput): Promise<any>;

  abstract update(
    where: Prisma.SectoresWhereUniqueInput,
    data: Prisma.SectoresUpdateInput,
  ): Promise<any>;

  abstract delete(where: Prisma.SectoresWhereUniqueInput): Promise<any>;

  abstract findComunidad(where: Prisma.ComunidadesWhereUniqueInput): Promise<any>;
}
