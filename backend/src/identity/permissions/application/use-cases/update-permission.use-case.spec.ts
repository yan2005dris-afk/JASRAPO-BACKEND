import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdatePermissionUseCase } from './update-permission.use-case';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

describe('UpdatePermissionUseCase', () => {
  let useCase: UpdatePermissionUseCase;
  let permissionRepository: PermissionRepository;

  const mockPermissionRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePermissionUseCase,
        {
          provide: PermissionRepository,
          useValue: mockPermissionRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePermissionUseCase>(UpdatePermissionUseCase);
    permissionRepository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a permission', async () => {
    const id = 1;
    const dto = {
      nombre: 'Test',
      descripcion: 'Test desc',
      recurso: 'test',
      accion: 'test',
    };
    const expectedResult = {
      permisoId: id,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      recurso: dto.recurso,
      accion: dto.accion,
    };
    mockPermissionRepository.update.mockResolvedValue(
      expectedResult,
    );

    const result = await useCase.execute(id, dto);

    expect(mockPermissionRepository.update).toHaveBeenCalledWith(id, dto);
    expect(result).toEqual(expectedResult);
  });
});
