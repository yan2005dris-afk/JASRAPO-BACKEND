import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneClientUseCase } from './find-one-client.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('FindOneClientUseCase', () => {
  let useCase: FindOneClientUseCase;

  const mockPrismaService = {
    clientes: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneClientUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);

      const result = await useCase.execute('1');

      expect(result).toEqual(mockCliente);
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
    });
  });
});
