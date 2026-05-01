import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionUseCase } from './use-cases/create-session.use-case';
import { GetSessionUseCase } from './use-cases/get-session.use-case';
import { UpdateSessionUseCase } from './use-cases/update-session.use-case';
import { RevokeSessionUseCase } from './use-cases/revoke-session.use-case';
import { ListSessionsByUserUseCase } from './use-cases/list-sessions-by-user.use-case';

@Module({
  providers: [
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
