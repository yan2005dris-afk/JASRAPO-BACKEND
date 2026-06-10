import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';

@Injectable()
export class PrismaBusquedaPublicaRepository implements BusquedaPublicaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyClientes(params: {
    where: Prisma.ClientesWhereInput;
    skip: number;
    take: number;
    orderBy?: Prisma.ClientesOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.clientes.findMany(params);
  }

  async countClientes(where: Prisma.ClientesWhereInput): Promise<number> {
    return this.prisma.clientes.count({ where });
  }

  async findManyContratos(params: {
    where: Prisma.ContratosWhereInput;
    include?: Prisma.ContratosInclude;
    skip: number;
    take: number;
  }): Promise<any[]> {
    return this.prisma.contratos.findMany(params);
  }

  async countContratos(where: Prisma.ContratosWhereInput): Promise<number> {
    return this.prisma.contratos.count({ where });
  }
}
