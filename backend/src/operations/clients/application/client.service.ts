import { Injectable } from '@nestjs/common';
import { CreateClientDto } from '../interfaces/dto/create-client.dto';
import { UpdateClientDto } from '../interfaces/dto/update-client.dto';
import { FilterClientDto } from '../interfaces/dto/filter-client.dto';
import { ClientRepository } from '../domain/repositories/client.repository';
import { CreateClientUseCase } from './use-cases/create-client.use-case';
import { UpdateClientUseCase } from './use-cases/update-client.use-case';
import { FindOneClientUseCase } from './use-cases/find-one-client.use-case';
import { RemoveClientUseCase } from './use-cases/remove-client.use-case';
import { buildClientFilters } from './mappers/client-filters.mapper';
import type { IdentificationTypeRef } from '../domain/types/client.types';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { ClientEntity } from '../domain/entities/client.entity';

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

  async findAll(
    filters?: FilterClientDto,
  ): Promise<PaginatedResult<ClientEntity>> {
    const clientFilters = filters ? buildClientFilters(filters) : undefined;

    return this.clientRepository.paginateClientes(
      {
        filters: clientFilters,
        orderBy: { createdAt: 'desc' },
      },
      { page: filters?.page, limit: filters?.limit },
    );
  }

  async findOne(id: bigint): Promise<ClientEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(id: bigint, dto: UpdateClientDto): Promise<ClientEntity> {
    return this.updateUseCase.execute(id, dto);
  }

  async delete(id: bigint): Promise<ClientEntity> {
    return this.removeUseCase.execute(id);
  }

  /**
   * Get active identification types catalog
   */
  async findAllIdentificaciones(): Promise<IdentificationTypeRef[]> {
    return this.clientRepository.findActiveTipoIdentificaciones();
  }
}
