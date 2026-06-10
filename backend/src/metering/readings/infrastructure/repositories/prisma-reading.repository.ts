import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ReadingRepository } from '../../domain/repositories/reading.repository';

@Injectable()
export class PrismaReadingRepository implements ReadingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.LecturasWhereUniqueInput,
  ): Promise<any> {
    return this.prisma.lecturas.findUnique({ where });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturasWhereInput;
    orderBy?: Prisma.LecturasOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.lecturas.findMany(params);
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
