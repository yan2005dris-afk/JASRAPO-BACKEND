import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/prisma.module';
import { LecturaModule } from './models/lectura/lectura.module';
import { ClientModule } from './modules/client/client.module';
import { MenusModule } from './modules/menus/menus.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RolesModule } from './modules/roles/roles.module';
import { StorageModule } from './modules/storage/storage.module';
import { UserModule } from './modules/user/user.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { NovedadOperativaModule } from './models/novedad-operativa/novedad-operativa.module';
import { MedidorModule } from './models/medidor/medidor.module';
import { ContratoMedidorModule } from './models/contrato-medidor/contrato-medidor.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),

    // Limitar peticiones
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 20,
        },
      ],
    }),

    DatabaseModule,
    UserModule,
    AuthModule,
    MenusModule,
    ProfileModule,
    RolesModule,
    PermissionsModule,
    StorageModule,
    SessionsModule,
    ClientModule,
    LecturaModule,
    NovedadOperativaModule,
    MedidorModule,
    ContratoMedidorModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
