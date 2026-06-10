import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface UserDirectPermissionInput {
  permisoId: number;
  permitido?: boolean;
}

@Injectable()
export class UpdateUserPermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    usuarioId: number,
    permissions: UserDirectPermissionInput[],
    tx?: any,
  ): Promise<void> {
    const user = await this.userRepository.findUnique(
      { usuarioId },
      { usuarioId: true, deletedAt: true },
    );

    if (!user || user.deletedAt) {
      throw new NotFoundException('Usuario no encontrado o eliminado');
    }

    await this.userRepository.updatePermissions(usuarioId, permissions, tx);
  }
}
