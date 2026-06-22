import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { DiscountEntity } from '../../domain/entities/discount.entity';
import { DiscountMapper } from '../mappers/discount.mapper';
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

  async createCatalogo(data: DiscountCreateInput): Promise<DiscountEntity> {
    const prismaInput = DiscountMapper.toPrismaCreateInput(data);
    const record = await this.prisma.catalogoDescuento.create({
      data: prismaInput,
    });
    return DiscountMapper.toDomain(record);
  }

  async findManyCatalogo(
    params: DiscountFindManyParams,
  ): Promise<DiscountEntity[]> {
    const where = DiscountMapper.toPrismaWhereInput(params.where);
    const records = await this.prisma.catalogoDescuento.findMany({
      where,
      orderBy:
        params.orderBy as Prisma.CatalogoDescuentoOrderByWithRelationInput,
      skip: params.skip,
      take: params.take,
    });
    return DiscountMapper.toDomainList(records);
  }

  async countCatalogo(params: { where?: DiscountWhereInput }): Promise<number> {
    const where = DiscountMapper.toPrismaWhereInput(params.where);
    return this.prisma.catalogoDescuento.count({ where });
  }

  async findUniqueCatalogo(
    where: DiscountWhereUniqueInput,
  ): Promise<DiscountEntity | null> {
    const record = await this.prisma.catalogoDescuento.findUnique({ where });
    return record ? DiscountMapper.toDomain(record) : null;
  }

  async updateCatalogo(
    where: DiscountWhereUniqueInput,
    data: DiscountUpdateInput,
  ): Promise<DiscountEntity> {
    const prismaInput = DiscountMapper.toPrismaUpdateInput(data);
    const record = await this.prisma.catalogoDescuento.update({
      where,
      data: prismaInput,
    });
    return DiscountMapper.toDomain(record);
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
