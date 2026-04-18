import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from 'src/database/prisma.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TipoIdentificacion } from 'src/generated/prisma/enums';

describe('ClientService', () => {
  let service: ClientService;

  const mockCliente = {
    clienteId: BigInt(1),
    identificacion: '0999999999001',
    tipoIdentificacion: TipoIdentificacion.RUC,
    nombres: 'JUAN',
    apellidos: 'PEREZ',
    razonSocial: 'JUAN PEREZ',
    email: 'juan@test.com',
    telefono: '0999999999',
    telefonoSecundario: null,
    direccionDomicilio: 'Quito',
    aplicaTerceraEdadDiscapacidad: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    clientes: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create CONSUMIDOR_FINAL client when none exists', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([]);
      mockPrismaService.clientes.create.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
        identificacion: '9999999999999',
      });

      const result = await service.create({
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      });

      expect(result.data.tipoIdentificacion).toBe(
        TipoIdentificacion.CONSUMIDOR_FINAL,
      );
      expect(mockPrismaService.clientes.create).toHaveBeenCalled();
    });

    it('should reactivate CONSUMIDOR_FINAL when it already exists', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([
        {
          clienteId: BigInt(1),
          tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
          deletedAt: new Date(),
        },
      ]);
      mockPrismaService.clientes.update.mockResolvedValue({
        clienteId: BigInt(1),
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
        deletedAt: null,
      });

      const result = await service.create({
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      });

      expect(result.message).toContain('reactivado');
      expect(mockPrismaService.clientes.update).toHaveBeenCalled();
    });

    it('should create RUC client with validation', async () => {
      mockPrismaService.clientes.findUnique.mockResolvedValue(null);
      mockPrismaService.clientes.create.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: TipoIdentificacion.RUC,
      });

      const result = await service.create({
        tipoIdentificacion: TipoIdentificacion.RUC,
        identificacion: '0999999999001',
        nombres: 'Juan',
        apellidos: 'Perez',
      });

      expect(result.tipoIdentificacion).toBe(TipoIdentificacion.RUC);
    });

    it('should throw BadRequestException when identificacion is missing for RUC', async () => {
      await expect(
        service.create({
          tipoIdentificacion: TipoIdentificacion.RUC,
          nombres: 'Juan',
          apellidos: 'Perez',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when tipoIdentificacion is missing', async () => {
      await expect(service.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException on duplicate identificacion', async () => {
      mockPrismaService.clientes.findUnique.mockResolvedValue(mockCliente);

      await expect(
        service.create({
          tipoIdentificacion: TipoIdentificacion.RUC,
          identificacion: '0999999999001',
          nombres: 'Juan',
          apellidos: 'Perez',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted clients', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([mockCliente]);

      const result = await service.findAll();

      expect(result).toEqual([mockCliente]);
      expect(mockPrismaService.clientes.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return client by id', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCliente);
    });

    it('should throw NotFoundException when client not found', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update client successfully', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);
      mockPrismaService.clientes.findUnique.mockResolvedValue(null);
      mockPrismaService.clientes.update.mockResolvedValue({
        ...mockCliente,
        nombres: 'CARLOS',
      });

      const result = await service.update('1', { nombres: 'Carlos' });

      expect(result).toBeDefined();
    });
  });

  describe('search', () => {
    it('should search by identificacion', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([mockCliente]);

      const result = await service.search('identificacion', '0999999999001');

      expect(result).toEqual([mockCliente]);
    });

    it('should throw BadRequestException for invalid tipo', async () => {
      await expect(service.search('invalid' as any, 'value')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should search by nombres with pagination', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([mockCliente]);

      const result = await service.search('nombres', 'JUAN', 1, 10);

      expect(result).toEqual([mockCliente]);
    });
  });
});
