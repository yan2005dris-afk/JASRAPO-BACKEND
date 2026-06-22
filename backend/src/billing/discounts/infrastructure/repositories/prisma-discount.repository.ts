import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  DiscountRepository,
  DiscountCreateInput,
  DiscountFindManyParams,
  DiscountUpdateInput,
  DiscountWhereInput,
  DiscountWhereUniqueInput,
} from '../../domain/repositories/discount.repository';

@Injectable()
export class PrismaDiscountRepository implements DiscountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCatalogo(data: DiscountCreateInput): Promise<any> {
    return this.prisma.catalogoDescuento.create({ data: data as any });
  }

  async findManyCatalogo(params: DiscountFindManyParams): Promise<any[]> {
    return this.prisma.catalogoDescuento.findMany(params as any);
  }

  async countCatalogo(params: { where?: DiscountWhereInput }): Promise<number> {
    return this.prisma.catalogoDescuento.count(params as any);
  }

  async findUniqueCatalogo(where: DiscountWhereUniqueInput): Promise<any> {
    return this.prisma.catalogoDescuento.findUnique({ where });
  }

  async updateCatalogo(
    where: DiscountWhereUniqueInput,
    data: DiscountUpdateInput,
  ): Promise<any> {
    return this.prisma.catalogoDescuento.update({ where, data: data as any });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
