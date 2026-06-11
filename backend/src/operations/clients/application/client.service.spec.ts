import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ClientService } from './client.service';
import { ClientRepository } from '../domain/repositories/client.repository';
import { CreateClientUseCase } from './use-cases/create-client.use-case';
import { UpdateClientUseCase } from './use-cases/update-client.use-case';
import { FindOneClientUseCase } from './use-cases/find-one-client.use-case';
import { RemoveClientUseCase } from './use-cases/remove-client.use-case';

describe('ClientService', () => {
  let service: ClientService;
  let createUseCase: CreateClientUseCase;
  let updateUseCase: UpdateClientUseCase;
  let findOneUseCase: FindOneClientUseCase;
  let removeUseCase: RemoveClientUseCase;

  const mockClientRepository = {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findCatalogoTipoIdentificacion: jest.fn(),
    findManyCatalogoTipoIdentificacion: jest.fn(),
    paginateClientes: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: ClientRepository, useValue: mockClientRepository },
        { provide: CreateClientUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateClientUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneClientUseCase, useValue: { execute: jest.fn() } },
        { provide: RemoveClientUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    createUseCase = module.get<CreateClientUseCase>(CreateClientUseCase);
    updateUseCase = module.get<UpdateClientUseCase>(UpdateClientUseCase);
    findOneUseCase = module.get<FindOneClientUseCase>(FindOneClientUseCase);
    removeUseCase = module.get<RemoveClientUseCase>(RemoveClientUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should delegate to CreateClientUseCase', async () => {
    const dto = {
      tipoIdentificacionId: 1,
      identificacion: '123',
    } as any;
    await service.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findAll should call repository with filters', async () => {
    mockClientRepository.paginateClientes.mockResolvedValue({
      data: [],
      total: 0,
    });
    await service.findAll();
    expect(mockClientRepository.paginateClientes).toHaveBeenCalledWith(
      {
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: expect.anything(),
      },
      { page: undefined, limit: undefined },
    );
  });

  it('findAll should apply filters when provided', async () => {
    mockClientRepository.paginateClientes.mockResolvedValue({
      data: [],
      total: 0,
    });
    await service.findAll({ identificacion: '123' });
    expect(mockClientRepository.paginateClientes).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { deletedAt: null },
            { identificacion: { contains: '123', mode: 'insensitive' } },
          ]),
        }),
      }),
      { page: undefined, limit: undefined },
    );
  });

  it('findOne should delegate to FindOneClientUseCase', async () => {
    await service.findOne('1');
    expect(findOneUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('update should delegate to UpdateClientUseCase', async () => {
    const dto = { nombres: 'Test' } as any;
    await service.update('1', dto);
    expect(updateUseCase.execute).toHaveBeenCalledWith('1', dto);
  });

  it('delete should delegate to RemoveClientUseCase', async () => {
    await service.delete('1');
    expect(removeUseCase.execute).toHaveBeenCalledWith('1');
  });
});
