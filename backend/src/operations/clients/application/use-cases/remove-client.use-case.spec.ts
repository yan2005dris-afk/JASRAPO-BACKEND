import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveClientUseCase } from './remove-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { NotFoundException } from '@nestjs/common';

describe('RemoveClientUseCase', () => {
  let useCase: RemoveClientUseCase;

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
        RemoveClientUseCase,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
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
      mockClientRepository.findFirst.mockResolvedValue(mockCliente);
      mockClientRepository.update.mockResolvedValue({
        ...mockCliente,
        deletedAt: new Date(),
      });

      const result = await useCase.execute(1n);

      expect(result).toBeDefined();
      expect(mockClientRepository.update).toHaveBeenCalledWith(
        { clienteId: 1n },
        { deletedAt: expect.any(Date) },
      );
    });

    it('should throw NotFoundException if client not found', async () => {
      mockClientRepository.findFirst.mockResolvedValue(null);

      await expect(useCase.execute(1n)).rejects.toThrow(NotFoundException);
    });
  });
});
