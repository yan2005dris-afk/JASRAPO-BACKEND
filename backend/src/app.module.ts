import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/prisma.module';
import { UserModule } from './models/user/user.module';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './models/menus/menus.module';
import { ProfileModule } from './models/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    MenusModule,
    ProfileModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
