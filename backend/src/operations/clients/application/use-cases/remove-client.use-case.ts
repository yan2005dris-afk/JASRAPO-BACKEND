import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { ClientEntity } from '../../domain/entities/client.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class RemoveClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: bigint): Promise<ClientEntity> {
    const cliente = await this.clientRepository.findById(id);
    if (!cliente) throw new EntityNotFoundException('Cliente', id);

    return this.clientRepository.softDelete(id);
  }
}
