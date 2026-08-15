import { Injectable, NotFoundException } from '@nestjs/common';
import {
  UserRepository,
  TransactionContext,
} from '../../domain/repositories/user.repository';
import { UserDirectPermissionInput } from '../../domain/types/user.types';

@Injectable()
export class UpdateUserPermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    usuarioId: number,
    permissions: UserDirectPermissionInput[],
    tx?: TransactionContext,
  ): Promise<void> {
    const user = await this.userRepository.findById(usuarioId);

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    await this.userRepository.updatePermissions(usuarioId, permissions, tx);
  }
}
