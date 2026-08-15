import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserEntity } from '../../domain/entities/user.entity';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class GetActiveUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserEntity>> {
    return this.userRepository.findManyActive(paginationDto);
  }
}
