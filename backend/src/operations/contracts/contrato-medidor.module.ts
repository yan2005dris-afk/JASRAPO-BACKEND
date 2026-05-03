import { Module } from '@nestjs/common';
import { ContratoMedidorService } from './contrato-medidor.service';
import { ContratoMedidorController } from './contrato-medidor.controller';
import { CreateContractLinkUseCase } from './use-cases/create-contract-link.use-case';
import { FindAllContractsUseCase } from './use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './use-cases/finalize-meter-link.use-case';

@Module({
  controllers: [ContratoMedidorController],
  providers: [
    ContratoMedidorService,
    CreateContractLinkUseCase,
    FindAllContractsUseCase,
    FindOneContractUseCase,
    UpdateContractUseCase,
    RemoveContractUseCase,
    FinalizeMeterLinkUseCase,
  ],
  exports: [
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
