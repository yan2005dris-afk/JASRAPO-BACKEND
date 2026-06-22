import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { DiscountRepository } from '../../domain/repositories/discount.repository';

@Injectable()
export class PrismaDiscountRepository implements DiscountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCatalogo(data: Prisma.CatalogoDescuentoCreateInput): Promise<any> {
    return this.prisma.catalogoDescuento.create({ data });
  }

  async findManyCatalogo(params: {
    where?: Prisma.CatalogoDescuentoWhereInput;
    orderBy?: Prisma.CatalogoDescuentoOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<any[]> {
    return this.prisma.catalogoDescuento.findMany(params);
  }

  async countCatalogo(params: {
    where?: Prisma.CatalogoDescuentoWhereInput;
  }): Promise<number> {
    return this.prisma.catalogoDescuento.count(params);
  }

  async findUniqueCatalogo(
    where: Prisma.CatalogoDescuentoWhereUniqueInput,
  ): Promise<any> {
    return this.prisma.catalogoDescuento.findUnique({ where });
  }

  async updateCatalogo(
    where: Prisma.CatalogoDescuentoWhereUniqueInput,
    data: Prisma.CatalogoDescuentoUpdateInput,
  ): Promise<any> {
    return this.prisma.catalogoDescuento.update({ where, data });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
