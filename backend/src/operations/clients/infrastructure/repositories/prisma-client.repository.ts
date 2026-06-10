import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ClientRepository } from '../../domain/repositories/client.repository';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(
    where: Prisma.ClientesWhereInput,
    options?: { include?: Prisma.ClientesInclude; select?: Prisma.ClientesSelect },
  ): Promise<any> {
    return this.prisma.clientes.findFirst({ where, ...options });
  }

  async findUnique(where: Prisma.ClientesWhereUniqueInput): Promise<any> {
    return this.prisma.clientes.findUnique({ where });
  }

  async findMany(params: {
    where?: Prisma.ClientesWhereInput;
    orderBy?: Prisma.ClientesOrderByWithRelationInput;
    select?: Prisma.ClientesSelect;
  }): Promise<any[]> {
    return this.prisma.clientes.findMany(params);
  }

  async create(
    data: Prisma.ClientesCreateInput,
    select?: Prisma.ClientesSelect,
  ): Promise<any> {
    return this.prisma.clientes.create({ data, select });
  }

  async update(
    where: Prisma.ClientesWhereUniqueInput,
    data: Prisma.ClientesUpdateInput,
    select?: Prisma.ClientesSelect,
  ): Promise<any> {
    return this.prisma.clientes.update({ where, data, select });
  }

  async updateMany(
    where: Prisma.ClientesWhereInput,
    data: Prisma.ClientesUpdateManyMutationInput,
  ): Promise<any> {
    return this.prisma.clientes.updateMany({ where, data });
  }

  async findCatalogoTipoIdentificacion(
    where: Prisma.CatalogoTiposIdentificacionWhereUniqueInput,
  ): Promise<any> {
    return this.prisma.catalogoTiposIdentificacion.findUnique({ where });
  }

  async findManyCatalogoTipoIdentificacion(params: {
    where?: Prisma.CatalogoTiposIdentificacionWhereInput;
    orderBy?: Prisma.CatalogoTiposIdentificacionOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.catalogoTiposIdentificacion.findMany(params);
  }
}
