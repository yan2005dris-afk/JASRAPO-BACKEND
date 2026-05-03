import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case';
import { UpdateCustomerUseCase } from './use-cases/update-customer.use-case';
import { FindOneCustomerUseCase } from './use-cases/find-one-customer.use-case';
import { RemoveCustomerUseCase } from './use-cases/remove-customer.use-case';

@Module({
  controllers: [ClientController],
  providers: [
    ClientService,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    FindOneCustomerUseCase,
    RemoveCustomerUseCase,
  ],
  exports: [
    ClientService,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    FindOneCustomerUseCase,
    RemoveCustomerUseCase,
  ],
})
export class ClientModule {}
