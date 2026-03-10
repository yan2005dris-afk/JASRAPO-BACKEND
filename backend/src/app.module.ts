import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/prisma.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './auth/auth.module';
import { MenusModule } from './modules/menus/menus.module';
import { ProfileModule } from './modules/profile/profile.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { StorageModule } from './modules/storage/storage.module';
import { LecturaModule } from './models/lectura/lectura.module';


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
    RolesModule,
    PermissionsModule,
    StorageModule,
   LecturaModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
