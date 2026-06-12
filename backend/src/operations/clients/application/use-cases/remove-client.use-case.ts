import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { ClientEntity } from '../../domain/entities/client.entity';

@Injectable()
export class RemoveClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string): Promise<ClientEntity> {
    const clienteId = BigInt(id);
    const cliente = await this.clientRepository.findFirst({
      clienteId,
      deletedAt: null,
    });
    if (!cliente) throw new NotFoundException('Cliente no encontrado');

    return this.clientRepository.update(
      { clienteId },
      { deletedAt: new Date() },
    );
  }
}
