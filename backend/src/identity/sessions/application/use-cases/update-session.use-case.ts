import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class UpdateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(sesionId: string, data: Prisma.SesionesUpdateInput) {
    return this.sessionRepository.update(sesionId, data);
  }
}
