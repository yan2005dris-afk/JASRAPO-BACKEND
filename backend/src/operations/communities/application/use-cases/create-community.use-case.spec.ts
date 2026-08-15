import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateCommunityUseCase } from './create-community.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';

describe('CreateCommunityUseCase', () => {
  let useCase: CreateCommunityUseCase;

  const mockCommunityRepository = {
    findById: jest.fn(),
    findByCodigo: jest.fn(),
    findActiveByNameOrCode: jest.fn(),
    paginate: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    reactivate: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommunityUseCase,
        { provide: CommunityRepository, useValue: mockCommunityRepository },
      ],
    }).compile();

    useCase = module.get<CreateCommunityUseCase>(CreateCommunityUseCase);

    jest.clearAllMocks();
    mockCommunityRepository.findActiveByNameOrCode.mockResolvedValue(null);
    mockCommunityRepository.findByCodigo.mockResolvedValue(null);
  });

  it('should create a community when active and deleted do not exist', async () => {
    const dto = {
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
    };
    const expected = new CommunityEntity({
      comunidadId: 1,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });
    mockCommunityRepository.create.mockResolvedValue(expected);

    const result = await useCase.execute(dto);

    expect(result).toEqual(expected);
    expect(mockCommunityRepository.findActiveByNameOrCode).toHaveBeenCalledWith(
      'Comunidad Test',
      'CT-001',
    );
    expect(mockCommunityRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should throw EntityAlreadyExistsException when active community has same name', async () => {
    const dto = {
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
    };
    mockCommunityRepository.findActiveByNameOrCode.mockResolvedValue(
      new CommunityEntity({
        comunidadId: 2,
        nombre: 'Comunidad test',
        codigo: 'CT-002',
        porcentajeTasaSeguridad: 5,
        deletedAt: null,
      }),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(
      EntityAlreadyExistsException,
    );
  });

  it('should throw EntityAlreadyExistsException when active community has same code', async () => {
    const dto = {
      nombre: 'Comunidad Otra',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
    };
    mockCommunityRepository.findActiveByNameOrCode.mockResolvedValue(
      new CommunityEntity({
        comunidadId: 2,
        nombre: 'Comunidad Vieja',
        codigo: 'CT-001',
        porcentajeTasaSeguridad: 5,
        deletedAt: null,
      }),
    );

    await expect(useCase.execute(dto)).rejects.toThrow(
      EntityAlreadyExistsException,
    );
  });

  it('should reactivate when a soft-deleted community with same code exists', async () => {
    const dto = {
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 10,
    };
    const deletedEntity = new CommunityEntity({
      comunidadId: 5,
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
      deletedAt: new Date(),
    });
    const reactivatedEntity = new CommunityEntity({
      comunidadId: 5,
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 10,
      deletedAt: null,
    });

    mockCommunityRepository.findActiveByNameOrCode.mockResolvedValue(null);
    mockCommunityRepository.findByCodigo.mockResolvedValue(deletedEntity);
    mockCommunityRepository.reactivate.mockResolvedValue(reactivatedEntity);

    const result = await useCase.execute(dto);

    expect(result).toEqual(reactivatedEntity);
    expect(mockCommunityRepository.reactivate).toHaveBeenCalledWith(5, {
      nombre: 'Comunidad Test',
      porcentajeTasaSeguridad: 10,
    });
  });
});
