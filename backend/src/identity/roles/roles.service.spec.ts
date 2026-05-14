import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { GetRolePermissionsUseCase } from './use-cases/get-role-permissions.use-case';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case';

describe('RolesService', () => {
  let service: RolesService;
  let createUseCase: CreateRoleUseCase;
  let getPermissionsUseCase: GetRolePermissionsUseCase;
  let assignPermissionUseCase: AssignPermissionToRoleUseCase;
  let removePermissionUseCase: RemovePermissionFromRoleUseCase;
  let prisma: PrismaService;

  const mockUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: PrismaService,
          useValue: {
            roles: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        { provide: CreateRoleUseCase, useValue: mockUseCase },
        { provide: GetRolePermissionsUseCase, useValue: mockUseCase },
        { provide: AssignPermissionToRoleUseCase, useValue: mockUseCase },
        { provide: RemovePermissionFromRoleUseCase, useValue: mockUseCase },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    createUseCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    getPermissionsUseCase = module.get<GetRolePermissionsUseCase>(
      GetRolePermissionsUseCase,
    );
    assignPermissionUseCase = module.get<AssignPermissionToRoleUseCase>(
      AssignPermissionToRoleUseCase,
    );
    removePermissionUseCase = module.get<RemovePermissionFromRoleUseCase>(
      RemovePermissionFromRoleUseCase,
    );
    prisma = module.get<PrismaService>(PrismaService);
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

  it('should filter deleted roles in findAll', async () => {
    await service.findAll();
    expect(prisma.roles.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
    });
  });

  it('should throw NotFoundException in findOne if role does not exist', async () => {
    (prisma.roles.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException in findOne if role is deleted', async () => {
    (prisma.roles.findUnique as jest.Mock).mockResolvedValue({
      rolId: 1,
      nombre: 'test',
      deletedAt: new Date(),
    });

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should return role in findOne if role is not deleted', async () => {
    (prisma.roles.findUnique as jest.Mock).mockResolvedValue({
      rolId: 1,
      nombre: 'test',
      deletedAt: null,
    });

    const result = await service.findOne(1);
    expect(result).toEqual({ rolId: 1, nombre: 'test', deletedAt: null });
  });
});
