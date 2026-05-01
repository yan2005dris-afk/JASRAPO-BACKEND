import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from './create-customer.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { TipoIdentificacion } from 'src/generated/prisma/enums';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/util/tipo-identificacion.util';

jest.mock('src/infrastructure/common/util/tipo-identificacion.util');

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let prisma: PrismaService;

  const mockPrismaService = {
    clientes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
    prisma = module.get<PrismaService>(PrismaService);
    
    (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a regular customer successfully', async () => {
      const dto = {
        tipoIdentificacion: TipoIdentificacion.CEDULA,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue(null);
      mockPrismaService.clientes.create.mockResolvedValue({ ...dto, clienteId: BigInt(1) });

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(mockPrismaService.clientes.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          identificacion: '0926715658',
          nombres: 'JOHN',
          apellidos: 'DOE',
        }),
      });
    });

    it('should throw ConflictException if identification already exists', async () => {
      const dto = {
        tipoIdentificacion: TipoIdentificacion.CEDULA,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue({ clienteId: BigInt(1), deletedAt: null });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    });

    it('should reactivate a deleted customer if identification matches', async () => {
      const dto = {
        tipoIdentificacion: TipoIdentificacion.CEDULA,
        identificacion: '0926715658',
        nombres: 'John',
        apellidos: 'Doe',
      };

      mockPrismaService.clientes.findUnique.mockResolvedValue({ 
        clienteId: BigInt(1), 
        identificacion: '0926715658',
        deletedAt: new Date() 
      });
      mockPrismaService.clientes.update.mockResolvedValue({ ...dto, clienteId: BigInt(1), deletedAt: null });

      const result = await useCase.execute(dto);

      expect(mockPrismaService.clientes.update).toHaveBeenCalled();
      expect(result.deletedAt).toBeNull();
    });

    it('should handle CONSUMIDOR_FINAL: create if not exists', async () => {
      const dto = {
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      };

      mockPrismaService.clientes.findMany.mockResolvedValue([]);
      mockPrismaService.clientes.create.mockResolvedValue({ clienteId: BigInt(1), identificacion: '9999999999999' });

      const result = await useCase.execute(dto);

      expect(result.message).toContain('creado correctamente');
      expect(mockPrismaService.clientes.create).toHaveBeenCalled();
    });

    it('should handle CONSUMIDOR_FINAL: reactivate and cleanup duplicates if exists', async () => {
      const dto = {
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      };

      const mockConsumidores = [
        { clienteId: BigInt(1), tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL, createdAt: new Date() },
        { clienteId: BigInt(2), tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL, createdAt: new Date() },
      ];

      mockPrismaService.clientes.findMany.mockResolvedValue(mockConsumidores);
      mockPrismaService.clientes.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.clientes.update.mockResolvedValue(mockConsumidores[0]);

      const result = await useCase.execute(dto);

      expect(result.message).toContain('reactivado correctamente');
      expect(mockPrismaService.clientes.updateMany).toHaveBeenCalled();
      expect(mockPrismaService.clientes.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { clienteId: BigInt(1) }
      }));
    });

    it('should throw BadRequestException if identification is invalid', async () => {
      (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(false);
      const dto = {
        tipoIdentificacion: TipoIdentificacion.CEDULA,
        identificacion: '123', // Invalid
        nombres: 'John',
        apellidos: 'Doe',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
