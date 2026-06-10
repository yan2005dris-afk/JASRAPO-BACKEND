import { Injectable } from '@nestjs/common';
import { CreateClientDto } from '../../interfaces/dto/create-client.dto';
import { UpdateClientDto } from '../../interfaces/dto/update-client.dto';
import { FilterClientDto } from '../../interfaces/dto/filter-client.dto';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { CreateClientUseCase } from '../use-cases/create-client.use-case';
import { UpdateClientUseCase } from '../use-cases/update-client.use-case';
import { FindOneClientUseCase } from '../use-cases/find-one-client.use-case';
import { RemoveClientUseCase } from '../use-cases/remove-client.use-case';
import { buildClientWhere } from '../../domain/types/clientFilters';
import { toIdentificacionResponse } from '../../domain/types/identificacionesMapper';
import { safeClientesSelect } from '../../domain/types/IResponseClient';
import type { IResponseIdentificacion } from '../../domain/types/IResponseIdentificacion';
import type { IResponseClient } from '../../domain/types/IResponseClient';

@Injectable()
export class ClientService {
  constructor(
    private readonly clientRepository: ClientRepository,
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

    return this.clientRepository.findMany({
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
      await this.clientRepository.findManyCatalogoTipoIdentificacion({
        where: { activo: true },
        orderBy: { id: 'asc' },
      });

    return identificaciones.map(toIdentificacionResponse);
  }
}
