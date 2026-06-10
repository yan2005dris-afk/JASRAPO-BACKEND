import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleRepository } from '../domain/repositories/role.repository';
import { CreateRoleUseCase } from './use-cases/create-role.use-case';
import { AssignPermissionToRoleUseCase } from './use-cases/assign-permission-to-role.use-case';
import { RemovePermissionFromRoleUseCase } from './use-cases/remove-permission-from-role.use-case';

describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: RoleRepository;
  let createUseCase: CreateRoleUseCase;
  let assignPermissionUseCase: AssignPermissionToRoleUseCase;
  let removePermissionUseCase: RemovePermissionFromRoleUseCase;

  const mockUseCase = { execute: jest.fn() };

  const mockRoleRepository = {
    findAll: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: RoleRepository, useValue: mockRoleRepository },
        { provide: CreateRoleUseCase, useValue: mockUseCase },
        { provide: AssignPermissionToRoleUseCase, useValue: mockUseCase },
        { provide: RemovePermissionFromRoleUseCase, useValue: mockUseCase },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    createUseCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    assignPermissionUseCase = module.get<AssignPermissionToRoleUseCase>(
      AssignPermissionToRoleUseCase,
    );
    removePermissionUseCase = module.get<RemovePermissionFromRoleUseCase>(
      RemovePermissionFromRoleUseCase,
    );
    roleRepository = module.get<RoleRepository>(RoleRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delegate create to CreateRoleUseCase', async () => {
    const dto = { nombre: 'Role' } as any;
    await service.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('should delegate findAll to RoleRepository', async () => {
    await service.findAll();
    expect(mockRoleRepository.findAll).toHaveBeenCalled();
  });

  it('should throw NotFoundException in findOne if role does not exist', async () => {
    mockRoleRepository.findUnique.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException in findOne if role is deleted', async () => {
    mockRoleRepository.findUnique.mockResolvedValue({
      rolId: 1,
      nombre: 'test',
      deletedAt: new Date(),
    });

    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should return role with permissions in findOne if role is not deleted', async () => {
    mockRoleRepository.findUnique.mockResolvedValue({
      rolId: 1,
      nombre: 'test',
      deletedAt: null,
      rolPermisos: [
        {
          rolPermisoId: 1,
          permisoId: 10,
          permiso: {
            permisoId: 10,
            nombre: 'Consultar Clientes',
            descripcion: 'Permite consultar clientes',
            recurso: 'clientes',
            accion: 'read',
          },
        },
      ],
    });

    const result = await service.findOne(1);
    expect(result).toEqual({
      rolId: 1,
      nombre: 'test',
      permisos: [
        {
          rolPermisoId: 1,
          permisoId: 10,
          nombre: 'Consultar Clientes',
          descripcion: 'Permite consultar clientes',
          recurso: 'clientes',
          accion: 'read',
        },
      ],
    });
  });
});
