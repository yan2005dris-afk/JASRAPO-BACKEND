import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { PrismaAgreementRepository } from './prisma-agreement.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('PrismaAgreementRepository', () => {
  let repository: PrismaAgreementRepository;

  const rawConvenio = {
    convenioId: 1n,
    contratoId: 10n,
    numeroCuotas: 2,
    abonoInicial: new Prisma.Decimal(5),
    deudaTotal: new Prisma.Decimal(100),
    mesesMoraActual: 1,
    estado: 'PREPARADO' as const,
    fechaAprobacion: null,
    fechaPrimerPago: new Date('2026-06-01T00:00:00.000Z'),
    fechaProximoPago: new Date('2026-06-01T00:00:00.000Z'),
    montoPagadoActual: new Prisma.Decimal(0),
    motivo: null,
    createdAt: new Date('2026-05-01T00:00:00.000Z'),
    updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    deletedAt: null,
    cuotaConvenio: [],
  };

  const rawCuota = {
    cuotaConvenioId: 1n,
    convenioId: 1n,
    numeroCuota: 1,
    valorCuota: new Prisma.Decimal(50),
    fechaVencimiento: new Date('2026-06-01T00:00:00.000Z'),
    estado: 'PENDIENTE' as const,
    fechaPago: null,
    montoPagado: new Prisma.Decimal(0),
    saldoPendiente: new Prisma.Decimal(50),
    diasRetraso: 0,
    interesMoraAplicado: new Prisma.Decimal(0),
    pagoCompleto: false,
    fechaPagoAnticipado: null,
  };

  const prismaMock = {
    convenios: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    cuotaConvenio: {
      findMany: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    contratos: {
      count: jest.fn(),
    },
    parametroTasainteres: {
      findFirst: jest.fn(),
    },
    prefacturas: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAgreementRepository,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    repository = module.get<PrismaAgreementRepository>(
      PrismaAgreementRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findById', () => {
    it('should return mapped domain entity when found', async () => {
      prismaMock.convenios.findFirst.mockResolvedValue(rawConvenio);

      const result = await repository.findById(1n);

      expect(result).not.toBeNull();
      expect(result?.convenioId).toBe(1n);
      expect(result?.deudaTotal).toBe(100);
    });

    it('should return null when not found', async () => {
      prismaMock.convenios.findFirst.mockResolvedValue(null);

      const result = await repository.findById(999n);

      expect(result).toBeNull();
    });
  });

  describe('findActiveByContractId', () => {
    it('should return agreement if active or pending down payment', async () => {
      prismaMock.convenios.findFirst.mockResolvedValue(rawConvenio);

      const result = await repository.findActiveByContractId(10n);

      expect(result).not.toBeNull();
      expect(result?.contratoId).toBe(10n);
    });
  });

  describe('paginate', () => {
    const capturedWhere = () =>
      prismaMock.convenios.findMany.mock.calls[0][0].where;

    beforeEach(() => {
      prismaMock.convenios.findMany.mockResolvedValue([rawConvenio]);
      prismaMock.convenios.count.mockResolvedValue(1);
    });

    it('should return paginated domain entities', async () => {
      const result = await repository.paginate({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].convenioId).toBe(1n);
      expect(result.meta.total).toBe(1);
    });

    it('should not add a search filter when no term is provided', async () => {
      await repository.paginate({ page: 1, limit: 10 });

      expect(capturedWhere()).toEqual({ deletedAt: null });
    });

    it('should match guía and client data for a text term', async () => {
      await repository.paginate({ page: 1, limit: 10 }, { search: 'María' });

      const or = capturedWhere().OR;
      expect(or).toHaveLength(1);
      expect(or[0].contrato.OR).toEqual(
        expect.arrayContaining([
          { numeroGuia: { contains: 'María', mode: 'insensitive' } },
          { cliente: { nombres: { contains: 'María', mode: 'insensitive' } } },
        ]),
      );
    });

    it('should also match agreement and contract ids for a numeric term', async () => {
      await repository.paginate({ page: 1, limit: 10 }, { search: '227' });

      const or = capturedWhere().OR;
      expect(or).toHaveLength(3);
      expect(or).toEqual(
        expect.arrayContaining([{ convenioId: 227n }, { contratoId: 227n }]),
      );
    });

    it('should ignore numeric terms that overflow a bigint column', async () => {
      await repository.paginate(
        { page: 1, limit: 10 },
        { search: '99999999999999999999' },
      );

      expect(capturedWhere().OR).toHaveLength(1);
    });

    it('should combine the contratoId filter with the search term', async () => {
      await repository.paginate(
        { page: 1, limit: 10 },
        { contratoId: '10', search: '227' },
      );

      const where = capturedWhere();
      expect(where.contratoId).toBe(10n);
      expect(where.OR).toHaveLength(3);
    });
  });

  describe('findInstallmentsByAgreementId', () => {
    it('should return mapped installments', async () => {
      prismaMock.cuotaConvenio.findMany.mockResolvedValue([rawCuota]);

      const result = await repository.findInstallmentsByAgreementId(1n);

      expect(result).toHaveLength(1);
      expect(result[0].cuotaConvenioId).toBe(1n);
      expect(result[0].valorCuota).toBe(50);
    });
  });

  describe('getPdfData', () => {
    it('projects the contractual start and first installment concepts', async () => {
      prismaMock.convenios.findFirst.mockResolvedValue({
        ...rawConvenio,
        abonoInicial: new Prisma.Decimal(5),
        contrato: {
          numeroGuia: 'G-001',
          direccionSuministro: 'Olón',
          fechaInicio: new Date('2020-01-01T00:00:00.000Z'),
          cliente: {
            nombres: 'Ana',
            apellidos: 'Pérez',
            razonSocial: null,
            identificacion: '0912345678',
          },
        },
        cuotaConvenio: [{ valorCuota: new Prisma.Decimal(50) }],
      });

      const result = await repository.getPdfData(1n);

      expect(result?.convenio.periodoInicio).toBe('2020-01-01T00:00:00.000Z');
      expect(result?.convenio.primeraCuota).toBe(50);
      expect(result?.convenio.abonoInicial).toBe(5);
      expect(prismaMock.convenios.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            contrato: expect.objectContaining({
              select: expect.objectContaining({ fechaInicio: true }),
            }),
            cuotaConvenio: expect.objectContaining({
              where: { numeroCuota: 1, deletedAt: null },
            }),
          }),
        }),
      );
    });
  });

  describe('contractExists', () => {
    it('should return true when count > 0', async () => {
      prismaMock.contratos.count.mockResolvedValue(1);

      const result = await repository.contractExists(10n);

      expect(result).toBe(true);
    });

    it('should return false when count === 0', async () => {
      prismaMock.contratos.count.mockResolvedValue(0);

      const result = await repository.contractExists(999n);

      expect(result).toBe(false);
    });
  });

  describe('updateState', () => {
    it('should update state and return domain entity', async () => {
      prismaMock.convenios.update.mockResolvedValue({
        ...rawConvenio,
        estado: 'ACTIVO',
      });

      const result = await repository.updateState(1n, 'ACTIVO');

      expect(result.estado).toBe('ACTIVO');
    });

    it('should throw EntityNotFoundException on P2025', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prismaMock.convenios.update.mockRejectedValue(p2025);

      await expect(repository.updateState(999n, 'ACTIVO')).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });
});
