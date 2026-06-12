import { Injectable } from '@nestjs/common';
import { CrearContratoMedidorDto } from '../interfaces/dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from '../interfaces/dto/update-contrato-medidor.dto';
import { CreateContractLinkUseCase } from './use-cases/create-contract-link.use-case';
import { FindAllContractsUseCase } from './use-cases/find-all-contracts.use-case';
import { FindOneContractUseCase } from './use-cases/find-one-contract.use-case';
import { UpdateContractUseCase } from './use-cases/update-contract.use-case';
import { RemoveContractUseCase } from './use-cases/remove-contract.use-case';
import { FinalizeMeterLinkUseCase } from './use-cases/finalize-meter-link.use-case';

@Injectable()
export class ContratoMedidorService {
  constructor(
    private readonly createLinkUseCase: CreateContractLinkUseCase,
    private readonly findAllUseCase: FindAllContractsUseCase,
    private readonly findOneUseCase: FindOneContractUseCase,
    private readonly updateUseCase: UpdateContractUseCase,
    private readonly removeUseCase: RemoveContractUseCase,
    private readonly finalizeLinkUseCase: FinalizeMeterLinkUseCase,
  ) {}

  async crearContrato(createDto: CrearContratoMedidorDto): Promise<any> {
    return this.createLinkUseCase.execute(createDto);
  }

  async buscarContratos(
    page = 1,
    limit = 10,
    where?: Record<string, any>,
  ) {
    return this.findAllUseCase.execute(page, limit, where);
  }

  async buscarContrato(id: bigint): Promise<any> {
    return this.findOneUseCase.execute(id);
  }

  async actualizar(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<any> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async finalizarVinculo(id: bigint): Promise<any> {
    return this.finalizeLinkUseCase.execute(id);
  }

  async eliminar(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
