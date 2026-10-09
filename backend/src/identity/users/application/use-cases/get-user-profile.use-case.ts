import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRow } from '../../domain/types/user.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usersId: number): Promise<UserRow> {
    const user = await this.userRepository.findById(usersId);

    if (!user || user.deletedAt) {
      throw new EntityNotFoundException('Usuario', usersId);
    }

    return user;
  }
}
