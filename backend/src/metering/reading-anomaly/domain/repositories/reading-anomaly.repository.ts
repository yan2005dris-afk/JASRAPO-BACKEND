import { Prisma } from 'src/generated/prisma/client';

export abstract class ReadingAnomalyRepository {
  abstract findUnique(
    where: Prisma.LecturaAnomaliaWhereUniqueInput,
  ): Promise<any>;

  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
    orderBy?: Prisma.LecturaAnomaliaOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract create(
    data: Prisma.LecturaAnomaliaCreateInput | Prisma.LecturaAnomaliaUncheckedCreateInput,
  ): Promise<any>;

  abstract update(
    where: Prisma.LecturaAnomaliaWhereUniqueInput,
    data: Prisma.LecturaAnomaliaUpdateInput | Prisma.LecturaAnomaliaUncheckedUpdateInput,
  ): Promise<any>;
}
