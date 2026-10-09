import { Injectable } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import type { ClientRow } from '../../infrastructure/repositories/client.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class RemoveClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: bigint): Promise<ClientRow> {
    const cliente = await this.clientRepository.findById(id);
    if (!cliente) throw new EntityNotFoundException('Cliente', id);

    return this.clientRepository.softDelete(id);
  }
}
