import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case';
import { UpdateCustomerUseCase } from './use-cases/update-customer.use-case';
import { FindOneCustomerUseCase } from './use-cases/find-one-customer.use-case';
import { SearchCustomersUseCase } from './use-cases/search-customers.use-case';
import { RemoveCustomerUseCase } from './use-cases/remove-customer.use-case';

@Injectable()
export class ClientService {
  constructor(
    private prisma: PrismaService,
    private readonly createUseCase: CreateCustomerUseCase,
    private readonly updateUseCase: UpdateCustomerUseCase,
    private readonly findOneUseCase: FindOneCustomerUseCase,
    private readonly searchUseCase: SearchCustomersUseCase,
    private readonly removeUseCase: RemoveCustomerUseCase,
  ) {}

  async create(dto: CreateClientDto) {
    return this.createUseCase.execute(dto);
  }

  async findAll() {
    return this.prisma.clientes.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.findOneUseCase.execute(id);
  }

  async update(id: string, dto: UpdateClientDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async remove(id: string) {
    return this.removeUseCase.execute(id);
  }

  async search(
    tipo: 'identificacion' | 'nombres' | 'apellidos' | 'nombreCompleto',
    valor: string,
    page = 1,
    limit = 10,
  ) {
    return this.searchUseCase.execute(tipo, valor, page, limit);
  }
}
