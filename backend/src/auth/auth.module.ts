import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/models/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenStrategy } from './strategies/refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET as string,
      signOptions: {
        expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy, JwtAuthGuard, PermissionsGuard],
  exports: [JwtModule],
})
export class AuthModule { }
