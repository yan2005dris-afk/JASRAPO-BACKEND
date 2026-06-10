import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveClientUseCase } from './remove-client.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemoveClientUseCase', () => {
  let useCase: RemoveClientUseCase;

  const mockPrismaService = {
    clientes: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveClientUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<RemoveClientUseCase>(RemoveClientUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should soft delete a client if found', async () => {
      const mockCliente = { clienteId: BigInt(1), deletedAt: null };
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);
      mockPrismaService.clientes.update.mockResolvedValue({
        ...mockCliente,
        deletedAt: new Date(),
      });

      const result = await useCase.execute('1');

      expect(result).toBeDefined();
      expect(mockPrismaService.clientes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: BigInt(1) },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException if client not found', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
    });
  });
});
