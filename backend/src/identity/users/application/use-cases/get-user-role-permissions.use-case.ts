import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRolePermission } from '../../domain/types/user.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetUserRolePermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number): Promise<UserRolePermission[]> {
    const user = await this.userRepository.findById(usuarioId);

    if (!user || user.deletedAt) {
      throw new EntityNotFoundException('Usuario', usuarioId);
    }

    if (!user.rol?.rolId) {
      return [];
    }

    return this.userRepository.findRolePermissions(user.rol.rolId);
  }
}
