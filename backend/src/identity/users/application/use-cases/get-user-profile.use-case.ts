import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetUserProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(usersId: number): Promise<UserEntity> {
    const user = await this.userRepository.findById(usersId);

    if (!user || user.deletedAt) {
      throw new EntityNotFoundException('Usuario', usersId);
    }

    return user;
  }
}
