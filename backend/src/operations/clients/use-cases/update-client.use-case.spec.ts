import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateClientUseCase } from './update-client.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/utils/tipo-identificacion.util';

describe('UpdateClientUseCase', () => {
  let useCase: UpdateClientUseCase;

  const mockPrismaService = {
    clientes: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    identificacion: {
      findUnique: jest.fn(),
    },
  };

  const mockCliente = {
    clienteId: BigInt(1),
    identificacion: '0926715658',
    tipoIdentificacionId: BigInt(1),
    nombres: 'JOHN',
    apellidos: 'DOE',
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClientUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateClientUseCase>(UpdateClientUseCase);
    jest.spyOn(TipoIdentificacionUtil, 'validar').mockReturnValue(true);
    mockPrismaService.identificacion.findUnique.mockResolvedValue({
      identificacionId: BigInt(1),
      codigo: 'CEDULA',
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
      mockPrismaService.clientes.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: {
          identificacionId: BigInt(1),
          codigo: 'CEDULA',
          nombre: 'Cédula',
        },
      });
      mockPrismaService.clientes.update.mockResolvedValue({
        ...mockCliente,
        nombres: 'CARLOS',
      });

      const result = await useCase.execute('1', { nombres: 'Carlos' });

      expect(result).toBeDefined();
      expect(mockPrismaService.clientes.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ nombres: 'CARLOS' }),
        }),
      );
    });

    it('should throw NotFoundException if client does not exist', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(useCase.execute('1', { nombres: 'Carlos' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if new identification is invalid', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: { identificacionId: BigInt(1), codigo: 'CEDULA' },
      });
      jest.spyOn(TipoIdentificacionUtil, 'validar').mockReturnValue(false);

      await expect(
        useCase.execute('1', { identificacion: '123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if new identification already exists for another client', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: { identificacionId: BigInt(1), codigo: 'CEDULA' },
      });
      mockPrismaService.clientes.findUnique.mockResolvedValue({
        clienteId: BigInt(2),
        identificacion: '0926715641',
      });

      await expect(
        useCase.execute('1', { identificacion: '0926715641' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if tipoIdentificacionId is invalid', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: { identificacionId: BigInt(1), codigo: 'CEDULA' },
      });
      mockPrismaService.identificacion.findUnique.mockResolvedValue(null);

      await expect(
        useCase.execute('1', { tipoIdentificacionId: 999 }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
