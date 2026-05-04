import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { CreateClientUseCase } from './use-cases/create-client.use-case';
import { UpdateClientUseCase } from './use-cases/update-client.use-case';
import { FindOneClientUseCase } from './use-cases/find-one-client.use-case';
import { RemoveClientUseCase } from './use-cases/remove-client.use-case';

@Module({
  controllers: [ClientController],
  providers: [
    ClientService,
    CreateClientUseCase,
    UpdateClientUseCase,
    FindOneClientUseCase,
    RemoveClientUseCase,
  ],
  exports: [
    ClientService,
    CreateClientUseCase,
    UpdateClientUseCase,
    FindOneClientUseCase,
    RemoveClientUseCase,
  ],
})
export class ClientModule {}
