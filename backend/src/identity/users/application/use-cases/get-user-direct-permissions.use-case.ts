import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserDirectPermission } from '../../domain/types/user.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetUserDirectPermissionsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number): Promise<UserDirectPermission[]> {
    const user = await this.userRepository.findById(usuarioId);

    if (!user || user.deletedAt) {
      throw new EntityNotFoundException('Usuario', usuarioId);
    }

    return this.userRepository.findDirectPermissions(usuarioId);
  }
}
