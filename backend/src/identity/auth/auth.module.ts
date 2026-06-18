import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './application/auth.service';
import { AuthController } from './interfaces/http/auth.controller';
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
import type { StringValue } from 'ms';

@Module({
  imports: [
    forwardRef(() => UserModule),
    SessionsModule,
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
  controllers: [AuthController],
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
  ],
  exports: [
    JwtModule,
    RegisterUseCase,
    LogoutUseCase,
    LoginUseCase,
    RefreshAccessTokenUseCase,
  ],
})
export class AuthModule {}
