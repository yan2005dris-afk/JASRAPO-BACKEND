import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRow } from '../../domain/types/user.types';

@Injectable()
export class SoftDeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usuarioId: number): Promise<UserRow> {
    return this.userRepository.update(usuarioId, { deletedAt: new Date() });
  }
}
