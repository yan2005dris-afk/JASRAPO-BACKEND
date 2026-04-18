import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from 'src/database/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoIdentificacion } from 'src/generated/prisma/enums';

describe('ClientService', () => {
  let service: ClientService;
  let prismaService: PrismaService;

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
      create: jest.fn(),
      update: jest.fn(),
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create CONSUMIDOR_FINAL client', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);
      mockPrismaService.clientes.create.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
        identificacion: '9999999999999',
      });

      const result = await service.create({
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      });

      expect(result.tipoIdentificacion).toBe(TipoIdentificacion.CONSUMIDOR_FINAL);
      expect(mockPrismaService.clientes.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when CONSUMIDOR_FINAL already exists', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue({
        clienteId: BigInt(1),
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      });

      await expect(
        service.create({ tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create RUC client with validation', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);
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
      await expect(
        service.create({}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException on duplicate identificacion', async () => {
      // First call finds no existing CONSUMIDOR_FINAL
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);
      
      // Second call returns existing (simulating race condition)
      mockPrismaService.clientes.findFirst.mockResolvedValueOnce({
        clienteId: BigInt(2),
        tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
      });

      await expect(
        service.create({
          tipoIdentificacion: TipoIdentificacion.CONSUMIDOR_FINAL,
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

    it('should return empty array when no clients exist', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
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

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findOne('abc')).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('should update client successfully', async () => {
      mockPrismaService.clientes.findFirst
        .mockResolvedValueOnce(mockCliente)
        .mockResolvedValueOnce(null);
      mockPrismaService.clientes.update.mockResolvedValue({
        ...mockCliente,
        nombres: 'CARLOS',
      });

      const result = await service.update('1', { nombres: 'Carlos' });

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when client does not exist', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(
        service.update('999', { nombres: 'Carlos' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid identificacion', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);

      await expect(
        service.update('1', { tipoIdentificacion: TipoIdentificacion.RUC, identificacion: '123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException on duplicate identificacion', async () => {
      mockPrismaService.clientes.findFirst
        .mockResolvedValueOnce(mockCliente)
        .mockResolvedValueOnce({ clienteId: BigInt(2), identificacion: '0999999999001' });

      await expect(
        service.update('1', { identificacion: '0999999999001' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should soft delete client', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);
      mockPrismaService.clientes.update.mockResolvedValue({
        ...mockCliente,
        deletedAt: new Date(),
      });

      const result = await service.remove('1');

      expect(result.deletedAt).toBeDefined();
    });

    it('should throw NotFoundException when client not found', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search by identificacion', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([mockCliente]);

      const result = await service.search('identificacion', '0999999999001');

      expect(result).toEqual([mockCliente]);
    });

    it('should throw BadRequestException for invalid tipo', async () => {
      await expect(
        service.search('invalid' as any, 'value'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when identificacion is too short', async () => {
      await expect(
        service.search('identificacion', '123'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should search by nombres with pagination', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([mockCliente]);

      const result = await service.search('nombres', 'JUAN', 1, 10);

      expect(result).toEqual([mockCliente]);
      expect(mockPrismaService.clientes.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            nombres: { contains: 'JUAN', mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  describe('searchPrivate', () => {
    it('should search private and return results', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([mockCliente]);

      const result = await service.searchPrivate('nombreCompleto', 'JUAN PEREZ');

      expect(result).toEqual([mockCliente]);
    });

    it('should throw NotFoundException when no results found', async () => {
      mockPrismaService.clientes.findMany.mockResolvedValue([]);

      await expect(
        service.searchPrivate('nombreCompleto', 'NOTFOUND'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid tipo', async () => {
      await expect(
        service.searchPrivate('invalid' as any, 'value'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});