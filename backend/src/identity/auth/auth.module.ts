import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './application/auth.service';
import { AuthController } from './interfaces/http/auth.controller';
import { InvitationsController } from './interfaces/http/invitations.controller';
import { UserModule } from 'src/identity/users/user.module';
import { SessionsModule } from 'src/identity/sessions/sessions.module';
import { JwtStrategy } from './interfaces/http/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenStrategy } from './interfaces/http/strategies/refresh.strategy';
import { JwtAuthGuard } from './interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../infrastructure/common/guards/permissions.guard';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshAccessTokenUseCase } from './application/use-cases/refresh-access-token.use-case';
import { UnlockUserAccountUseCase } from './application/use-cases/unlock-user-account.use-case';
import { AcceptInvitationUseCase } from './application/use-cases/accept-invitation.use-case';
import { InvitationService } from './application/services/invitation.service';
import { InvitationTokenGeneratorService } from './application/services/invitation-token-generator.service';
import { InvitationRetryService } from './application/services/invitation-retry.service';
import { InvitationRetryHandler } from './application/services/invitation-retry.handler';
import { InvitationMetricsService } from './application/services/invitation-metrics.service';
import { AuditModule } from 'src/infrastructure/audit/audit.module';
import { MailModule } from 'src/infrastructure/mail/mail.module';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import type { StringValue } from 'ms';

@Module({
  imports: [
    forwardRef(() => UserModule),
    SessionsModule,
    AuditModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<StringValue>(
            'JWT_ACCESS_EXPIRES_IN',
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController, InvitationsController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    JwtAuthGuard,
    PermissionsGuard,
    RegisterUseCase,
    LogoutUseCase,
    LoginUseCase,
    RefreshAccessTokenUseCase,
    UnlockUserAccountUseCase,
    AcceptInvitationUseCase,
    InvitationService,
    InvitationTokenGeneratorService,
    InvitationRetryService,
    InvitationRetryHandler,
    InvitationMetricsService,
    PrismaService,
  ],
  exports: [
    JwtModule,
    RegisterUseCase,
    LogoutUseCase,
    LoginUseCase,
    RefreshAccessTokenUseCase,
    UnlockUserAccountUseCase,
    AcceptInvitationUseCase,
    InvitationService,
    InvitationTokenGeneratorService,
    InvitationRetryService,
  ],
})
export class AuthModule {}
