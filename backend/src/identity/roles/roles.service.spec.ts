import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { GetRolePermissionsUseCase } from './use-cases/get-role-permissions.use-case';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case';
import { GetRoleChildrenUseCase } from './use-cases/get-role-children.use-case';
import { SetRoleChildrenUseCase } from './use-cases/set-role-children.use-case';

describe('RolesService', () => {
  let service: RolesService;
  let createUseCase: CreateRoleUseCase;
  let getPermissionsUseCase: GetRolePermissionsUseCase;
  let assignPermissionUseCase: AssignPermissionToRoleUseCase;
  let removePermissionUseCase: RemovePermissionFromRoleUseCase;
  let getChildrenUseCase: GetRoleChildrenUseCase;
  let setChildrenUseCase: SetRoleChildrenUseCase;

  const mockUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: { roles: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() } } },
        { provide: CreateRoleUseCase, useValue: mockUseCase },
        { provide: GetRolePermissionsUseCase, useValue: mockUseCase },
        { provide: AssignPermissionToRoleUseCase, useValue: mockUseCase },
        { provide: RemovePermissionFromRoleUseCase, useValue: mockUseCase },
        { provide: GetRoleChildrenUseCase, useValue: mockUseCase },
        { provide: SetRoleChildrenUseCase, useValue: mockUseCase },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    createUseCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    getPermissionsUseCase = module.get<GetRolePermissionsUseCase>(GetRolePermissionsUseCase);
    assignPermissionUseCase = module.get<AssignPermissionToRoleUseCase>(AssignPermissionToRoleUseCase);
    removePermissionUseCase = module.get<RemovePermissionFromRoleUseCase>(RemovePermissionFromRoleUseCase);
    getChildrenUseCase = module.get<GetRoleChildrenUseCase>(GetRoleChildrenUseCase);
    setChildrenUseCase = module.get<SetRoleChildrenUseCase>(SetRoleChildrenUseCase);
  });

  it('should delegate create to CreateRoleUseCase', async () => {
    const dto = { name: 'Role' } as any;
    await service.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate getRolePermissions to GetRolePermissionsUseCase', async () => {
    await service.getRolePermissions(1);
    expect(getPermissionsUseCase.execute).toHaveBeenCalledWith(1);
  });

  it('should delegate assignPermission to AssignPermissionToRoleUseCase', async () => {
    await service.assignPermission(1, 10);
    expect(assignPermissionUseCase.execute).toHaveBeenCalledWith(1, 10);
  });

  it('should delegate removePermission to RemovePermissionFromRoleUseCase', async () => {
    await service.removePermission(1, 10);
    expect(removePermissionUseCase.execute).toHaveBeenCalledWith(1, 10);
  });

  it('should delegate getRoleChildren to GetRoleChildrenUseCase', async () => {
    await service.getRoleChildren(1);
    expect(getChildrenUseCase.execute).toHaveBeenCalledWith(1);
  });

  it('should delegate setRoleChildren to SetRoleChildrenUseCase', async () => {
    const dto = { childRoleIds: [2] } as any;
    await service.setRoleChildren(1, dto);
    expect(setChildrenUseCase.execute).toHaveBeenCalledWith(1, dto);
  });
});
