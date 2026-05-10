import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConveniosService } from './convenios.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateConvenioUseCase } from './use-cases/create-convenio.use-case';
import { FindOneConvenioUseCase } from './use-cases/find-one-convenio.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';

describe('ConveniosService', () => {
  let service: ConveniosService;
  let createUseCase: CreateConvenioUseCase;
  let findOneUseCase: FindOneConvenioUseCase;
  let getDebtSummaryUseCase: GetDebtSummaryUseCase;

  // ── Shared mock data ───────────────────────────────────────────────────────

  const mockConvenioFromDb = {
    convenioId: BigInt(1),
    contratoId: BigInt(1),
    numeroCuotas: 6,
    abonoInicial: 50,
    deudaTotal: 215.75,
    diasMoraActual: 30,
    estado: {
      estadoConvenioId: BigInt(1),
      codigo: 'PREPARADO',
      nombre: 'Preparado',
    },
    fechaAprobacion: null,
    fechaPrimerPago: new Date('2026-06-01'),
    fechaProximoPago: new Date('2026-06-01'),
    montoPagadoActual: 0,
    motivo: null,
    createdAt: new Date('2026-05-10'),
    cuotaConvenio: [],
  };

  const mockEstadoDb = {
    estadoConvenioId: BigInt(1),
    codigo: 'PREPARADO',
    nombre: 'Preparado',
    descripcion: 'Convenio en preparación',
    orden: 1,
    activo: true,
  };

  const mockEstadoCuotaDb = {
    estadoCuotaConvenioId: BigInt(1),
    codigo: 'PENDIENTE',
    nombre: 'Pendiente',
    descripcion: 'Cuota pendiente de pago',
    orden: 1,
    activo: true,
  };

  const mockPrisma = {
    estadoConvenio: { findMany: jest.fn() },
    estadoCuotaConvenio: { findMany: jest.fn() },
    convenios: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    cuotaConvenio: { findMany: jest.fn() },
  };

  const mockCreateUseCase = { execute: jest.fn() };
  const mockFindOneUseCase = { execute: jest.fn() };
  const mockGetDebtSummaryUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConveniosService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CreateConvenioUseCase, useValue: mockCreateUseCase },
        { provide: FindOneConvenioUseCase, useValue: mockFindOneUseCase },
        { provide: GetDebtSummaryUseCase, useValue: mockGetDebtSummaryUseCase },
      ],
    }).compile();

    service = module.get<ConveniosService>(ConveniosService);
    createUseCase = module.get<CreateConvenioUseCase>(CreateConvenioUseCase);
    findOneUseCase = module.get<FindOneConvenioUseCase>(FindOneConvenioUseCase);
    getDebtSummaryUseCase = module.get<GetDebtSummaryUseCase>(
      GetDebtSummaryUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── Catálogos ──────────────────────────────────────────────────────────────

  describe('findAllEstadosConvenio', () => {
    it('should return mapped estado convenio catalog', async () => {
      mockPrisma.estadoConvenio.findMany.mockResolvedValue([mockEstadoDb]);

      const result = await service.findAllEstadosConvenio();

      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('PREPARADO');
      expect(result[0].estadoConvenioId).toBe(1); // Number, not BigInt
      expect(mockPrisma.estadoConvenio.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { activo: true } }),
      );
    });

    it('should return empty array when no estados configured', async () => {
      mockPrisma.estadoConvenio.findMany.mockResolvedValue([]);
      const result = await service.findAllEstadosConvenio();
      expect(result).toEqual([]);
    });
  });

  describe('findAllEstadosCuotaConvenio', () => {
    it('should return mapped estado cuota catalog', async () => {
      mockPrisma.estadoCuotaConvenio.findMany.mockResolvedValue([
        mockEstadoCuotaDb,
      ]);

      const result = await service.findAllEstadosCuotaConvenio();

      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('PENDIENTE');
      expect(result[0].estadoCuotaConvenioId).toBe(1); // Number, not BigInt
    });
  });

  // ── Deuda ─────────────────────────────────────────────────────────────────

  describe('getDebtSummary', () => {
    it('should delegate to GetDebtSummaryUseCase', async () => {
      const mockSummary = { contratoId: '1', deudaTotal: 200, prefacturas: [] };
      mockGetDebtSummaryUseCase.execute.mockResolvedValue(mockSummary);

      const result = await service.getDebtSummary('1');

      expect(result).toEqual(mockSummary);
      expect(getDebtSummaryUseCase.execute).toHaveBeenCalledWith(BigInt('1'));
    });
  });

  // ── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should delegate to CreateConvenioUseCase and return mapped response', async () => {
      const dto = {
        contratoId: '1',
        numeroCuotas: 6,
        abonoInicial: 50,
        fechaPrimerPago: '2026-06-01',
      };
      mockCreateUseCase.execute.mockResolvedValue(mockConvenioFromDb);

      const result = await service.create(dto);

      expect(result.convenioId).toBe('1');
      expect(result.contratoId).toBe('1');
      expect(result.estado.codigo).toBe('PREPARADO');
      expect(createUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  // ── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return all convenios when no contratoId filter', async () => {
      mockPrisma.convenios.findMany.mockResolvedValue([mockConvenioFromDb]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].convenioId).toBe('1');
      expect(mockPrisma.convenios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null } }),
      );
    });

    it('should filter by contratoId when provided', async () => {
      mockPrisma.convenios.findMany.mockResolvedValue([mockConvenioFromDb]);

      await service.findAll('1');

      expect(mockPrisma.convenios.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ contratoId: BigInt('1') }),
        }),
      );
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should delegate to FindOneConvenioUseCase and return mapped response', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(mockConvenioFromDb);

      const result = await service.findOne('1');

      expect(result.convenioId).toBe('1');
      expect(findOneUseCase.execute).toHaveBeenCalledWith(BigInt('1'));
    });
  });

  // ── cancel (anular) ────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('should update estado to ANULADO and set deletedAt', async () => {
      mockFindOneUseCase.execute.mockResolvedValue(mockConvenioFromDb);
      mockPrisma.estadoConvenio.findMany.mockResolvedValue([
        { estadoConvenioId: BigInt(6), codigo: 'ANULADO' },
      ]);

      // Para findUnique de estadoConvenio ANULADO
      const prismaFull = mockPrisma as any;
      if (!prismaFull.estadoConvenio.findUnique) {
        prismaFull.estadoConvenio.findUnique = jest.fn();
      }
      prismaFull.estadoConvenio.findUnique.mockResolvedValue({
        estadoConvenioId: BigInt(6),
      });

      mockPrisma.convenios.update.mockResolvedValue({
        ...mockConvenioFromDb,
        estado: {
          estadoConvenioId: BigInt(6),
          codigo: 'ANULADO',
          nombre: 'Anulado',
        },
        deletedAt: new Date(),
      });

      const result = await service.cancel('1');

      expect(result.estado.codigo).toBe('ANULADO');
      expect(mockPrisma.convenios.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { convenioId: BigInt('1') },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });
  });
});
