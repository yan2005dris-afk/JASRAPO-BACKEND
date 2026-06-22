import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CatalogoDescuento, Prisma } from 'src/generated/prisma/client';
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

  async createCatalogo(data: DiscountCreateInput): Promise<CatalogoDescuento> {
    return this.prisma.catalogoDescuento.create({ data: data as any });
  }

  async findManyCatalogo(
    params: DiscountFindManyParams,
  ): Promise<CatalogoDescuento[]> {
    return this.prisma.catalogoDescuento.findMany(params as any);
  }

  async countCatalogo(params: { where?: DiscountWhereInput }): Promise<number> {
    return this.prisma.catalogoDescuento.count(params as any);
  }

  async findUniqueCatalogo(
    where: DiscountWhereUniqueInput,
  ): Promise<CatalogoDescuento | null> {
    return this.prisma.catalogoDescuento.findUnique({ where });
  }

  async updateCatalogo(
    where: DiscountWhereUniqueInput,
    data: DiscountUpdateInput,
  ): Promise<CatalogoDescuento> {
    return this.prisma.catalogoDescuento.update({ where, data: data as any });
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
