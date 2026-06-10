import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { SectorRepository } from '../../domain/repositories/sector.repository';

@Injectable()
export class PrismaSectorRepository implements SectorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: Prisma.SectoresWhereUniqueInput): Promise<any> {
    return this.prisma.sectores.findUnique({ where });
  }

  async findMany(params?: {
    where?: Prisma.SectoresWhereInput;
    orderBy?: Prisma.SectoresOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.sectores.findMany(params);
  }

  async create(data: Prisma.SectoresCreateInput): Promise<any> {
    return this.prisma.sectores.create({ data });
  }

  async update(
    where: Prisma.SectoresWhereUniqueInput,
    data: Prisma.SectoresUpdateInput,
  ): Promise<any> {
    return this.prisma.sectores.update({ where, data });
  }

  async delete(where: Prisma.SectoresWhereUniqueInput): Promise<any> {
    return this.prisma.sectores.delete({ where });
  }

  async findComunidad(where: Prisma.ComunidadesWhereUniqueInput): Promise<any> {
    return this.prisma.comunidades.findUnique({ where });
  }
}
