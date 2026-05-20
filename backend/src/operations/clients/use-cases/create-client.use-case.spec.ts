import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateClientUseCase } from './create-client.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/utils/tipo-identificacion.util';

jest.mock('src/infrastructure/common/utils/tipo-identificacion.util');

describe('CreateClientUseCase', () => {
  let useCase: CreateClientUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    clientes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    identificacion: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClientUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateClientUseCase>(CreateClientUseCase);
    prisma = module.get<PrismaService>(PrismaService);

    (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(true);
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
    it('should create a regular client successfully', async () => {
      const dto = {
        tipoIdentificacionId: 1,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue(null);
      mockPrismaService.clientes.create.mockResolvedValue({
        ...dto,
        clienteId: BigInt(1),
      });

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.clientes.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identificacion: '0926715658',
          nombres: 'JOHN',
          apellidos: 'DOE',
        }),
        select: expect.anything(),
      });
    });

    it('should throw ConflictException if identification already exists', async () => {
      const dto = {
        tipoIdentificacionId: 1,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue({
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

      mockPrismaService.clientes.findUnique.mockResolvedValue({
        clienteId: BigInt(1),
        identificacion: '0926715658',
        deletedAt: new Date(),
      });
      mockPrismaService.clientes.update.mockResolvedValue({
        ...dto,
        clienteId: BigInt(1),
        deletedAt: null,
      });

      const result = await useCase.execute(dto);

      expect(mockPrismaService.clientes.update).toHaveBeenCalled();
      expect(result.deletedAt).toBeNull();
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
      mockPrismaService.identificacion.findUnique.mockResolvedValue(null);
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
