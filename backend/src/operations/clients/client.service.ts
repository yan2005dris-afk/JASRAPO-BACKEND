import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateClientUseCase } from './use-cases/create-client.use-case';
import { UpdateClientUseCase } from './use-cases/update-client.use-case';
import { FindOneClientUseCase } from './use-cases/find-one-client.use-case';
import { RemoveClientUseCase } from './use-cases/remove-client.use-case';
import { buildClientWhere } from './types/clientFilters';
import { toIdentificacionResponse } from './types/identificacionesMapper';
import { safeClientesSelect } from './types/IResponseClient';
import type { IResponseIdentificacion } from './types/IResponseIdentificacion';
import type { IResponseClient } from './types/IResponseClient';

@Injectable()
export class ClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateClientUseCase,
    private readonly updateUseCase: UpdateClientUseCase,
    private readonly findOneUseCase: FindOneClientUseCase,
    private readonly removeUseCase: RemoveClientUseCase,
  ) {}

  async create(dto: CreateClientDto) {
    return this.createUseCase.execute(dto);
  }

  async findAll(filters?: FilterClientDto): Promise<IResponseClient[]> {
    const where = filters ? buildClientWhere(filters) : { deletedAt: null };

    return this.prisma.clientes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: safeClientesSelect,
    });
  }

  async findOne(id: string) {
    return this.findOneUseCase.execute(id);
  }

  async update(id: string, dto: UpdateClientDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async delete(id: string) {
    return this.removeUseCase.execute(id);
  }

  /**
   * Obtener catálogo de identificaciones activas
   */
  async findAllIdentificaciones(): Promise<IResponseIdentificacion[]> {
    const identificaciones =
      await this.prisma.catalogoTiposIdentificacion.findMany({
        where: { activo: true },
        orderBy: { id: 'asc' },
      });

    return identificaciones.map(toIdentificacionResponse);
  }
}
