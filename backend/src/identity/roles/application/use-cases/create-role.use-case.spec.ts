import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateRoleUseCase } from './create-role.use-case';
import { RoleRepository } from '../../domain/repositories/role.repository';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let roleRepository: RoleRepository;

  const mockRoleRepository = {
    create: jest.fn(),
    syncSequence: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRoleUseCase,
        { provide: RoleRepository, useValue: mockRoleRepository },
      ],
    }).compile();

    useCase = module.get<CreateRoleUseCase>(CreateRoleUseCase);
    roleRepository = module.get<RoleRepository>(RoleRepository);
    jest.clearAllMocks();
  });

  it('should create a role without children (flat roles model)', async () => {
    const dto = { nombre: 'Admin', description: 'Admin role' };
    mockRoleRepository.create.mockResolvedValue({ rolId: 1, nombre: 'Admin' });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ rolId: 1, nombre: 'Admin' });
    expect(mockRoleRepository.create).toHaveBeenCalledWith('Admin');
  });

  it('should create a role with only name (no hierarchy)', async () => {
    const dto = { nombre: 'Operador' };
    mockRoleRepository.create.mockResolvedValue({
      rolId: 5,
      nombre: 'Operador',
    });

    const result = await useCase.execute(dto);

    expect(result).toEqual({ rolId: 5, nombre: 'Operador' });
    expect(mockRoleRepository.create).toHaveBeenCalledWith('Operador');
  });
});
