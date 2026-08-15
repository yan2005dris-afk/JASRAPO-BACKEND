import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { DiscountEntity } from '../../domain/entities/discount.entity';
import { DiscountMapper } from '../mappers/discount.mapper';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import type {
  CreateDiscountData,
  UpdateDiscountData,
  DiscountFilters,
  DiscountFindManyParams,
} from '../../domain/types/discount.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaDiscountRepository implements DiscountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCatalogo(data: CreateDiscountData): Promise<DiscountEntity> {
    try {
      const prismaInput = DiscountMapper.toPrismaCreateInput(data);
      const record = await this.prisma.catalogoDescuento.create({
        data: prismaInput,
      });
      return DiscountMapper.toDomain(record)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('CatalogoDescuento', data.nombre);
      }
      throw error;
    }
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

  async countCatalogo(params: { where?: DiscountFilters }): Promise<number> {
    const where = DiscountMapper.toPrismaWhereInput(params.where);
    return this.prisma.catalogoDescuento.count({ where });
  }

  async findUniqueCatalogo(id: number): Promise<DiscountEntity | null> {
    const record = await this.prisma.catalogoDescuento.findUnique({
      where: { id },
    });
    return DiscountMapper.toDomain(record);
  }

  async updateCatalogo(
    id: number,
    data: UpdateDiscountData,
  ): Promise<DiscountEntity> {
    try {
      const prismaInput = DiscountMapper.toPrismaUpdateInput(data);
      const record = await this.prisma.catalogoDescuento.update({
        where: { id },
        data: prismaInput,
      });
      return DiscountMapper.toDomain(record)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('CatalogoDescuento', id);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'CatalogoDescuento',
          data.nombre ?? id.toString(),
        );
      }
      throw error;
    }
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
