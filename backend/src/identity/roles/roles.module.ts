import { Module } from '@nestjs/common';
import { RolesService } from './application/services/roles.service';
import { RolesController } from './interfaces/http/roles.controller';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { AssignPermissionToRoleUseCase } from './application/use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './application/use-cases/remove-permission-from-role.use-case';
import { RoleRepository } from './domain/repositories/role.repository';
import { PrismaRoleRepository } from './infrastructure/repositories/prisma-role.repository';

@Module({
  controllers: [RolesController],
  providers: [
    RolesService,
    CreateRoleUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    {
      provide: RoleRepository,
      useClass: PrismaRoleRepository,
    },
  ],
  exports: [
    RolesService,
    CreateRoleUseCase,
    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
    RoleRepository,
  ],
})
export class RolesModule {}
