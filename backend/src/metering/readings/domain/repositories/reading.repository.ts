import { Prisma } from 'src/generated/prisma/client';

export abstract class ReadingRepository {
  abstract findUnique(
    where: Prisma.LecturasWhereUniqueInput,
  ): Promise<any>;

  abstract findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract create(
    data: Prisma.LecturasCreateInput | Prisma.LecturasUncheckedCreateInput,
  ): Promise<any>;

  abstract update(
    where: Prisma.LecturasWhereUniqueInput,
    data: Prisma.LecturasUpdateInput | Prisma.LecturasUncheckedUpdateInput,
  ): Promise<any>;
}
