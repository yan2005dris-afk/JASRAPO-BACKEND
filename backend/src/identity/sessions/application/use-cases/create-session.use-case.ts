import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/repositories/session.repository';
import type { CreateSessionRepositoryData } from '../../domain/types/session.types';

@Injectable()
export class CreateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(data: CreateSessionRepositoryData) {
    return this.sessionRepository.create(data);
  }
}
