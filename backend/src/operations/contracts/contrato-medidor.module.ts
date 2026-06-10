import { Module } from '@nestjs/common';
import { ContratoMedidorService } from './application/contrato-medidor.service';
import { ContratoMedidorController } from './interfaces/http/contrato-medidor.controller';
import { CreateContractLinkUseCase } from './application/use-cases/create-contract-link.use-case';
import { FindAllContractsUseCase } from './application/use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './application/use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './application/use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './application/use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './application/use-cases/finalize-meter-link.use-case';
import { ContractRepository } from './domain/repositories/contract.repository';
import { PrismaContractRepository } from './infrastructure/repositories/prisma-contract.repository';

@Module({
  controllers: [ContratoMedidorController],
  providers: [
    { provide: ContractRepository, useClass: PrismaContractRepository },
    ContratoMedidorService,
    CreateContractLinkUseCase,
    FindAllContractsUseCase,
    FindOneContractUseCase,
    UpdateContractUseCase,
    RemoveContractUseCase,
    FinalizeMeterLinkUseCase,
  ],
  exports: [
    ContractRepository,
    ContratoMedidorService,
    CreateContractLinkUseCase,
    FindAllContractsUseCase,
    FindOneContractUseCase,
    UpdateContractUseCase,
    RemoveContractUseCase,
    FinalizeMeterLinkUseCase,
  ],
})
export class ContratoMedidorModule {}
