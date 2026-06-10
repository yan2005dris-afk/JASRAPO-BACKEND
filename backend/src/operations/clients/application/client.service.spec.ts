import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
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
  let prisma: PrismaService;

  const mockPrismaService = {
    clientes: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: PrismaService, useValue: mockPrismaService },
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
    prisma = module.get<PrismaService>(PrismaService);
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

  it('findAll should call prisma with filters', async () => {
    mockPrismaService.clientes.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(mockPrismaService.clientes.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: expect.anything(),
    });
  });

  it('findAll should apply filters when provided', async () => {
    mockPrismaService.clientes.findMany.mockResolvedValue([]);
    await service.findAll({ identificacion: '123' });
    expect(mockPrismaService.clientes.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            { deletedAt: null },
            { identificacion: { contains: '123', mode: 'insensitive' } },
          ]),
        }),
      }),
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
