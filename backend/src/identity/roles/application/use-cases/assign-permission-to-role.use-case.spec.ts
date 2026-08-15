import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AssignPermissionToRoleUseCase } from './assign-permission-to-role.use-case';
import { RoleRepository } from '../../domain/repositories/role.repository';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';

describe('AssignPermissionToRoleUseCase', () => {
  let useCase: AssignPermissionToRoleUseCase;
  let roleRepository: RoleRepository;

  const mockRoleRepository = {
    findUnique: jest.fn(),
    findPermission: jest.fn(),
    findFirstAssignment: jest.fn(),
    assignPermission: jest.fn(),
    updateAssignment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignPermissionToRoleUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    useCase = module.get<AssignPermissionToRoleUseCase>(
      AssignPermissionToRoleUseCase,
    );
    roleRepository = module.get<RoleRepository>(RoleRepository);
    jest.clearAllMocks();
  });

  it('should assign a permission to a role', async () => {
    mockRoleRepository.findUnique.mockResolvedValue({ rolId: 1 });
    mockRoleRepository.findPermission.mockResolvedValue({ permisoId: 10 });
    mockRoleRepository.findFirstAssignment.mockResolvedValue(null);
    mockRoleRepository.assignPermission.mockResolvedValue({
      rolPermisoId: 100,
    });

    const result = await useCase.execute(1, 10);

    expect(result).toEqual({ rolPermisoId: 100 });
    expect(mockRoleRepository.assignPermission).toHaveBeenCalledWith(1, 10);
  });

  it('should throw EntityAlreadyExistsException if already assigned', async () => {
    mockRoleRepository.findUnique.mockResolvedValue({ rolId: 1 });
    mockRoleRepository.findPermission.mockResolvedValue({ permisoId: 10 });
    mockRoleRepository.findFirstAssignment.mockResolvedValue({
      rolPermisoId: 100,
      deletedAt: null,
    });

    await expect(useCase.execute(1, 10)).rejects.toThrow(
      EntityAlreadyExistsException,
    );
  });

  it('should restore if previously deleted', async () => {
    mockRoleRepository.findUnique.mockResolvedValue({ rolId: 1 });
    mockRoleRepository.findPermission.mockResolvedValue({ permisoId: 10 });
    mockRoleRepository.findFirstAssignment.mockResolvedValue({
      rolPermisoId: 100,
      deletedAt: new Date(),
    });
    mockRoleRepository.updateAssignment.mockResolvedValue({
      rolPermisoId: 100,
      deletedAt: null,
    });

    const result = await useCase.execute(1, 10);

    expect(result.deletedAt).toBeNull();
    expect(mockRoleRepository.updateAssignment).toHaveBeenCalled();
  });
});
