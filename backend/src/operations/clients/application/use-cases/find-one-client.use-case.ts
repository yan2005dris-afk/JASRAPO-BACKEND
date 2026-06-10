import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { safeClientesSelect } from '../../domain/types/IResponseClient';

@Injectable()
export class FindOneClientUseCase {
  constructor(private readonly clientRepository: ClientRepository) {}

  async execute(id: string) {
    const clienteId = BigInt(id);
    const cliente = await this.clientRepository.findFirst(
      { clienteId, deletedAt: null },
      { select: safeClientesSelect },
    );

    if (!cliente) throw new NotFoundException('Cliente no encontrado');
    return cliente;
  }
}
