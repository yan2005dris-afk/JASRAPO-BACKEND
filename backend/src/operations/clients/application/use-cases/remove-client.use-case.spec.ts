import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveClientUseCase } from './remove-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('RemoveClientUseCase', () => {
  let useCase: RemoveClientUseCase;

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
      mockClientRepository.findById.mockResolvedValue(mockCliente);
      mockClientRepository.softDelete.mockResolvedValue({
        ...mockCliente,
        deletedAt: new Date(),
      });

      const result = await useCase.execute(1n);

      expect(mockClientRepository.findById).toHaveBeenCalledWith(1n);
      expect(mockClientRepository.softDelete).toHaveBeenCalledWith(1n);
      expect(result).toBeDefined();
    });

    it('should throw EntityNotFoundException if client not found', async () => {
      mockClientRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(1n)).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should not call softDelete when client does not exist', async () => {
      mockClientRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(1n)).rejects.toThrow(
        EntityNotFoundException,
      );
      expect(mockClientRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
