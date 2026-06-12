import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneClientUseCase } from './find-one-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { NotFoundException } from '@nestjs/common';

describe('FindOneClientUseCase', () => {
  let useCase: FindOneClientUseCase;

  const mockClientRepository = {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    findCatalogoTipoIdentificacion: jest.fn(),
    findManyCatalogoTipoIdentificacion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneClientUseCase,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    useCase = module.get<FindOneClientUseCase>(FindOneClientUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a client if found', async () => {
      const mockCliente = { clienteId: BigInt(1), deletedAt: null };
      mockClientRepository.findFirst.mockResolvedValue(mockCliente);

      const result = await useCase.execute('1');

      expect(mockClientRepository.findFirst).toHaveBeenCalledWith({
        clienteId: BigInt(1),
        deletedAt: null,
      });
    });

    it('should throw NotFoundException if client not found', async () => {
      mockClientRepository.findFirst.mockResolvedValue(null);

      await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
    });
  });
});
