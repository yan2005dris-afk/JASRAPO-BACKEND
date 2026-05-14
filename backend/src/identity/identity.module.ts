import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { MenusModule } from './menus/menus.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    RolesModule,
    PermissionsModule,
    MenusModule,
    SessionsModule,
  ],
  controllers: [],
  exports: [
    AuthModule,
    UserModule,
    RolesModule,
    PermissionsModule,
    MenusModule,
    SessionsModule,
  ],
})
export class IdentityModule {}
