import { Injectable } from '@nestjs/common';
import {
  CreateSessionRepositoryData,
  SessionRepository,
} from '../../domain/repositories/session.repository';

@Injectable()
export class CreateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(data: CreateSessionRepositoryData) {
    return this.sessionRepository.create(data);
  }
}

