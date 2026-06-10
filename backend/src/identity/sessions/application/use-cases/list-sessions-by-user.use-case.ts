import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class ListSessionsByUserUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(usuarioId: number) {
    return this.sessionRepository.findActiveSessionsByUser(usuarioId);
  }
}
