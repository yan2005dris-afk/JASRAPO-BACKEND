import { PrismaContractRepository } from './prisma-contract.repository';
import type { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EstadoMedidor } from 'src/shared/enums';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('PrismaContractRepository', () => {
  let repository: PrismaContractRepository;
  let prisma: {
    contratos: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    clientes: {
      findUnique: jest.Mock;
    };
    medidores: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    categoriaTarifa: {
      findUnique: jest.Mock;
    };
    comunidades: {
      findUnique: jest.Mock;
    };
    sectores: {
      findUnique: jest.Mock;
    };
    historialMedidores: {
      create: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
      findFirst: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  const rawContract = {
    contratoId: 1n,
    clienteId: 10n,
    sectorId: null,
    categoriaTarifaId: 1,
    numeroGuia: 'G-001',
    fechaInicio: new Date('2026-01-01'),
    direccionSuministro: 'Av. Principal',
    estadoServicio: 'ACTIVO',
    estadoCobranza: 'AL_DIA',
    creadoPor: 'admin',
    comunidadId: 1,
    deletedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeEach(() => {
    prisma = {
      contratos: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      clientes: {
        findUnique: jest.fn(),
      },
      medidores: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      categoriaTarifa: {
        findUnique: jest.fn(),
      },
      comunidades: {
        findUnique: jest.fn(),
      },
      sectores: {
        findUnique: jest.fn(),
      },
      historialMedidores: {
        create: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    repository = new PrismaContractRepository(
      prisma as unknown as PrismaService,
    );
  });

  describe('findById', () => {
    it('should find active contract by ID by default', async () => {
      prisma.contratos.findFirst.mockResolvedValue(rawContract);

      const result = await repository.findById(1n);

      expect(result?.contratoId).toBe(1n);
      expect(prisma.contratos.findFirst).toHaveBeenCalledWith({
        where: { contratoId: 1n, deletedAt: null },
        include: expect.any(Object),
      });
    });
  });

  describe('paginateContratos', () => {
    it('should return paginated contracts with filters', async () => {
      prisma.contratos.findMany.mockResolvedValue([rawContract]);
      prisma.contratos.count.mockResolvedValue(1);

      const result = await repository.paginateContratos(
        { filters: { estadoServicio: 'ACTIVO' } },
        { skip: 0, take: 10 },
      );

      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].contratoId).toBe(1n);
    });
  });

  describe('create', () => {
    it('should create contract and return domain entity', async () => {
      prisma.contratos.create.mockResolvedValue(rawContract);

      const result = await repository.create({
        clienteId: 10n,
        categoriaTarifaId: 1,
        numeroGuia: 'G-001',
        direccionSuministro: 'Av. 1',
        comunidadId: 1,
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
        fechaInicio: new Date('2026-01-01'),
      });

      expect(result.contratoId).toBe(1n);
    });

    it('should throw EntityAlreadyExistsException on P2002', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });
      prisma.contratos.create.mockRejectedValue(p2002);

      await expect(
        repository.create({
          clienteId: 10n,
          categoriaTarifaId: 1,
          numeroGuia: 'G-001',
          direccionSuministro: 'Av. 1',
          comunidadId: 1,
          estadoServicio: 'ACTIVO',
          estadoCobranza: 'AL_DIA',
          fechaInicio: new Date('2026-01-01'),
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('update', () => {
    it('should update and return entity', async () => {
      prisma.contratos.update.mockResolvedValue({
        ...rawContract,
        estadoServicio: 'SUSPENDIDO',
      });

      const result = await repository.update(1n, {
        estadoServicio: 'SUSPENDIDO',
      });

      expect(result.estadoServicio).toBe('SUSPENDIDO');
    });

    it('should throw EntityNotFoundException on P2025', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prisma.contratos.update.mockRejectedValue(p2025);

      await expect(repository.update(99n, {})).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete contract', async () => {
      prisma.contratos.update.mockResolvedValue({
        ...rawContract,
        deletedAt: new Date(),
      });

      const result = await repository.softDelete(1n);

      expect(result.contratoId).toBe(1n);
    });
  });

  describe('createContractWithMeterHistory', () => {
    it('should execute transactional contract and meter history creation', async () => {
      const txMock = {
        clientes: {
          findUnique: jest.fn().mockResolvedValue({ clienteId: 10n }),
        },
        medidores: {
          findUnique: jest.fn().mockResolvedValue({
            medidorId: 100n,
            estado: EstadoMedidor.BODEGA,
          }),
          update: jest.fn(),
        },
        categoriaTarifa: {
          findUnique: jest.fn().mockResolvedValue({ categoriaTarifaId: 1 }),
        },
        comunidades: {
          findUnique: jest.fn().mockResolvedValue({ comunidadId: 1 }),
        },
        sectores: { findUnique: jest.fn() },
        contratos: {
          create: jest.fn().mockResolvedValue({
            ...rawContract,
            estadoServicio: 'PENDIENTE_PAGO',
          }),
          findUnique: jest.fn().mockResolvedValue({
            ...rawContract,
            estadoServicio: 'PENDIENTE_PAGO',
          }),
        },
        historialMedidores: { create: jest.fn() },
        $executeRaw: jest.fn().mockResolvedValue(1),
      };

      prisma.$transaction.mockImplementation((callback) => callback(txMock));

      const result = await repository.createContractWithMeterHistory({
        clienteId: 10n,
        categoriaTarifaId: 1,
        medidorId: 100n,
        comunidadId: 1,
        sectorId: null,
        numeroGuia: 'G-001',
        direccionSuministro: 'Av. 1',
        estadoServicio: 'PENDIENTE_PAGO',
        estadoCobranza: 'AL_DIA',
        lecturaInicial: 0,
      });

      expect(result.contratoId).toBe(1n);
      expect(txMock.medidores.update).toHaveBeenCalledWith({
        where: { medidorId: 100n },
        data: { estado: EstadoMedidor.PENDIENTE },
      });
      expect(txMock.$executeRaw).toHaveBeenCalled();
    });

    it('should throw InvalidDomainOperationException if meter is not in BODEGA', async () => {
      const txMock = {
        clientes: {
          findUnique: jest.fn().mockResolvedValue({ clienteId: 10n }),
        },
        medidores: {
          findUnique: jest.fn().mockResolvedValue({
            medidorId: 100n,
            estado: EstadoMedidor.INSTALADO,
          }),
        },
        categoriaTarifa: {
          findUnique: jest.fn().mockResolvedValue({ categoriaTarifaId: 1 }),
        },
        comunidades: {
          findUnique: jest.fn().mockResolvedValue({ comunidadId: 1 }),
        },
        sectores: { findUnique: jest.fn() },
      };

      prisma.$transaction.mockImplementation((callback) => callback(txMock));

      await expect(
        repository.createContractWithMeterHistory({
          clienteId: 10n,
          categoriaTarifaId: 1,
          medidorId: 100n,
          comunidadId: 1,
          sectorId: null,
          numeroGuia: 'G-001',
          direccionSuministro: 'Av. 1',
          estadoServicio: 'PENDIENTE_PAGO' as any,
          estadoCobranza: 'AL_DIA' as any,
          lecturaInicial: 0,
        }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });
  });
});
