import type { Prisma } from 'src/generated/prisma/client';

export abstract class ReadingAnomalyRepository {
  abstract findUnique(
    where: Prisma.LecturaAnomaliaWhereUniqueInput,
    select?: Prisma.LecturaAnomaliaSelect,
  ): Promise<any>;

  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
    orderBy?: Prisma.LecturaAnomaliaOrderByWithRelationInput;
    select?: Prisma.LecturaAnomaliaSelect;
    include?: Prisma.LecturaAnomaliaInclude;
  }): Promise<any[]>;

  abstract count(params: {
    where?: Prisma.LecturaAnomaliaWhereInput;
  }): Promise<number>;

  abstract create(
    data:
      | Prisma.LecturaAnomaliaCreateInput
      | Prisma.LecturaAnomaliaUncheckedCreateInput,
  ): Promise<any>;

  abstract update(
    where: Prisma.LecturaAnomaliaWhereUniqueInput,
    data:
      | Prisma.LecturaAnomaliaUpdateInput
      | Prisma.LecturaAnomaliaUncheckedUpdateInput,
  ): Promise<any>;
}
