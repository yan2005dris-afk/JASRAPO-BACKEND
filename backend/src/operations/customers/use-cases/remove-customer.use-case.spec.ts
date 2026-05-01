import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveCustomerUseCase } from './remove-customer.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemoveCustomerUseCase', () => {
  let useCase: RemoveCustomerUseCase;

  const mockPrismaService = {
    clientes: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveCustomerUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<RemoveCustomerUseCase>(RemoveCustomerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should soft delete a customer if found', async () => {
      const mockCliente = { clienteId: BigInt(1), deletedAt: null };
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);
      mockPrismaService.clientes.update.mockResolvedValue({
        ...mockCliente,
        deletedAt: new Date(),
      });

      const result = await useCase.execute('1');

      expect(result.deletedAt).toBeDefined();
      expect(mockPrismaService.clientes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: BigInt(1) },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw NotFoundException if customer not found', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(useCase.execute('1')).rejects.toThrow(NotFoundException);
    });
  });
});
