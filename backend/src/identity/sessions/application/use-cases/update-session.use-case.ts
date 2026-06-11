import { Injectable } from '@nestjs/common';
import {
  SessionRepository,
  UpdateSessionRepositoryData,
} from '../../domain/repositories/session.repository';

@Injectable()
export class UpdateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sesionId: string, data: UpdateSessionRepositoryData) {
    return this.sessionRepository.update(sesionId, data);
  }
}

