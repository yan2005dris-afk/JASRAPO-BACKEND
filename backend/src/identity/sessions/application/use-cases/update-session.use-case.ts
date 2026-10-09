import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/repositories/session.repository';
import type { UpdateSessionRepositoryData } from '../../domain/types/session.types';

@Injectable()
export class UpdateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sesionId: string, data: UpdateSessionRepositoryData) {
    return this.sessionRepository.update(sesionId, data);
  }
}
