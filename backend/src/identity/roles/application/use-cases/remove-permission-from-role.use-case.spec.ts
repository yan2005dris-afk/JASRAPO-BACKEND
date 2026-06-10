import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemovePermissionFromRoleUseCase } from './remove-permission-from-role.use-case';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { NotFoundException } from '@nestjs/common';

describe('RemovePermissionFromRoleUseCase', () => {
  let useCase: RemovePermissionFromRoleUseCase;
  let roleRepository: RoleRepository;

  const mockRoleRepository = {
    findFirstAssignment: jest.fn(),
    updateAssignment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemovePermissionFromRoleUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    useCase = module.get<RemovePermissionFromRoleUseCase>(
      RemovePermissionFromRoleUseCase,
    );
    roleRepository = module.get<RoleRepository>(RoleRepository);
    jest.clearAllMocks();
  });

  it('should remove a permission from a role', async () => {
    mockRoleRepository.findFirstAssignment.mockResolvedValue({
      rolPermisoId: 100,
    });
    mockRoleRepository.updateAssignment.mockResolvedValue({ permisoId: 10 });

    const result = await useCase.execute(1, 10);

    expect(result).toEqual({ permisoId: 10 });
    expect(mockRoleRepository.updateAssignment).toHaveBeenCalled();
  });

  it('should throw NotFoundException if not assigned', async () => {
    mockRoleRepository.findFirstAssignment.mockResolvedValue(null);

    await expect(useCase.execute(1, 10)).rejects.toThrow(NotFoundException);
  });
});
