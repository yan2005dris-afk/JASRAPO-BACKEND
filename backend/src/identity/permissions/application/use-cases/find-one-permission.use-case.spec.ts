import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOnePermissionUseCase } from './find-one-permission.use-case';
import { PermissionRepository } from '../../domain/repositories/permission.repository';
import { NotFoundException } from '@nestjs/common';

describe('FindOnePermissionUseCase', () => {
  let useCase: FindOnePermissionUseCase;
  let permissionRepository: PermissionRepository;

  const mockPermissionRepository = {
    findUnique: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOnePermissionUseCase,
        { provide: PermissionRepository, useValue: mockPermissionRepository },
      ],
    }).compile();

    useCase = module.get<FindOnePermissionUseCase>(FindOnePermissionUseCase);
    permissionRepository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('should return a permission', async () => {
    const mockPermission = {
      permisoId: 1,
      nombre: 'Leer usuarios',
      descripcion: 'Consulta usuarios',
      recurso: 'Users',
      accion: 'Read',
      deletedAt: null,
    };
    mockPermissionRepository.findUnique.mockResolvedValue(mockPermission);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockPermission);
  });

  it('should throw NotFoundException if permission does not exist', async () => {
    mockPermissionRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if permission is deleted', async () => {
    mockPermissionRepository.findUnique.mockResolvedValue({
      permisoId: 1,
      deletedAt: new Date(),
    });

    await expect(useCase.execute(1)).rejects.toThrow(NotFoundException);
  });
});
