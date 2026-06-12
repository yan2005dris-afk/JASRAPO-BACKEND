import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateClientUseCase } from './create-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/utils/tipo-identificacion.util';

jest.mock('src/infrastructure/common/utils/tipo-identificacion.util');

describe('CreateClientUseCase', () => {
  let useCase: CreateClientUseCase;

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
        CreateClientUseCase,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateClientUseCase>(CreateClientUseCase);

    (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(true);
    mockClientRepository.findCatalogoTipoIdentificacion.mockResolvedValue({
      id: 1,
      codigo: '05', // CÉDULA
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a regular client successfully', async () => {
      const dto = {
        tipoIdentificacionId: 1,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockClientRepository.findUnique.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...dto,
        clienteId: BigInt(1),
      });

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          identificacion: '0926715658',
          nombres: 'JOHN',
          apellidos: 'DOE',
        }),
      );
    });

    it('should throw ConflictException if identification already exists', async () => {
      const dto = {
        tipoIdentificacionId: 1,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockClientRepository.findUnique.mockResolvedValue({
        clienteId: BigInt(1),
        deletedAt: null,
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    });

    it('should reactivate a deleted client if identification matches', async () => {
      const dto = {
        tipoIdentificacionId: 1,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockClientRepository.findUnique.mockResolvedValue({
        clienteId: BigInt(1),
        identificacion: '0926715658',
        deletedAt: new Date(),
      });
      mockClientRepository.update.mockResolvedValue({
        ...dto,
        clienteId: BigInt(1),
        deletedAt: null,
      });

      const result = await useCase.execute(dto);

      expect(mockClientRepository.update).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if identification is invalid', async () => {
      (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(false);
      const dto = {
        tipoIdentificacionId: 1,
        identificacion: '123',
        nombres: 'John',
        apellidos: 'Doe',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if tipoIdentificacionId is invalid', async () => {
      mockClientRepository.findCatalogoTipoIdentificacion.mockResolvedValue(
        null,
      );
      const dto = {
        tipoIdentificacionId: 999,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
