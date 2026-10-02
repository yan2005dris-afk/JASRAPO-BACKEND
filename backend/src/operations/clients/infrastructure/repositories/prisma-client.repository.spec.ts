import { Test } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/shared/domain/exceptions/domain.exception';
import { PrismaClientRepository } from './prisma-client.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ClientEntity } from '../../domain/entities/client.entity';

describe('PrismaClientRepository', () => {
  let repository: PrismaClientRepository;
  let prisma: any;

  const rawCliente = {
    clienteId: BigInt(1),
    identificacion: '0926715658',
    nombres: 'JUAN',
    apellidos: 'PEREZ',
    razonSocial: null,
    email: null,
    telefono: null,
    telefonoSecundario: null,
    direccionDomicilio: null,
    activo: true,
    aplicaDiscapacidad: false,
    aplicaTerceraEdad: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-02'),
    deletedAt: null,
    tipoIdentificacion: { id: 2, codigo: '04', descripcion: 'RUC' },
  };

  const mockTx = {
    clientes: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockPrisma = {
    clientes: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    catalogoTiposIdentificacion: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: any) => Promise<any>) =>
      callback(mockTx),
    ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        PrismaClientRepository,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    repository = module.get(PrismaClientRepository);
    prisma = mockPrisma;
  });

  describe('findById', () => {
    it('should find an active client by id and map it to a domain entity', async () => {
      prisma.clientes.findFirst.mockResolvedValue(rawCliente);

      const result = await repository.findById(BigInt(1));

      expect(prisma.clientes.findFirst).toHaveBeenCalledWith({
        where: { clienteId: BigInt(1), deletedAt: null },
        include: expect.objectContaining({ tipoIdentificacion: true }),
      });
      expect(result).toBeInstanceOf(ClientEntity);
      expect(result!.clienteId).toEqual(BigInt(1));
    });

    it('should return null when the client does not exist', async () => {
      prisma.clientes.findFirst.mockResolvedValue(null);

      const result = await repository.findById(BigInt(999));

      expect(result).toBeNull();
    });
  });

  describe('findByIdentificacion', () => {
    it('should find a client by identification (including soft-deleted)', async () => {
      prisma.clientes.findUnique.mockResolvedValue(rawCliente);

      const result = await repository.findByIdentificacion('0926715658');

      expect(prisma.clientes.findUnique).toHaveBeenCalledWith({
        where: { identificacion: '0926715658' },
        include: expect.objectContaining({ tipoIdentificacion: true }),
      });
      expect(result).toBeInstanceOf(ClientEntity);
    });

    it('should return null when no client matches', async () => {
      prisma.clientes.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdentificacion('000');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should translate the tipoIdentificacionId into a Prisma connect', async () => {
      prisma.clientes.create.mockResolvedValue(rawCliente);

      const result = await repository.create({
        identificacion: '0926715658',
        tipoIdentificacionId: 2,
        nombres: 'JUAN',
        apellidos: 'PEREZ',
        aplicaTerceraEdad: false,
        aplicaDiscapacidad: false,
        porcentajeDiscapacidad: null,
      });

      expect(prisma.clientes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tipoIdentificacion: { connect: { id: 2 } },
            identificacion: '0926715658',
          }),
        }),
      );
      expect(result).toBeInstanceOf(ClientEntity);
    });

    it('should translate Prisma P2002 to EntityAlreadyExistsException', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        { code: 'P2002', clientVersion: '7.6.0' },
      );
      prisma.clientes.create.mockRejectedValue(p2002);

      await expect(
        repository.create({
          identificacion: '0926715658',
          tipoIdentificacionId: 2,
          nombres: 'JUAN',
          apellidos: 'PEREZ',
          aplicaTerceraEdad: false,
          aplicaDiscapacidad: false,
          porcentajeDiscapacidad: null,
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });

    it('should rethrow non-P2002 errors unchanged', async () => {
      const dbError = new Error('Connection refused');
      prisma.clientes.create.mockRejectedValue(dbError);

      await expect(
        repository.create({
          identificacion: '0926715658',
          tipoIdentificacionId: 2,
          nombres: 'JUAN',
          apellidos: 'PEREZ',
          aplicaTerceraEdad: false,
          aplicaDiscapacidad: false,
          porcentajeDiscapacidad: null,
        }),
      ).rejects.toThrow('Connection refused');
    });
  });

  describe('updateClient', () => {
    it('should translate tipoIdentificacionId into a Prisma connect inside update data', async () => {
      prisma.clientes.update.mockResolvedValue(rawCliente);

      await repository.updateClient(BigInt(1), {
        tipoIdentificacionId: 2,
        identificacion: '0926715658',
      });

      expect(prisma.clientes.update).toHaveBeenCalledWith({
        where: { clienteId: BigInt(1) },
        data: expect.objectContaining({
          tipoIdentificacion: { connect: { id: 2 } },
          identificacion: '0926715658',
        }),
        include: expect.objectContaining({ tipoIdentificacion: true }),
      });
    });

    it('should omit tipoIdentificacion when not provided', async () => {
      prisma.clientes.update.mockResolvedValue(rawCliente);

      await repository.updateClient(BigInt(1), { nombres: 'CARLOS' });

      expect(prisma.clientes.update).toHaveBeenCalledWith({
        where: { clienteId: BigInt(1) },
        data: { nombres: 'CARLOS' },
        include: expect.objectContaining({ tipoIdentificacion: true }),
      });
    });

    it('should translate Prisma P2025 to EntityNotFoundException', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '7.6.0' },
      );
      prisma.clientes.update.mockRejectedValue(p2025);

      await expect(
        repository.updateClient(BigInt(999), { nombres: 'X' }),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should rethrow non-P2025 errors unchanged', async () => {
      const dbError = new Error('Connection refused');
      prisma.clientes.update.mockRejectedValue(dbError);

      await expect(
        repository.updateClient(BigInt(1), { nombres: 'X' }),
      ).rejects.toThrow('Connection refused');
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt on the record', async () => {
      prisma.clientes.update.mockResolvedValue({
        ...rawCliente,
        deletedAt: new Date(),
      });

      const result = await repository.softDelete(BigInt(1));

      expect(prisma.clientes.update).toHaveBeenCalledWith({
        where: { clienteId: BigInt(1) },
        data: { deletedAt: expect.any(Date) },
        include: expect.objectContaining({ tipoIdentificacion: true }),
      });
      expect(result).toBeInstanceOf(ClientEntity);
    });

    it('should translate Prisma P2025 to EntityNotFoundException', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        { code: 'P2025', clientVersion: '7.6.0' },
      );
      prisma.clientes.update.mockRejectedValue(p2025);

      await expect(repository.softDelete(BigInt(999))).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('findTipoIdentificacionById', () => {
    it('should return the identification type record', async () => {
      const raw = {
        id: 2,
        codigo: '04',
        descripcion: 'RUC',
        activo: true,
      };
      prisma.catalogoTiposIdentificacion.findUnique.mockResolvedValue(raw);

      const result = await repository.findTipoIdentificacionById(2);

      expect(
        prisma.catalogoTiposIdentificacion.findUnique,
      ).toHaveBeenCalledWith({
        where: { id: 2 },
        select: expect.objectContaining({ activo: true }),
      });
      expect(result).toEqual(raw);
    });

    it('should return null when the type does not exist', async () => {
      prisma.catalogoTiposIdentificacion.findUnique.mockResolvedValue(null);

      const result = await repository.findTipoIdentificacionById(999);

      expect(result).toBeNull();
    });
  });

  describe('findActiveTipoIdentificaciones', () => {
    it('should return only active identification types ordered by id', async () => {
      const raw = [
        { id: 1, codigo: '05', descripcion: 'CÉDULA', activo: true },
      ];
      prisma.catalogoTiposIdentificacion.findMany.mockResolvedValue(raw);

      const result = await repository.findActiveTipoIdentificaciones();

      expect(prisma.catalogoTiposIdentificacion.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        orderBy: { id: 'asc' },
        select: expect.objectContaining({ activo: true }),
      });
      expect(result).toEqual(raw);
    });
  });

  describe('reactivateOrCreateConsumidorFinal', () => {
    it('should create the singleton when no CONSUMIDOR_FINAL exists', async () => {
      mockTx.clientes.findMany.mockResolvedValue([]);
      mockTx.clientes.create.mockResolvedValue(rawCliente);

      const result = await repository.reactivateOrCreateConsumidorFinal({
        email: 'consumidor@example.com',
      });

      expect(mockTx.clientes.findMany).toHaveBeenCalledWith({
        where: { tipoIdentificacionId: 4 },
        orderBy: { createdAt: 'asc' },
      });
      expect(mockTx.clientes.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            identificacion: '9999999999999',
            tipoIdentificacion: { connect: { id: 4 } },
            nombres: 'CONSUMIDOR',
            apellidos: 'FINAL',
            razonSocial: 'CONSUMIDOR FINAL',
            email: 'consumidor@example.com',
            aplicaTerceraEdad: false,
            aplicaDiscapacidad: false,
          }),
        }),
      );
      expect(result).toBeInstanceOf(ClientEntity);
    });

    it('should reactivate a soft-deleted principal and refresh its data', async () => {
      const principal = {
        clienteId: BigInt(1),
        createdAt: new Date('2026-01-01'),
        deletedAt: new Date('2026-02-01'),
      };
      mockTx.clientes.findMany.mockResolvedValue([principal]);
      mockTx.clientes.update.mockResolvedValue(rawCliente);

      const result = await repository.reactivateOrCreateConsumidorFinal({
        email: 'nuevo@example.com',
        telefono: '0999999999',
      });

      expect(mockTx.clientes.update).toHaveBeenCalledWith({
        where: { clienteId: BigInt(1) },
        data: expect.objectContaining({
          identificacion: '9999999999999',
          email: 'nuevo@example.com',
          telefono: '0999999999',
          deletedAt: null,
        }),
        include: expect.objectContaining({ tipoIdentificacion: true }),
      });
      expect(mockTx.clientes.updateMany).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(ClientEntity);
    });

    it('should soft-delete extra CONSUMIDOR_FINAL records when duplicates exist', async () => {
      const records = [
        { clienteId: BigInt(1), createdAt: new Date('2026-01-01') },
        { clienteId: BigInt(2), createdAt: new Date('2026-01-02') },
        { clienteId: BigInt(3), createdAt: new Date('2026-01-03') },
      ];
      mockTx.clientes.findMany.mockResolvedValue(records);
      mockTx.clientes.update.mockResolvedValue(rawCliente);

      await repository.reactivateOrCreateConsumidorFinal({});

      expect(mockTx.clientes.updateMany).toHaveBeenCalledWith({
        where: { clienteId: { in: [BigInt(2), BigInt(3)] } },
        data: { deletedAt: expect.any(Date) },
      });
      expect(mockTx.clientes.update).toHaveBeenCalledWith({
        where: { clienteId: BigInt(1) },
        data: expect.objectContaining({ deletedAt: null }),
        include: expect.objectContaining({ tipoIdentificacion: true }),
      });
    });

    it('should run the whole invariant inside a single transaction', async () => {
      mockTx.clientes.findMany.mockResolvedValue([]);
      mockTx.clientes.create.mockResolvedValue(rawCliente);

      await repository.reactivateOrCreateConsumidorFinal({});

      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
