import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemovePermissionUseCase } from './remove-permission.use-case';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

describe('RemovePermissionUseCase', () => {
  let useCase: RemovePermissionUseCase;
  let permissionRepository: PermissionRepository;

  const mockPermissionRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemovePermissionUseCase,
        {
          provide: PermissionRepository,
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    useCase = module.get<RemovePermissionUseCase>(RemovePermissionUseCase);
    permissionRepository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete a permission', async () => {
    const id = 1;
    const expectedResult = {
      permisoId: id,
      nombre: 'Test',
      descripcion: 'Test desc',
      recurso: 'test',
      accion: 'test',
    };
    mockPermissionRepository.update.mockResolvedValue(
      expectedResult,
    );

    const result = await useCase.execute(id);

    expect(mockPermissionRepository.update).toHaveBeenCalledWith(id, {
      deletedAt: expect.any(Date),
    });
    expect(result).toEqual(expectedResult);
  });
});
