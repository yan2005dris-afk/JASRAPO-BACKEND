import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class GetSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(usuarioId: number, sesionId: string) {
    return this.sessionRepository.findActiveSession(usuarioId, sesionId);
  }
}
