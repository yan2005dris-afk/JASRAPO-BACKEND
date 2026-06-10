import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class CreateSessionUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(data: Prisma.SesionesCreateInput) {
    return this.sessionRepository.create(data);
  }
}
