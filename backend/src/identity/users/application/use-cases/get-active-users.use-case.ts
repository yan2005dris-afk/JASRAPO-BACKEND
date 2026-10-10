import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserRow } from '../../domain/types/user.types';
import { PaginationDto } from 'src/shared/pagination/pagination.dto';
import { PaginatedResult } from 'src/shared/pagination/pagination.types';

@Injectable()
export class GetActiveUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<UserRow>> {
    return this.userRepository.findManyActive(paginationDto);
  }
}
