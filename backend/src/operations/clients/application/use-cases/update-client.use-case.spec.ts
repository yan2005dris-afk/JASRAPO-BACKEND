import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateClientUseCase } from './update-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/utils/tipo-identificacion.util';

describe('UpdateClientUseCase', () => {
  let useCase: UpdateClientUseCase;

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

  const mockCliente = {
    clienteId: BigInt(1),
    identificacion: '0926715658',
    tipoIdentificacionId: 1,
    nombres: 'JOHN',
    apellidos: 'DOE',
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClientUseCase,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateClientUseCase>(UpdateClientUseCase);
    jest.spyOn(TipoIdentificacionUtil, 'validar').mockReturnValue(true);
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
    it('should update a client successfully', async () => {
      mockClientRepository.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: {
          id: 1,
          codigo: '05',
          descripcion: 'CÉDULA',
        },
      });
      mockClientRepository.update.mockResolvedValue({
        ...mockCliente,
        nombres: 'CARLOS',
      });

      const result = await useCase.execute('1', { nombres: 'Carlos' });

      expect(result).toBeDefined();
      expect(mockClientRepository.update).toHaveBeenCalledWith(
        { clienteId: BigInt(1) },
        expect.objectContaining({ nombres: 'CARLOS' }),
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if client does not exist', async () => {
      mockClientRepository.findFirst.mockResolvedValue(null);

      await expect(useCase.execute('1', { nombres: 'Carlos' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if new identification is invalid', async () => {
      mockClientRepository.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: { id: 1, codigo: '05' },
      });
      jest.spyOn(TipoIdentificacionUtil, 'validar').mockReturnValue(false);

      await expect(
        useCase.execute('1', { identificacion: '123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if new identification already exists for another client', async () => {
      mockClientRepository.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: { id: 1, codigo: '05' },
      });
      mockClientRepository.findUnique.mockResolvedValue({
        clienteId: BigInt(2),
        identificacion: '0926715641',
      });

      await expect(
        useCase.execute('1', { identificacion: '0926715641' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if tipoIdentificacionId is invalid', async () => {
      mockClientRepository.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: { id: 1, codigo: '05' },
      });
      mockClientRepository.findCatalogoTipoIdentificacion.mockResolvedValue(
        null,
      );

      await expect(
        useCase.execute('1', { tipoIdentificacionId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
