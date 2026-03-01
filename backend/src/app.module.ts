import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/prisma.module';
import { UserModule } from './models/user/user.module';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './models/menus/menus.module';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
