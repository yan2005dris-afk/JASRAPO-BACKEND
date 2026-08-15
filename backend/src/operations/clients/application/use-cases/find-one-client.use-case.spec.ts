import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneClientUseCase } from './find-one-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOneClientUseCase', () => {
  let useCase: FindOneClientUseCase;

  const mockClientRepository = {
    findById: jest.fn(),
    findByIdentificacion: jest.fn(),
    create: jest.fn(),
    updateClient: jest.fn(),
    softDelete: jest.fn(),
    findTipoIdentificacionById: jest.fn(),
    findActiveTipoIdentificaciones: jest.fn(),
    reactivateOrCreateConsumidorFinal: jest.fn(),
    paginateClientes: jest.fn(),
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
      mockClientRepository.findById.mockResolvedValue(mockCliente);

      const result = await useCase.execute(1n);

      expect(mockClientRepository.findById).toHaveBeenCalledWith(1n);
      expect(result).toEqual(mockCliente);
    });

    it('should throw EntityNotFoundException if client not found', async () => {
      mockClientRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(1n)).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should throw EntityNotFoundException when the client is soft-deleted', async () => {
      mockClientRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999n)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
