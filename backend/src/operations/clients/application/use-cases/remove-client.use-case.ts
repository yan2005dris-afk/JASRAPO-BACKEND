import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { ClientEntity } from '../../domain/entities/client.entity';

@Injectable()
export class RemoveClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: bigint): Promise<ClientEntity> {
    const cliente = await this.clientRepository.findFirst({
      clienteId: id,
      deletedAt: null,
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    return this.clientRepository.update(
      { clienteId: id },
      { deletedAt: new Date() },
    );
  }
}
