import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreatePermissionUseCase } from './create-permission.use-case';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;
  let permissionRepository: PermissionRepository;

  const mockPermissionRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePermissionUseCase,
        { provide: PermissionRepository, useValue: mockPermissionRepository },
      ],
    }).compile();

    useCase = module.get<CreatePermissionUseCase>(CreatePermissionUseCase);
    permissionRepository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('should create a permission', async () => {
    const dto = {
      nombre: 'Leer usuarios',
      descripcion: 'Consulta usuarios',
      recurso: 'Users',
      accion: 'Read',
    };
    mockPermissionRepository.create.mockResolvedValue({
      permisoId: 1,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      recurso: dto.recurso,
      accion: dto.accion,
    });

    const result = await useCase.execute(dto);

    expect(result).toEqual({
      permisoId: 1,
      nombre: 'Leer usuarios',
      descripcion: 'Consulta usuarios',
      recurso: 'Users',
      accion: 'Read',
    });
    expect(mockPermissionRepository.create).toHaveBeenCalledWith({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      recurso: dto.recurso,
      accion: dto.accion,
    });
  });
});
