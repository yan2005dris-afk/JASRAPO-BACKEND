import { Module } from '@nestjs/common';
import { ClientService } from './application/client.service';
import { ClientController } from './interfaces/http/client.controller';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case';
import { UpdateClientUseCase } from './application/use-cases/update-client.use-case';
import { FindOneClientUseCase } from './application/use-cases/find-one-client.use-case';
import { RemoveClientUseCase } from './application/use-cases/remove-client.use-case';
import { TerceraEdadService } from './application/services/tercera-edad.service';
import { ClientRepository } from './domain/repositories/client.repository';
import { PrismaClientRepository } from './infrastructure/repositories/prisma-client.repository';

@Module({
  controllers: [ClientController],
  providers: [
    { provide: ClientRepository, useClass: PrismaClientRepository },
    ClientService,
    TerceraEdadService,
    CreateClientUseCase,
    UpdateClientUseCase,
    FindOneClientUseCase,
    RemoveClientUseCase,
  ],
  exports: [
    ClientRepository,
    ClientService,
    CreateClientUseCase,
    UpdateClientUseCase,
    FindOneClientUseCase,
    RemoveClientUseCase,
  ],
})
export class ClientModule {}
