import { Module } from '@nestjs/common';
import { SessionsService } from './application/sessions.service';
import { SessionRepository } from './domain/repositories/session.repository';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository';
import { CreateSessionUseCase } from './application/use-cases/create-session.use-case';
import { GetSessionUseCase } from './application/use-cases/get-session.use-case';
import { UpdateSessionUseCase } from './application/use-cases/update-session.use-case';
import { RevokeSessionUseCase } from './application/use-cases/revoke-session.use-case';
import { ListSessionsByUserUseCase } from './application/use-cases/list-sessions-by-user.use-case';

@Module({
  providers: [
    {
      provide: SessionRepository,
      useClass: PrismaSessionRepository,
    },
    SessionsService,
    CreateSessionUseCase,
    GetSessionUseCase,
    UpdateSessionUseCase,
    RevokeSessionUseCase,
    ListSessionsByUserUseCase,
  ],
  exports: [
    SessionsService,
    CreateSessionUseCase,
    GetSessionUseCase,
    UpdateSessionUseCase,
    RevokeSessionUseCase,
    ListSessionsByUserUseCase,
  ],
})
export class SessionsModule {}
