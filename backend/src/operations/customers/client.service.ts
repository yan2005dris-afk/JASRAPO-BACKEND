import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { FilterClientDto } from './dto/filter-client.dto';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case';
import { UpdateCustomerUseCase } from './use-cases/update-customer.use-case';
import { FindOneCustomerUseCase } from './use-cases/find-one-customer.use-case';
import { RemoveCustomerUseCase } from './use-cases/remove-customer.use-case';
import { buildClientWhere } from './types/filters';

@Injectable()
export class ClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateCustomerUseCase,
    private readonly updateUseCase: UpdateCustomerUseCase,
    private readonly findOneUseCase: FindOneCustomerUseCase,
    private readonly removeUseCase: RemoveCustomerUseCase,
  ) {}

  async create(dto: CreateClientDto) {
    return this.createUseCase.execute(dto);
  }

  async findAll(filters?: FilterClientDto) {
    const where = filters ? buildClientWhere(filters) : { deletedAt: null };

    return this.prisma.clientes.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
}
