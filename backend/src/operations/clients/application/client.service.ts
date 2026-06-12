import { Injectable } from '@nestjs/common';
import { CreateClientDto } from '../interfaces/dto/create-client.dto';
import { UpdateClientDto } from '../interfaces/dto/update-client.dto';
import { FilterClientDto } from '../interfaces/dto/filter-client.dto';
import { ClientRepository } from '../domain/repositories/client.repository';
import { CreateClientUseCase } from './use-cases/create-client.use-case';
import { UpdateClientUseCase } from './use-cases/update-client.use-case';
import { FindOneClientUseCase } from './use-cases/find-one-client.use-case';
import { RemoveClientUseCase } from './use-cases/remove-client.use-case';
import { buildClientFilters } from '../domain/types/client-filters';
import { IdentificacionMapper } from '../infrastructure/mappers/identificacion.mapper';
import type { IResponseIdentificacion } from '../domain/types/IResponseIdentificacion';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
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

  async findOne(id: string): Promise<ClientEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientEntity> {
    return this.updateUseCase.execute(id, dto);
  }

  async delete(id: string): Promise<ClientEntity> {
    return this.removeUseCase.execute(id);
  }

  /**
   * Get active identification types catalog
   */
  async findAllIdentificaciones(): Promise<IResponseIdentificacion[]> {
    const identificaciones =
      await this.clientRepository.findManyCatalogoTipoIdentificacion({
        where: { activo: true },
        orderBy: { id: 'asc' },
      });

    return identificaciones.map(IdentificacionMapper.toDomain).filter(Boolean) as IResponseIdentificacion[];
  }
}
