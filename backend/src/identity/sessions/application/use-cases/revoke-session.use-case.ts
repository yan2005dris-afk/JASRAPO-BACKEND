import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class RevokeSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sesionId: string) {
    return this.sessionRepository.revoke(sesionId);
  }
}
