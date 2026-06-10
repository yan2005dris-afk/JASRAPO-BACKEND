import { Module } from '@nestjs/common';
import { PermissionsService } from './application/services/permissions.service';
import { PermissionsController } from './interfaces/http/permissions.controller';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { FindAllPermissionsUseCase } from './application/use-cases/find-all-permissions.use-case';
import { FindOnePermissionUseCase } from './application/use-cases/find-one-permission.use-case';
import { UpdatePermissionUseCase } from './application/use-cases/update-permission.use-case';
import { RemovePermissionUseCase } from './application/use-cases/remove-permission.use-case';
import { PermissionRepository } from './domain/repositories/permission.repository';
import { PrismaPermissionRepository } from './infrastructure/repositories/prisma-permission.repository';

@Module({
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    CreatePermissionUseCase,
    FindAllPermissionsUseCase,
    FindOnePermissionUseCase,
    UpdatePermissionUseCase,
    RemovePermissionUseCase,
    {
      provide: PermissionRepository,
      useClass: PrismaPermissionRepository,
    },
  ],
  exports: [
    PermissionsService,
    CreatePermissionUseCase,
    FindAllPermissionsUseCase,
    FindOnePermissionUseCase,
    UpdatePermissionUseCase,
    RemovePermissionUseCase,
    PermissionRepository,
  ],
})
export class PermissionsModule {}
