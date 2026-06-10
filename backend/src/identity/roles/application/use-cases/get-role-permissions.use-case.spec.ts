import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetRolePermissionsUseCase } from './get-role-permissions.use-case';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { NotFoundException } from '@nestjs/common';

describe('GetRolePermissionsUseCase', () => {
  let useCase: GetRolePermissionsUseCase;
  let roleRepository: RoleRepository;

  const mockRoleRepository = {
    findUnique: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRolePermissionsUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    useCase = module.get<GetRolePermissionsUseCase>(GetRolePermissionsUseCase);
    roleRepository = module.get<RoleRepository>(RoleRepository);
    jest.clearAllMocks();
  });

  it('should return permissions for a role (flat model)', async () => {
    mockRoleRepository.findUnique.mockResolvedValue({
      rolId: 1,
      rolPermisos: [
        {
          rolPermisoId: 1,
          permisoId: 10,
          permiso: { permisoId: 10, recurso: 'Users', accion: 'Read' },
        },
        {
          rolPermisoId: 2,
          permisoId: 11,
          permiso: { permisoId: 11, recurso: 'Users', accion: 'Write' },
        },
      ],
    });

    const result = await useCase.execute(1);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      rolPermisoId: 1,
      permisoId: 10,
      recurso: 'Users',
      accion: 'Read',
    });
    expect(mockRoleRepository.findUnique).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException if role does not exist', async () => {
    mockRoleRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
