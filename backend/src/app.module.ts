import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/prisma.module';
import { ClientModule } from './models/client/client.module';
import { ClientModule } from './modules/client/client.module';
import { MenusModule } from './modules/menus/menus.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RolesModule } from './modules/roles/roles.module';
import { StorageModule } from './modules/storage/storage.module';
import { LecturaModule } from './models/lectura/lectura.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    // Limitar peticiones
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // en milisegundos
        limit: 20,
      },
    ]),

    DatabaseModule,
    UserModule,
    AuthModule,
    MenusModule,
    ProfileModule,
    RolesModule,
    PermissionsModule,
    StorageModule,
    LecturaModule
    RedisModule,
    ClientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
