import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ReadingRepository } from '../../domain/repositories/reading.repository';

@Injectable()
export class PrismaReadingRepository implements ReadingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.LecturasWhereUniqueInput,
    select?: Prisma.LecturasSelect,
  ): Promise<any> {
    return this.prisma.lecturas.findUnique({ where, select });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput;
    select?: Prisma.LecturasSelect;
    include?: Prisma.LecturasInclude;
  }): Promise<any[]> {
    return this.prisma.lecturas.findMany(params);
  }

  async count(params: {
    where?: Prisma.LecturasWhereInput;
  }): Promise<number> {
    return this.prisma.lecturas.count(params);
  }

  async create(
    data: Prisma.LecturasCreateInput | Prisma.LecturasUncheckedCreateInput,
  ): Promise<any> {
    return this.prisma.lecturas.create({ data });
  }

  async update(
    where: Prisma.LecturasWhereUniqueInput,
    data: Prisma.LecturasUpdateInput | Prisma.LecturasUncheckedUpdateInput,
  ): Promise<any> {
    return this.prisma.lecturas.update({ where, data });
  }
}
