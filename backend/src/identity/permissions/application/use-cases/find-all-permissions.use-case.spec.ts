import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindAllPermissionsUseCase } from './find-all-permissions.use-case';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

describe('FindAllPermissionsUseCase', () => {
  let useCase: FindAllPermissionsUseCase;
  let permissionRepository: PermissionRepository;

  const mockPermissionRepository = {
    findAll: jest.fn(),
    count: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated results with default pagination', async () => {
    mockPermissionRepository.findAll.mockResolvedValue([
      {
        permisoId: 1,
        nombre: 'Leer usuarios',
        descripcion: 'Consulta usuarios',
        recurso: 'Users',
        accion: 'Read',
      },
    ]);
    mockPermissionRepository.count.mockResolvedValue(15);

    const result = await useCase.execute();

    expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(0, 10);
    expect(mockPermissionRepository.count).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(15);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
  });

  it('should use custom page and limit', async () => {
    mockPermissionRepository.findAll.mockResolvedValue([]);
    mockPermissionRepository.count.mockResolvedValue(30);

    const result = await useCase.execute(3, 5);

    expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(10, 5);
    expect(result.meta.page).toBe(3);
    expect(result.meta.limit).toBe(5);
    expect(result.meta.ultimaPagina).toBe(6);
  });

  it('should return correct navigation links on page 2', async () => {
    mockPermissionRepository.findAll.mockResolvedValue([]);
    mockPermissionRepository.count.mockResolvedValue(25);

    const result = await useCase.execute(2, 10);

    expect(result.meta.anterior).toBe(1);
    expect(result.meta.siguiente).toBe(3);
    expect(result.meta.ultimaPagina).toBe(3);
  });
});
