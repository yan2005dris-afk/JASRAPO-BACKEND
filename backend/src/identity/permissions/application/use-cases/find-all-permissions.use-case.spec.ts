import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllPermissionsUseCase } from './find-all-permissions.use-case';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

describe('FindAllPermissionsUseCase', () => {
  let useCase: FindAllPermissionsUseCase;
  let permissionRepository: PermissionRepository;

  const mockPermissionRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllPermissionsUseCase,
        { provide: PermissionRepository, useValue: mockPermissionRepository },
      ],
    }).compile();

    useCase = module.get<FindAllPermissionsUseCase>(FindAllPermissionsUseCase);
    permissionRepository =
      module.get<PermissionRepository>(PermissionRepository);
  });

  it('should return all permissions', async () => {
    mockPermissionRepository.findAll.mockResolvedValue([
      {
        permisoId: 1,
        nombre: 'Leer usuarios',
        descripcion: 'Consulta usuarios',
        recurso: 'Users',
        accion: 'Read',
      },
    ]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(mockPermissionRepository.findAll).toHaveBeenCalled();
  });
});
