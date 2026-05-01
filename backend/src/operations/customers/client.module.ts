import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case';
import { UpdateCustomerUseCase } from './use-cases/update-customer.use-case';
import { FindOneCustomerUseCase } from './use-cases/find-one-customer.use-case';
import { SearchCustomersUseCase } from './use-cases/search-customers.use-case';
import { RemoveCustomerUseCase } from './use-cases/remove-customer.use-case';

@Module({
  controllers: [ClientController],
  providers: [
    ClientService,
    PrismaService,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    FindOneCustomerUseCase,
    SearchCustomersUseCase,
    RemoveCustomerUseCase,
  ],
  exports: [
    ClientService,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    FindOneCustomerUseCase,
    SearchCustomersUseCase,
    RemoveCustomerUseCase,
  ],
})
export class ClientModule {}
